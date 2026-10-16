import os

import json

import re

import math

import random

import time

import threading

from concurrent.futures import ThreadPoolExecutor

import requests

from io import BytesIO

from flask import Flask, jsonify, request

from flask_cors import CORS

from dotenv import load_dotenv

from google import genai

from google.genai import types

from PIL import Image, UnidentifiedImageError

try:

          import rasterio

except ImportError:     # Keep the existing backend routes available without this optional dependency.

          rasterio = None

load_dotenv()

app = Flask(__name__)

CORS(app)

# Prefer the Gemma-specific variable, while keeping the previous key name compatible.

# Google AI Studio API keys work for the hosted Gemma models supported by this API.

API_KEY = os.getenv("GEMMA_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=API_KEY) if API_KEY else None

MODEL_NAME = "gemma-4-26b-a4b-it"

GROUPS = {

          "bird": "Bird",

          "mammal": "Mammal",

          "reptile": "Reptile",

          "amphibian": "Amphibian",

          "fish": "Fish",

          "insect": "Insect",

          "arachnid": "Arachnid",

          "crustacean": "Crustacean",

          "mollusc": "Mollusc",

          "other_invertebrate": "Other invertebrate",

          "plant": "Plant",

          "fungus": "Fungus",

          "other": "Other / uncertain",

}

def check_api():

          if client is None:

                    return jsonify({"error": "No Google AI API key found. Add GEMMA_API_KEY or keep your existing GEMINI_API_KEY in backend/.env, then restart Flask."}), 500

          return None

def extract_json(text):

          text = (text or "").strip()

          text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)

          text = re.sub(r"\s*```$", "", text)

          start, end = text.find("{"), text.rfind("}")

          if start < 0 or end < start:

                    raise ValueError("Model did not return valid JSON")

          return json.loads(text[start:end + 1])

def read_image_upload():

          if "image" not in request.files:

                    return None, (jsonify({"error": "No image uploaded. Use the form field name 'image'."}), 400)

          file = request.files["image"]

          raw = file.read()

          if not raw:

                    return None, (jsonify({"error": "The uploaded image is empty."}), 400)

          try:

                    image = Image.open(BytesIO(raw))

                    image.verify()

                    mime = file.mimetype if file.mimetype and file.mimetype.startswith("image/") else "image/jpeg"

          except (UnidentifiedImageError, OSError, ValueError):

                    return None, (jsonify({"error": "That file could not be read as an image."}), 400)

          return (raw, mime), None

def ask_gemma(image_bytes, mime_type, prompt):

          """Call the hosted Gemma model with text and image input."""

          response = client.models.generate_content(

                    model=MODEL_NAME,

                    contents=[

                              prompt,

                              types.Part.from_bytes(data=image_bytes, mime_type=mime_type),

                    ],

          )

          return extract_json(response.text)

@app.get("/")

def home():

          return jsonify({"message": "WildQuest backend is running!", "status": "success", "model": MODEL_NAME})

@app.get("/health")

def health():

          return jsonify({"status": "healthy", "model": MODEL_NAME, "provider": "Google AI API (Gemma)", "api_key_configured": bool(API_KEY)})

@app.post("/identify/group")

def suggest_organism_groups():

          error = check_api()

          if error:

                    return error

          uploaded, error_response = read_image_upload()

          if error_response:

                    return error_response

          image_bytes, mime_type = uploaded

          prompt = '''Inspect this image for the main visible organism. Return JSON only in this exact shape:

{"suggested_groups":[{"category":"mammal","label":"Mammal"},{"category":"bird","label":"Bird"},{"category":"reptile","label":"Reptile"}]}

Choose up to 3 distinct plausible groups, ranked best first. Allowed category values: bird, mammal, reptile, amphibian, fish, insect, arachnid, crustacean, mollusc, other_invertebrate, plant, fungus, other. Do not guess a species at this stage. If no organism is visible, return category other.'''

          try:

                    result = ask_gemma(image_bytes, mime_type, prompt)

                    suggestions = []

                    for item in result.get("suggested_groups", [])[:3]:

                              category = str(item.get("category", "other")).lower()

                              if category not in GROUPS:

                                        category = "other"

                              if category not in [x["category"] for x in suggestions]:

                                        suggestions.append({"category": category, "label": GROUPS[category]})

                    if not suggestions:

                              suggestions = [{"category": "other", "label": GROUPS["other"]}]

                    return jsonify({"status": "success", "suggested_groups": suggestions, "model": MODEL_NAME})

          except Exception as exc:

                    app.logger.exception("Gemma group identification failed")

                    return jsonify({"error": "Gemma could not analyse this image. Check your Google AI API key, model access, and quota.", "details": str(exc)}), 502

@app.post("/identify/image")

def identify_image():

          error = check_api()

          if error:

                    return error

          uploaded, error_response = read_image_upload()

          if error_response:

                    return error_response

          image_bytes, mime_type = uploaded

          requested_category = (request.form.get("category") or "auto").strip().lower()

          if requested_category != "auto" and requested_category not in GROUPS:

                    return jsonify({"error": "Unsupported organism group."}), 400

          chosen_label = GROUPS.get(requested_category, "any organism") if requested_category != "auto" else "any organism"

          prompt = f'''First decide whether the MAIN subject of this photo is suitable for a biodiversity field Compendium. Return JSON only in this exact shape:

{{"valid_subject":true,"subject_type":"animal|plant|fungus|human|object|landscape|uncertain","species":"common name or best broad identification","scientific_name":"scientific name if reasonably certain, otherwise empty string","category":"one allowed category key","alternatives":["alternative 1","alternative 2"],"description":"one short sentence describing visible evidence","identification_status":"identified or uncertain"}}

Set valid_subject=true ONLY when the main visible subject is clearly a non-human animal, plant, or fungus. Set valid_subject=false for a person/human/portrait, chair/furniture, tools, electronics, vehicles, toys, buildings, food, a general landscape, a screenshot, or an image without a clearly identifiable animal, plant, or fungus. Do not classify a human as a mammal for this app. If the subject is ambiguous or cannot be identified as a biodiversity subject, use subject_type="uncertain" and valid_subject=false. The category hint is {chosen_label}; treat it as a hint only, never as proof. Do not invent species names or scientific names.

Allowed category keys: bird, mammal, reptile, amphibian, fish, insect, arachnid, crustacean, mollusc, other_invertebrate, plant, fungus, other. For a valid subject, use subject_type animal, plant, or fungus. For anything else, valid_subject must be false.'''

          try:

                    result = ask_gemma(image_bytes, mime_type, prompt)

                    valid_subject = result.get("valid_subject") is True

                    subject_type = str(result.get("subject_type") or "uncertain").strip().lower()

                    if not valid_subject or subject_type not in {"animal", "plant", "fungus"}:

                              return jsonify({

                                        "status": "rejected",

                                        "rejected": True,

                                        "valid_subject": False,

                                        "subject_type": subject_type,

                                        "error": "This photo does not clearly show an animal, plant or fungus. It was not added to your Compendium.",

                                        "model": MODEL_NAME,

                              }), 422

                    species = str(result.get("species", "Unknown organism")).strip() or "Unknown organism"

                    scientific_name = str(result.get("scientific_name", "")).strip() or "Scientific name not verified"

                    category = str(result.get("category", requested_category if requested_category != "auto" else "other")).lower()

                    if category not in GROUPS:

                              category = "other"

                    alternatives = result.get("alternatives", [])

                    if not isinstance(alternatives, list):

                              alternatives = []

                    predictions = [{"species": species, "scientific_name": scientific_name}]

                    predictions.extend({"species": str(name), "scientific_name": "Not verified"} for name in alternatives[:2] if str(name).strip())

                    return jsonify({

                              "status": "success",

                              "valid_subject": True,

                              "subject_type": subject_type,

                              "category": category,

                              "category_label": GROUPS[category],

                              "group_candidates": [],

                              "species": species,

                              "scientific_name": scientific_name,

                              "predictions": predictions,

                              "description": str(result.get("description", "")),

                              "identification_status": "unverified_suggestion" if str(result.get("identification_status", "uncertain")).lower() not in ("identified", "certain") else "unverified_suggestion",

                              "notice": "Gemma's result is an AI suggestion, not a confirmed species identification. Check uncertain results against a trusted source.",

                              "model": MODEL_NAME,

                    })

          except Exception as exc:

                    app.logger.exception("Gemma image identification failed")

                    return jsonify({"error": "Gemma could not identify this image. Check your Google AI API key, model access, and quota.", "details": str(exc)}), 502

WORLD_COVER_CLASSES = {

          10: "Tree cover",

          20: "Shrubland",

          30: "Grassland",

          40: "Cropland",

          50: "Built-up",

          60: "Bare / sparse vegetation",

          70: "Snow and ice",

          80: "Permanent water bodies",

          90: "Herbaceous wetland",

          95: "Mangroves",

          100: "Moss and lichen",

}

def worldcover_tile_id(latitude, longitude):

          """Return the ESA WorldCover 3-degree tile identifier for a WGS84 point."""

          lat_origin = math.floor(latitude / 3) * 3

          lon_origin = math.floor(longitude / 3) * 3

          lat_prefix = "N" if lat_origin >= 0 else "S"

          lon_prefix = "E" if lon_origin >= 0 else "W"

          return f"{lat_prefix}{abs(lat_origin):02d}{lon_prefix}{abs(lon_origin):03d}"

def worldcover_sample_points(latitude, longitude):

          """Create a sparse grid of sample points within approximately 10 km of GPS."""

          offsets_km = (-8, -4, 0, 4, 8)

          cos_latitude = max(abs(math.cos(math.radians(latitude))), 0.05)

          points = []

          for north_km in offsets_km:

                    for east_km in offsets_km:

                              if math.hypot(north_km, east_km) > 10:

                                        continue

                              sample_lat = latitude + north_km / 111.32

                              sample_lon = longitude + east_km / (111.32 * cos_latitude)

                              if not -90 < sample_lat < 90:

                                        continue

                              # Wrap across the antimeridian if needed.

                              sample_lon = ((sample_lon + 180) % 360) - 180

                              points.append((sample_lat, sample_lon))

          return points

@app.get("/explore/habitat")

def explore_habitat():

          """Sample ESA WorldCover 2021 land-cover classes around the user's GPS point."""

          try:

                    latitude = float(request.args.get("lat", ""))

                    longitude = float(request.args.get("lon", ""))

          except (TypeError, ValueError):

                    return jsonify({"error": "Valid latitude and longitude values are required."}), 400

          if not (-90 < latitude < 90 and -180 <= longitude <= 180):

                    return jsonify({"error": "Coordinates are outside the supported latitude/longitude range."}), 400

          if rasterio is None:

                    return jsonify({

                              "error": "ESA WorldCover sampling needs rasterio. Install it in the backend environment with: python -m pip install rasterio"

                    }), 503

          points_by_tile = {}

          for sample_lat, sample_lon in worldcover_sample_points(latitude, longitude):

                    tile_id = worldcover_tile_id(sample_lat, sample_lon)

                    points_by_tile.setdefault(tile_id, []).append((sample_lat, sample_lon))

          class_counts = {}

          valid_samples = 0

          try:

                    # The public ESA COGs support partial remote reads, so the app does not need

                    # to download the full global WorldCover dataset.

                    with rasterio.Env(

                              GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR",

                              CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif",

                              GDAL_HTTP_TIMEOUT="20",

                              GDAL_HTTP_MAX_RETRY="2",

                    ):

                              for tile_id, tile_points in points_by_tile.items():

                                        url = (

                                                  "https://esa-worldcover.s3.eu-central-1.amazonaws.com/"

                                                  f"v200/2021/map/ESA_WorldCover_10m_2021_v200_{tile_id}_Map.tif"

                                        )

                                        with rasterio.open(f"/vsicurl/{url}") as dataset:

                                                  if dataset.crs and str(dataset.crs).upper() not in ("EPSG:4326", "OGC:CRS84"):

                                                            from rasterio.warp import transform

                                                            transformed = transform("EPSG:4326", dataset.crs, [p[1] for p in tile_points], [p[0] for p in tile_points])

                                                            coordinates = list(zip(transformed[0], transformed[1]))

                                                  else:

                                                            coordinates = [(sample_lon, sample_lat) for sample_lat, sample_lon in tile_points]

                                                  for pixel in dataset.sample(coordinates):

                                                            if len(pixel) == 0:

                                                                      continue

                                                            try:

                                                                      class_code = int(pixel[0])

                                                            except (TypeError, ValueError, OverflowError):

                                                                      continue

                                                            if class_code not in WORLD_COVER_CLASSES:

                                                                      continue

                                                            class_counts[class_code] = class_counts.get(class_code, 0) + 1

                                                            valid_samples += 1

          except Exception as exc:

                    app.logger.warning("ESA WorldCover lookup failed: %s", exc, exc_info=True)

                    return jsonify({"error": "Could not retrieve ESA WorldCover habitat data right now. Check the backend connection and try again."}), 502

          if valid_samples == 0:

                    return jsonify({"error": "No ESA WorldCover pixels were available for this location."}), 502

          classes = [

                    {

                              "code": code,

                              "name": WORLD_COVER_CLASSES[code],

                              "samples": count,

                              "samplePercent": round((count / valid_samples) * 100),

                    }

                    for code, count in sorted(class_counts.items(), key=lambda pair: pair[1], reverse=True)

          ]

          return jsonify({

                    "source": "ESA WorldCover 2021 v200",

                    "year": 2021,

                    "resolutionMeters": 10,

                    "samplingRadiusKm": 10,

                    "attemptedSamples": sum(len(points) for points in points_by_tile.values()),

                    "validSamples": valid_samples,

                    "dominantHabitat": classes[0]["name"] if classes else None,

                    "classes": classes,

                    "attribution": "© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium",

                    "note": "Class percentages are the share of sampled points, not exact land-area proportions. Land cover is habitat context, not confirmation that a species is present.",

          })


# Nearby landscapes use ESA WorldCover for *estimated habitat spots* and the
# lightweight Nominatim place-search API for named beaches, parks and reserves.
# The feature no longer depends on the Overpass interpreter API.
NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
_NOMINATIM_LOCK = threading.Lock()
_NOMINATIM_LAST_REQUEST_AT = 0.0


def _landscape_distance_km(latitude, longitude, other_latitude, other_longitude):
    phi1, phi2 = math.radians(latitude), math.radians(other_latitude)
    d_phi = phi2 - phi1
    d_lambda = math.radians((other_longitude - longitude + 180.0) % 360.0 - 180.0)
    value = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    return 6371.0088 * 2 * math.asin(min(1.0, math.sqrt(value)))


def _landscape_habitat_match(place_type, habitat_classes, distance_km):
    """Describe available ESA context without implying it was sampled at the named place.

    The frontend passes habitat classes sampled around the user's starting GPS point.
    Named OSM results can be several kilometres away, so this text deliberately calls
    it regional/start-point context rather than claiming the place itself has that cover.
    """
    if not isinstance(habitat_classes, list):
        habitat_classes = []

    normalized_classes = []
    for item in habitat_classes:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "").strip()
        if not name:
            continue
        try:
            percent = float(item.get("samplePercent", 0))
        except (TypeError, ValueError):
            percent = 0.0
        if not math.isfinite(percent):
            percent = 0.0
        normalized_classes.append((name, max(0, min(100, round(percent)))))

    normalized_classes.sort(key=lambda row: row[1], reverse=True)
    if not normalized_classes:
        return "Mapped place from OpenStreetMap; no ESA habitat summary was available for your starting location."

    place_type_lower = str(place_type or "").casefold()
    if "beach" in place_type_lower:
        relevant_words = ("permanent water", "wetland", "mangrove", "bare")
    elif "woodland" in place_type_lower or "park" in place_type_lower or "reserve" in place_type_lower or "protected" in place_type_lower:
        relevant_words = ("tree cover", "grassland", "wetland", "water")
    elif "wetland" in place_type_lower:
        relevant_words = ("wetland", "mangrove", "water")
    elif "water" in place_type_lower or "lake" in place_type_lower:
        relevant_words = ("permanent water", "wetland", "tree cover")
    else:
        relevant_words = ()

    selected = [row for row in normalized_classes if any(word in row[0].casefold() for word in relevant_words)]
    if not selected:
        selected = normalized_classes[:2]
    else:
        selected = selected[:2]

    summary = " and ".join(f"{name.lower()} ({percent}% of sampled points)" for name, percent in selected)
    return (
        f"Regional ESA context near your starting location: {summary}. "
        "These percentages describe sampled points around your starting location, "
        "not a survey of this named place."
    )


def _read_esa_landscape_samples(latitude, longitude, radius_km):
    """Sample ESA WorldCover across the search circle and return classified points.

    The grid gets coarser at larger radii to cap remote COG reads. Returned
    coordinates are sample points, not polygons or guaranteed visitor entrances.
    """
    if rasterio is None:
        return [], "ESA habitat sampling needs rasterio in the backend environment."

    # At 50 km this is ~3.1 km spacing (~800 samples); at 10 km it is 1 km.
    spacing_km = max(1.0, radius_km / 16.0)
    steps = int(math.ceil(radius_km / spacing_km))
    cosine = max(abs(math.cos(math.radians(latitude))), 0.05)
    points_by_tile = {}
    attempted = 0

    for grid_row in range(-steps, steps + 1):
        north_km = grid_row * spacing_km
        for grid_col in range(-steps, steps + 1):
            east_km = grid_col * spacing_km
            if math.hypot(north_km, east_km) > radius_km:
                continue
            sample_lat = latitude + north_km / 111.32
            if not -90 < sample_lat < 90:
                continue
            sample_lon = ((longitude + east_km / (111.32 * cosine) + 180.0) % 360.0) - 180.0
            tile_id = worldcover_tile_id(sample_lat, sample_lon)
            points_by_tile.setdefault(tile_id, []).append({
                "latitude": sample_lat,
                "longitude": sample_lon,
                "gridRow": grid_row,
                "gridCol": grid_col,
                "northKm": north_km,
                "eastKm": east_km,
            })
            attempted += 1

    classified = []
    failed_tiles = []
    try:
        with rasterio.Env(
            GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR",
            CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif",
            GDAL_HTTP_TIMEOUT="12",
            GDAL_HTTP_MAX_RETRY="1",
            GDAL_CACHEMAX=64,
        ):
            for tile_id, tile_points in points_by_tile.items():
                url = (
                    "https://esa-worldcover.s3.eu-central-1.amazonaws.com/"
                    f"v200/2021/map/ESA_WorldCover_10m_2021_v200_{tile_id}_Map.tif"
                )
                try:
                    with rasterio.open(f"/vsicurl/{url}") as dataset:
                        # Official WorldCover tiles are distributed in EPSG:4326.
                        coordinates = [(point["longitude"], point["latitude"]) for point in tile_points]
                        for point, pixel in zip(tile_points, dataset.sample(coordinates)):
                            if not pixel:
                                continue
                            try:
                                code = int(pixel[0])
                            except (TypeError, ValueError, OverflowError):
                                continue
                            if code not in WORLD_COVER_CLASSES:
                                continue
                            classified.append({**point, "code": code})
                except Exception as exc:
                    failed_tiles.append(tile_id)
                    app.logger.info("ESA tile read failed for nearby landscapes (%s): %s", tile_id, exc)
    except Exception as exc:
        app.logger.warning("ESA landscape sampling could not start: %s", exc)
        return [], "ESA habitat spots could not be sampled this time."

    warning = None
    if failed_tiles:
        warning = "Some ESA map tiles could not be read; habitat results may be incomplete."
    if not classified and not warning:
        warning = "No ESA land-cover samples were available for this area."
    return classified, warning


def _esa_habitat_spots(latitude, longitude, radius_km):
    """Turn repeated ESA land-cover samples into approximate habitat pins.

    The grouping is spatially coarse by design: it suggests places to investigate,
    not a boundary-level identification of a lake, woodland or wetland.
    """
    samples, warning = _read_esa_landscape_samples(latitude, longitude, radius_km)
    categories = {
        "woodland": {
            "codes": {10},
            "minimumSamples": 2,
            "type": "Woodland habitat (ESA)",
            "name": "Estimated woodland habitat spot",
            "cover_name": "Tree cover",
        },
        "water": {
            "codes": {80},
            "minimumSamples": 1,
            "type": "Water-body habitat (ESA)",
            "name": "Estimated water-body habitat spot",
            "cover_name": "Permanent water bodies",
        },
        "wetland": {
            "codes": {90, 95},
            "minimumSamples": 1,
            "type": "Wetland habitat (ESA)",
            "name": "Estimated wetland habitat spot",
            "cover_name": "Wetland / mangrove cover",
        },
    }

    results = []
    # Divide the sample circle into 5 km cells. Two or more matching samples make
    # a stronger candidate than a single isolated pixel. The pin is still approximate.
    for category_key, meta in categories.items():
        buckets = {}
        for point in samples:
            if point["code"] not in meta["codes"]:
                continue
            region = (math.floor(point["northKm"] / 5.0), math.floor(point["eastKm"] / 5.0))
            buckets.setdefault(region, []).append(point)

        candidates = []
        for region_points in buckets.values():
            if len(region_points) < meta["minimumSamples"]:
                continue
            # Choose a valid classified sample close to the centre of this group.
            mean_lat = sum(item["latitude"] for item in region_points) / len(region_points)
            mean_lon = sum(item["longitude"] for item in region_points) / len(region_points)
            chosen = min(
                region_points,
                key=lambda item: _landscape_distance_km(
                    mean_lat, mean_lon, item["latitude"], item["longitude"]
                ),
            )
            chosen_distance = _landscape_distance_km(
                latitude, longitude, chosen["latitude"], chosen["longitude"]
            )
            candidates.append((chosen_distance, chosen, len(region_points)))

        candidates.sort(key=lambda item: item[0])
        selected = []
        for distance, point, sample_count in candidates:
            if any(
                _landscape_distance_km(
                    point["latitude"], point["longitude"], chosen["latitude"], chosen["longitude"]
                ) < 3.0
                for _, chosen, _ in selected
            ):
                continue
            selected.append((distance, point, sample_count))
            if len(selected) >= 3:
                break

        for index, (distance, point, sample_count) in enumerate(selected, start=1):
            pin_lat = round(point["latitude"], 6)
            pin_lon = round(point["longitude"], 6)
            results.append({
                "id": f"esa:{category_key}:{index}:{point['gridRow']}:{point['gridCol']}",
                "osmType": None,
                "osmId": None,
                "name": meta["name"],
                "type": meta["type"],
                "latitude": pin_lat,
                "longitude": pin_lon,
                "distanceKm": round(distance, 2),
                "habitatMatch": f"ESA WorldCover samples indicate {meta['cover_name'].lower()} in this area.",
                "mapUrl": f"https://www.openstreetmap.org/?mlat={pin_lat}&mlon={pin_lon}#map=14/{pin_lat}/{pin_lon}",
                "source": "ESA WorldCover 2021 v200",
                "approximate": True,
                "sampleCount": sample_count,
            })
    return results, warning


def _nominatim_place_type(item, query_term):
    """Accept actual natural destinations, not nearby neighbourhoods returned for a text query."""
    extra = item.get("extratags") if isinstance(item.get("extratags"), dict) else {}
    address = item.get("address") if isinstance(item.get("address"), dict) else {}
    feature_class = str(item.get("class") or item.get("category") or "").casefold()
    feature_type = str(item.get("type") or "").casefold()
    addresstype = str(item.get("addresstype") or "").casefold()
    natural = str(extra.get("natural") or "").casefold()
    leisure = str(extra.get("leisure") or "").casefold()
    boundary = str(extra.get("boundary") or "").casefold()
    place_tag = str(extra.get("place") or "").casefold()
    name = str(item.get("name") or "").casefold()
    display_name = str(item.get("display_name") or "").casefold()

    # Nominatim free-text searches sometimes return settlements/localities whose
    # OSM classification is unrelated to the requested natural destination.
    settlement_types = {
        "city", "town", "village", "suburb", "neighbourhood", "neighborhood",
        "quarter", "hamlet", "locality", "residential", "isolated_dwelling",
        "borough", "district", "city_district", "municipality", "county",
    }
    if place_tag in settlement_types or addresstype in settlement_types:
        return None
    if feature_class == "place" and feature_type in settlement_types:
        return None
    protected_words = (
        "nature reserve", "wildlife sanctuary", "sanctuary", "protected area",
        "national park", "reserve", "wildlife refuge",
    )
    if (
        leisure == "nature_reserve"
        or boundary == "protected_area"
        or feature_type in {"nature_reserve", "protected_area", "national_park"}
        or any(word in name for word in protected_words)
    ):
        return "Nature reserve / protected area"

    if natural == "beach" or (feature_class == "natural" and feature_type == "beach"):
        return "Beach"
    if query_term == "beach" and "beach" in (name or display_name):
        return "Beach"

    # Avoid calling a whole neighbourhood (e.g. "Koel Nagar") a park simply
    # because a fuzzy Nominatim search for "park" returned it. Require a park-like
    # OSM tag/classification and a destination-like name or explicit park word.
    park_words = ("park", "garden", "gardens", "botanical", "arboretum", "urban forest", "green space")
    looks_like_named_park = any(word in name for word in park_words)
    has_park_tag = leisure == "park" or (feature_class == "leisure" and feature_type == "park")
    if has_park_tag and looks_like_named_park:
        return "Park"
    return None


def _nominatim_request(query_term, params):
    """Call public Nominatim with a global 1 request/second app-level throttle."""
    global _NOMINATIM_LAST_REQUEST_AT
    with _NOMINATIM_LOCK:
        delay = 1.1 - (time.monotonic() - _NOMINATIM_LAST_REQUEST_AT)
        if delay > 0:
            time.sleep(delay)
        # Record request start even on network errors so retries still respect
        # Nominatim's public-service rate limit.
        _NOMINATIM_LAST_REQUEST_AT = time.monotonic()
        response = requests.get(
            NOMINATIM_SEARCH_URL,
            params={**params, "q": query_term},
            headers={"User-Agent": "WildQuest/1.0 (open-source biodiversity exploration project)"},
            timeout=(2.0, 3.0),
        )
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, list):
        raise ValueError("Nominatim returned an unexpected response format")
    return payload


def _named_osm_landscapes(latitude, longitude, radius_km, habitat_classes):
    """Best-effort text search for named beaches, parks and reserves (not exhaustive)."""
    latitude_delta = radius_km / 111.32
    cosine = max(abs(math.cos(math.radians(latitude))), 0.05)
    longitude_delta = min(180.0, radius_km / (111.32 * cosine))
    south = max(-85.0, latitude - latitude_delta)
    north = min(85.0, latitude + latitude_delta)
    west = max(-180.0, longitude - longitude_delta)
    east = min(180.0, longitude + longitude_delta)
    params = {
        "format": "jsonv2",
        "limit": 10,
        "viewbox": f"{west:.6f},{north:.6f},{east:.6f},{south:.6f}",
        "bounded": 1,
        "extratags": 1,
        "addressdetails": 1,
    }
    results = []
    warnings = []
    seen = set()
    for query_term in ("beach", "park", "nature reserve"):
        try:
            entries = _nominatim_request(query_term, params)
            for item in entries:
                if not isinstance(item, dict):
                    continue
                place_type = _nominatim_place_type(item, query_term)
                if not place_type:
                    continue
                try:
                    place_lat = float(item.get("lat"))
                    place_lon = float(item.get("lon"))
                except (TypeError, ValueError):
                    continue
                distance = _landscape_distance_km(latitude, longitude, place_lat, place_lon)
                if distance > radius_km:
                    continue
                osm_type = str(item.get("osm_type") or "").lower()
                osm_id = str(item.get("osm_id") or "")
                identity = f"osm:{osm_type}:{osm_id}" if osm_type and osm_id else f"geo:{place_lat:.5f}:{place_lon:.5f}"
                if identity in seen:
                    continue
                seen.add(identity)
                full_name = str(item.get("name") or item.get("display_name") or "Nearby mapped place").strip()
                display_name = full_name.split(",")[0].strip() or full_name
                map_url = (
                    f"https://www.openstreetmap.org/{osm_type}/{osm_id}"
                    if osm_type and osm_id
                    else f"https://www.openstreetmap.org/?mlat={place_lat}&mlon={place_lon}#map=14/{place_lat}/{place_lon}"
                )
                results.append({
                    "id": identity,
                    "osmType": osm_type or None,
                    "osmId": osm_id or None,
                    "name": display_name,
                    "type": place_type,
                    "latitude": place_lat,
                    "longitude": place_lon,
                    "distanceKm": round(distance, 2),
                    "habitatMatch": _landscape_habitat_match(place_type, habitat_classes, distance),
                    "mapUrl": map_url,
                    "source": "OpenStreetMap Nominatim",
                    "approximate": False,
                    "sampleCount": None,
                })
        except (requests.RequestException, ValueError) as exc:
            app.logger.info("Nominatim search for '%s' failed: %s", query_term, exc)
            warnings.append(f"Named {query_term} results are temporarily unavailable.")

    # Keep the closest and most useful results, not duplicate hits from multiple queries.
    results.sort(key=lambda item: (item["distanceKm"], item["name"].casefold()))
    return results[:9], warnings


def _top_landscape_recommendations(candidates, limit=3):
    """Return up to three nearby, category-diverse destinations."""
    ordered = sorted(
        candidates,
        key=lambda item: (
            float(item.get("distanceKm", float("inf"))),
            0 if str(item.get("source", "")).startswith("OpenStreetMap") else 1,
            str(item.get("name", "")).casefold(),
        ),
    )
    chosen = []
    chosen_ids = set()
    chosen_categories = set()

    # First pass: prioritize variety so the list isn't three nearly identical
    # woodland spots or three city parks when a different habitat is available.
    for item in ordered:
        identity = item.get("id")
        category = str(item.get("type") or "Other").casefold()
        if identity in chosen_ids or category in chosen_categories:
            continue
        chosen.append(item)
        chosen_ids.add(identity)
        chosen_categories.add(category)
        if len(chosen) >= limit:
            return chosen

    # If fewer than three different categories exist, fill remaining slots with
    # the next closest unique results.
    for item in ordered:
        identity = item.get("id")
        if identity in chosen_ids:
            continue
        chosen.append(item)
        chosen_ids.add(identity)
        if len(chosen) >= limit:
            break
    return chosen


@app.post("/explore/landscapes")
def explore_landscapes():
    """Combine ESA-based habitat estimates with named OSM beach/park/reserve searches.

    ESA covers woodland, water-body and wetland habitat spots. Nominatim is used
    separately for named beaches, parks and nature reserves; it is a text search
    and cannot guarantee every mapped feature in the area will be returned.
    """
    body = request.get_json(silent=True) or {}
    try:
        latitude = float(body.get("latitude"))
        longitude = float(body.get("longitude"))
        radius_km = float(body.get("radiusKm", 25))
    except (TypeError, ValueError):
        return jsonify({"error": "Valid latitude, longitude and radiusKm values are required."}), 400

    if not (-90 < latitude < 90 and -180 <= longitude <= 180):
        return jsonify({"error": "Coordinates are outside the supported latitude/longitude range."}), 400
    if not math.isfinite(radius_km) or radius_km < 5 or radius_km > 50:
        return jsonify({"error": "Choose a search radius between 5 and 50 km."}), 400

    raw_habitat_classes = body.get("habitatClasses", [])
    habitat_classes = raw_habitat_classes[:20] if isinstance(raw_habitat_classes, list) else []
    esa_spots, esa_warning = _esa_habitat_spots(latitude, longitude, radius_km)
    named_places, named_warnings = _named_osm_landscapes(latitude, longitude, radius_km, habitat_classes)
    all_landscapes = esa_spots + named_places
    landscapes = _top_landscape_recommendations(all_landscapes, limit=3)
    warnings = []
    if esa_warning:
        warnings.append(esa_warning)
    warnings.extend(named_warnings)

    # Use a partial-success response instead of failing the whole feature when one
    # data source is down. Even with no results, the frontend can show a useful message.
    status = "success" if landscapes and not warnings else "partial" if landscapes or warnings else "empty"
    return jsonify({
        "status": status,
        "source": "ESA WorldCover 2021 v200 + OpenStreetMap Nominatim",
        "sources": {
            "esa": "ESA WorldCover 2021 v200",
            "namedPlaces": "OpenStreetMap Nominatim",
        },
        "habitatContextSource": "ESA WorldCover 2021 v200" if habitat_classes else None,
        "radiusKm": radius_km,
        "count": len(landscapes),
        "totalCandidates": len(all_landscapes),
        "landscapes": landscapes,
        "warnings": warnings,
        "note": "ESA pins are approximate sample points within areas where nearby samples classify as tree cover, permanent water or wetlands. They are not named places or verified entrances. Beaches, parks and protected areas are best-effort named-place searches from OpenStreetMap Nominatim and are not exhaustive. Check access before travelling.",
        "attribution": "ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium. Place data © OpenStreetMap contributors.",
    })

def is_near_coast(latitude, longitude):

          """Best-effort check for an OpenStreetMap coastline within 10 km."""

          query = (

                    f'[out:json][timeout:7];'

                    f'way(around:10000,{latitude:.6f},{longitude:.6f})["natural"="coastline"];'

                    f'out ids;'

          )

          try:

                    response = requests.get(

                              "https://overpass-api.de/api/interpreter",

                              params={"data": query},

                              headers={"User-Agent": "WildQuest biodiversity explorer"},

                              timeout=9,

                    )

                    response.raise_for_status()

                    payload = response.json()

                    return bool(payload.get("elements")) if isinstance(payload, dict) else False

          except (requests.RequestException, ValueError) as exc:

                    # Coastal detection is a ranking hint only. If OSM is unavailable, continue

                    # with the inland ranking rather than failing the whole GBIF lookup.

                    app.logger.info("Coastal proximity check unavailable; using general wildlife ranking: %s", exc)

                    return False

def _normalized_photo_taxon(value):

          return " ".join(re.sub(r"[^a-z0-9\s]", "", str(value or "").casefold()).split())

def _lookup_taxon_photo(scientific_name):

          """Find an exact-taxon reference photo via iNaturalist, then Wikipedia pageimages."""

          expected = _normalized_photo_taxon(scientific_name)

          if not expected or len(scientific_name) > 160:

                    return None

          try:

                    response = requests.get(

                              "https://api.inaturalist.org/v1/taxa",

                              params={"q": scientific_name, "rank": "species", "is_active": "true", "per_page": 10},

                              headers={"User-Agent": "WildQuest/1.0 (biodiversity exploration app)"},

                              timeout=(2.5, 4),

                    )

                    response.raise_for_status()

                    payload = response.json()

                    for taxon in payload.get("results", []) if isinstance(payload, dict) else []:

                              if _normalized_photo_taxon(taxon.get("name")) != expected:

                                        continue

                              default_photo = taxon.get("default_photo") or {}

                              image_url = default_photo.get("medium_url") or default_photo.get("url")

                              if isinstance(image_url, str) and image_url.startswith("https://"):

                                        attribution = str(default_photo.get("attribution") or "").strip()

                                        license_code = str(default_photo.get("license_code") or "").strip()

                                        if license_code and license_code.casefold() not in attribution.casefold():

                                                  attribution = f"{attribution} · Licence: {license_code}" if attribution else f"Licence: {license_code}"

                                        return {"photo": image_url, "photoSource": "iNaturalist taxon photo", "photoAttribution": attribution}

          except (requests.RequestException, ValueError) as exc:

                    app.logger.info("iNaturalist reference-photo lookup failed for %s: %s", scientific_name, exc)

          # Scientific-name title lookup gives a second source without choosing an unrelated

          # image by a vague common-name search.

          try:

                    response = requests.get(

                              "https://en.wikipedia.org/w/api.php",

                              params={

                                        "action": "query", "format": "json", "prop": "pageimages",

                                        "piprop": "thumbnail", "pithumbsize": 700, "redirects": 1,

                                        "titles": scientific_name,

                              },

                              headers={"User-Agent": "WildQuest/1.0 (biodiversity exploration app)"},

                              timeout=(2.5, 4),

                    )

                    response.raise_for_status()

                    payload = response.json()

                    pages = payload.get("query", {}).get("pages", {}) if isinstance(payload, dict) else {}

                    for item in pages.values() if isinstance(pages, dict) else []:

                              thumbnail = item.get("thumbnail") or {}

                              image_url = thumbnail.get("source")

                              if isinstance(image_url, str) and image_url.startswith("https://"):

                                        return {"photo": image_url, "photoSource": "Wikipedia taxon page", "photoAttribution": "Reference image from Wikipedia; see source page for licensing details."}

          except (requests.RequestException, ValueError) as exc:

                    app.logger.info("Wikipedia reference-photo lookup failed for %s: %s", scientific_name, exc)

          return None

@app.get("/explore/photo")

def explore_taxon_photo():

          """Resolve a reference photo for one displayed species, only when the usual photo is missing."""

          scientific_name = str(request.args.get("scientificName") or "").strip()

          if not scientific_name or len(scientific_name) > 160:

                    return jsonify({"error": "A valid scientificName is required."}), 400

          result = _lookup_taxon_photo(scientific_name)

          if not result:

                    return jsonify({"photo": None, "source": "none", "message": "No reference photo was available for this taxon."})

          return jsonify(result)

@app.route("/explore/nearby", methods=["GET", "POST"])

def explore_nearby():

          """Build a broad, filtered GBIF candidate pool; the UI still displays at most five."""

          body = (request.get_json(silent=True) or {}) if request.method == "POST" else {}

          try:

                    latitude = float(body.get("latitude") if request.method == "POST" else request.args.get("lat", ""))

                    longitude = float(body.get("longitude") if request.method == "POST" else request.args.get("lon", ""))

          except (TypeError, ValueError):

                    return jsonify({"error": "Valid latitude and longitude values are required."}), 400

          if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):

                    return jsonify({"error": "Coordinates are outside the valid latitude/longitude range."}), 400

          def normalized_taxon(value):

                    return " ".join(re.sub(r"[^a-z0-9\s]", "", str(value or "").casefold()).split())

          existing_species = body.get("existingSpecies", []) if request.method == "POST" else []

          previously_shown_species = body.get("previouslyShownSpecies", []) if request.method == "POST" else []

          excluded_names = set()

          excluded_canonical_scientific_names = set()

          previously_shown_names = set()

          previously_shown_taxon_keys = set()

          for item in previously_shown_species if isinstance(previously_shown_species, list) else []:

                    if not isinstance(item, dict):

                              continue

                    for value in (item.get("name"), item.get("scientificName")):

                              normalized = normalized_taxon(value)

                              if normalized:

                                        previously_shown_names.add(normalized)

                    taxon_key = str(item.get("key") or "").strip()

                    if taxon_key:

                              previously_shown_taxon_keys.add(taxon_key)

          # Conservative common-name aliases help the Compendium filter work when an

          # older/unverified entry has no scientific name. These aliases are for

          # matching records, not for asserting that every common name is globally unique.

          compendium_taxon_aliases = {

                    "monitor lizard": "varanus bengalensis", "bengal monitor": "varanus bengalensis",

                    "dog": "canis lupus familiaris", "dogs": "canis lupus familiaris", "puppy": "canis lupus familiaris",

                    "golden retriever": "canis lupus familiaris", "labrador retriever": "canis lupus familiaris", "domestic dog": "canis lupus familiaris",

                    "cat": "felis catus", "cats": "felis catus", "kitten": "felis catus", "house cat": "felis catus", "domestic cat": "felis catus",

                    "cow": "bos taurus", "cows": "bos taurus", "cattle": "bos taurus", "domestic cow": "bos taurus",

                    "pigeon": "columba livia", "pigeons": "columba livia", "rock pigeon": "columba livia", "feral pigeon": "columba livia",

                    "crow": "corvus splendens", "house crow": "corvus splendens", "indian house crow": "corvus splendens",

                    "myna": "acridotheres tristis", "common myna": "acridotheres tristis", "indian myna": "acridotheres tristis",

                    "sparrow": "passer domesticus", "house sparrow": "passer domesticus",

                    "common house gecko": "hemidactylus frenatus", "house gecko": "hemidactylus frenatus",

          }

          for item in existing_species if isinstance(existing_species, list) else []:

                    if isinstance(item, dict):

                              normalized_common = normalized_taxon(item.get("name"))

                              normalized_scientific = normalized_taxon(item.get("scientificName"))

                              for normalized in (normalized_common, normalized_scientific):

                                        if normalized:

                                                  excluded_names.add(normalized)

                              if normalized_common in compendium_taxon_aliases:

                                        excluded_canonical_scientific_names.add(compendium_taxon_aliases[normalized_common])

                              if normalized_scientific and "not verified" not in normalized_scientific and "unknown" not in normalized_scientific and re.fullmatch(r"[a-z][a-z-]+(?:\s+[a-z][a-z-]+){1,2}", normalized_scientific):

                                        excluded_canonical_scientific_names.add(normalized_scientific)

          radius_km = 10.0

          latitude_delta = radius_km / 111.32

          min_latitude = max(-90.0, latitude - latitude_delta)

          max_latitude = min(90.0, latitude + latitude_delta)

          longitude_scale = max(abs(math.cos(math.radians(latitude))), 1e-6)

          longitude_delta = radius_km / (111.32 * longitude_scale)

          min_longitude = longitude - longitude_delta

          max_longitude = longitude + longitude_delta

          if longitude_delta >= 180:

                    longitude_ranges = [(-180.0, 180.0)]

          elif min_longitude < -180:

                    longitude_ranges = [(-180.0, max_longitude), (min_longitude + 360.0, 180.0)]

          elif max_longitude > 180:

                    longitude_ranges = [(min_longitude, 180.0), (-180.0, max_longitude - 360.0)]

          else:

                    longitude_ranges = [(min_longitude, max_longitude)]

          # The old lookup inspected only the first 300 occurrence records. Fetch up to

          # 1,200 per longitude window so less frequently represented taxa have a chance

          # to enter the candidate pool. The final display is still capped at five.

          records = []

          page_errors = []

          for range_min_longitude, range_max_longitude in longitude_ranges:

                    for offset in (0, 300, 600, 900):

                              try:

                                        response = requests.get(

                                                  "https://api.gbif.org/v1/occurrence/search",

                                                  params={

                                                            "decimalLatitude": f"{min_latitude},{max_latitude}",

                                                            "decimalLongitude": f"{range_min_longitude},{range_max_longitude}",

                                                            "kingdomKey": 1,

                                                            "hasCoordinate": "true",

                                                            "hasGeospatialIssue": "false",

                                                            "limit": 300,

                                                            "offset": offset,

                                                  },

                                                  timeout=18,

                                        )

                                        response.raise_for_status()

                                        payload = response.json()

                                        page_records = payload.get("results", []) if isinstance(payload, dict) else []

                                        if not isinstance(page_records, list) or not page_records:

                                                  break

                                        records.extend(page_records)

                                        reported_count = payload.get("count", 0) if isinstance(payload, dict) else 0

                                        if len(page_records) < 300 or (reported_count and offset + len(page_records) >= reported_count):

                                                  break

                              except (requests.RequestException, ValueError) as exc:

                                        app.logger.warning("GBIF occurrence page failed (offset %s): %s", offset, exc)

                                        page_errors.append(str(exc))

                                        break

          # Avoid double-counting a GBIF occurrence in case longitude windows overlap.

          unique_records = []

          seen_occurrences = set()

          for record in records:

                    occurrence_id = str(record.get("key") or record.get("gbifID") or record.get("occurrenceID") or "")

                    if occurrence_id and occurrence_id in seen_occurrences:

                              continue

                    if occurrence_id:

                              seen_occurrences.add(occurrence_id)

                    unique_records.append(record)

          records = unique_records

          if not records:

                    app.logger.warning("GBIF nearby lookup returned no records; page errors: %s", page_errors[:3])

                    return jsonify({"error": "Could not retrieve GBIF records right now, or no records were returned for this area. Please try again."}), 502

          def distance_km(record_latitude, record_longitude):

                    phi1 = math.radians(latitude)

                    phi2 = math.radians(record_latitude)

                    delta_phi = phi2 - phi1

                    delta_lambda = math.radians((record_longitude - longitude + 180.0) % 360.0 - 180.0)

                    haversine = (math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)

                    return 6371.0088 * 2.0 * math.asin(min(1.0, math.sqrt(haversine)))

          insect_orders = {

                    "lepidoptera", "coleoptera", "diptera", "hymenoptera", "hemiptera",

                    "orthoptera", "odonata", "blattodea", "mantodea", "dermaptera",

                    "phasmatodea", "thysanoptera", "trichoptera", "ephemeroptera", "plecoptera",

                    "siphonaptera", "strepsiptera", "neuroptera", "mecoptera", "psocodea",

                    "embioptera", "zoraptera", "grylloblattodea", "notoptera",

          }

          fish_classes = {"actinopterygii", "chondrichthyes", "myxini", "petromyzonti", "cephalaspidomorphi", "sarcopterygii", "elasmobranchii"}

          marine_invertebrate_classes = {

                    "cnidaria", "anthozoa", "hydrozoa", "scyphozoa", "cubozoa", "mollusca", "echinodermata", "porifera", "ctenophora",

                    "gastropoda", "bivalvia", "cephalopoda", "polyplacophora", "asteroidea", "echinoidea", "holothuroidea",

                    "ophiuroidea", "crinoidea", "branchiopoda", "maxillopoda", "hexanauplia", "thecostraca",

          }

          invertebrate_classes = {

                    "arachnida", "myriapoda", "entognatha", "crustacea", "malacostraca", "branchiopoda", "maxillopoda",

                    "hexanauplia", "thecostraca", "insecta", "mollusca", "gastropoda", "bivalvia", "cephalopoda",

                    "polyplacophora", "annelida", "nematoda", "platyhelminthes", "rotifera", "tardigrada", "bryozoa",

                    "brachiopoda", "porifera", "cnidaria", "echinodermata", "asteroidea", "echinoidea", "holothuroidea",

                    "ophiuroidea", "crinoidea", "ctenophora",

          }

          marine_habitat_terms = {"marine", "ocean", "coastal", "intertidal", "estuarine", "brackish", "littoral", "shore", "tidal", "saltwater", "sea water", "seawater"}

          coastal_name_terms = (

                    "gull", "tern", "sandpiper", "plover", "oystercatcher", "sanderling", "pelican", "cormorant",

                    "seabird", "sea bird", "shorebird", "shore bird", "dolphin", "whale", "porpoise", "seal",

                    "sea turtle", "marine turtle", "shark", "stingray", "manta", "seahorse", "sea snake", "mudskipper",

                    "dugong", "manatee", "octopus", "squid", "jellyfish", "starfish", "sea star", "sea cucumber",

                    "coral", "mussel", "oyster", "clam", "sea urchin", "crab", "mangrove", "estuary",

          )

          domestic_scientific_names = {

                    "bos taurus", "bos indicus", "canis familiaris", "canis lupus familiaris", "felis catus", "felis silvestris catus",

          }

          domestic_common_names = {

                    "cow", "cows", "cattle", "domestic cattle", "domestic cow", "dog", "dogs", "domestic dog", "domestic dogs",

                    "cat", "cats", "domestic cat", "domestic cats", "house cat", "feral cat", "golden retriever", "labrador retriever",

                    "labrador", "beagle", "german shepherd", "poodle", "persian cat", "siamese cat", "maine coon",

          }

          excluded_scientific_names = {

                    "rana temporaria", "hemidactylus frenatus", "hemidactylus mabouia",

          }

          coastal = is_near_coast(latitude, longitude)

          candidates = {}

          for record in records:

                    try:

                              record_latitude = float(record.get("decimalLatitude"))

                              record_longitude = float(record.get("decimalLongitude"))

                    except (TypeError, ValueError):

                              continue

                    distance = distance_km(record_latitude, record_longitude)

                    if distance > radius_km:

                              continue

                    kingdom = str(record.get("kingdom") or "").strip().casefold()

                    if kingdom and kingdom != "animalia":

                              continue

                    taxon_class = str(record.get("class") or "").strip().casefold()

                    taxon_order = str(record.get("order") or "").strip().casefold()

                    taxon_family = str(record.get("family") or "").strip().casefold()

                    scientific_name = str(record.get("species") or record.get("scientificName") or "").strip()

                    if not scientific_name:

                              continue

                    common_name = str(record.get("vernacularName") or scientific_name).strip()

                    normalized_scientific = normalized_taxon(scientific_name)

                    normalized_common = normalized_taxon(common_name)

                    searchable_name = f"{common_name} {scientific_name}".casefold()

                    # Skip species already displayed in earlier batches so Refresh advances through

                    # the next available nearby candidate pool instead of repeating the same cards.

                    if normalized_scientific in previously_shown_names or normalized_common in previously_shown_names:

                              continue

                    # Apply the explicit exclusions requested by the user, while preserving other

                    # native wildlife categories for Gemma to assess using taxonomy and location.

                    if (normalized_scientific in excluded_names or normalized_common in excluded_names or

                                        normalized_scientific in excluded_canonical_scientific_names):

                              continue

                    if normalized_scientific in domestic_scientific_names or normalized_common in domestic_common_names:

                              continue

                    if normalized_scientific in excluded_scientific_names:

                              continue

                    if "house gecko" in normalized_common or "common frog" in normalized_common:

                              continue

                    taxon_key = str(record.get("speciesKey") or record.get("acceptedTaxonKey") or normalized_scientific)

                    taxon_key = taxon_key.strip()

                    if taxon_key in previously_shown_taxon_keys:

                              continue

                    taxon_order_name = taxon_order

                    is_insect = taxon_class == "insecta" or taxon_order_name in insect_orders

                    is_bird = taxon_class == "aves"

                    is_fish = taxon_class in fish_classes

                    if taxon_order_name == "lepidoptera":

                              taxon_group = "Butterflies and moths"

                    elif is_insect:

                              taxon_group = "Other insects"

                    elif is_bird:

                              taxon_group = "Birds"

                    elif taxon_class == "mammalia":

                              taxon_group = "Mammals"

                    elif taxon_class == "reptilia":

                              taxon_group = "Reptiles"

                    elif taxon_class == "amphibia":

                              taxon_group = "Amphibians"

                    elif is_fish:

                              taxon_group = "Fish"

                    elif taxon_class in marine_invertebrate_classes:

                              taxon_group = "Marine invertebrates"

                    elif taxon_class == "arachnida" or taxon_order_name == "araneae":

                              taxon_group = "Arachnids"

                    elif taxon_class in invertebrate_classes:

                              taxon_group = "Other invertebrates"

                    elif taxon_class:

                              taxon_group = "Other vertebrates" if taxon_class in {

                                        "reptilia", "aves", "mammalia", "amphibia", "actinopterygii", "chondrichthyes",

                                        "myxini", "petromyzonti", "cephalaspidomorphi", "sarcopterygii", "elasmobranchii",

                              } else "Other animals"

                    else:

                              taxon_group = "Other animals"

                    habitat_text = str(record.get("habitat") or "").casefold()

                    explicitly_marine = any(term in habitat_text for term in marine_habitat_terms) or any(term in searchable_name for term in coastal_name_terms) or taxon_class in marine_invertebrate_classes

                    # Do not label every bird coastal simply because a coastline is nearby.

                    is_coastal_wildlife = explicitly_marine

                    photos = record.get("media") if isinstance(record.get("media"), list) else []

                    photo_media = next((media for media in photos if isinstance(media, dict) and media.get("type") == "StillImage" and isinstance(media.get("identifier"), str) and media["identifier"].startswith("https://")), None)

                    photo = photo_media.get("identifier") if photo_media else None

                    photo_source = "GBIF occurrence media" if photo else None

                    photo_attribution = str(photo_media.get("creator") or "").strip() if photo_media else ""

                    if photo_media:

                              photo_license = str(photo_media.get("license") or "").strip()

                              if photo_license:

                                        photo_attribution = f"{photo_attribution} · {photo_license}" if photo_attribution else photo_license

                    if taxon_key not in candidates:

                              candidates[taxon_key] = {

                                        "key": taxon_key,

                                        "name": common_name,

                                        "scientificName": scientific_name,

                                        "latitude": record_latitude,

                                        "longitude": record_longitude,

                                        "observedAt": record.get("eventDate"),

                                        "photo": photo,

                                        "photoSource": photo_source,

                                        "photoAttribution": photo_attribution,

                                        "source": "GBIF",

                                        "taxonClass": taxon_class,

                                        "taxonOrder": taxon_order,

                                        "taxonFamily": taxon_family,

                                        "taxonGroup": taxon_group,

                                        "isCoastalWildlife": is_coastal_wildlife,

                                        "nearbyRecordCount": 1,

                                        "_distanceKm": distance,

                                        "_randomOrder": random.random(),

                              }

                    else:

                              candidate = candidates[taxon_key]

                              candidate["nearbyRecordCount"] += 1

                              if not candidate.get("photo") and photo:

                                        candidate["photo"] = photo

                                        candidate["photoSource"] = photo_source

                                        candidate["photoAttribution"] = photo_attribution

                              if distance < candidate["_distanceKm"]:

                                        candidate["_distanceKm"] = distance

                                        candidate["latitude"] = record_latitude

                                        candidate["longitude"] = record_longitude

                                        candidate["observedAt"] = record.get("eventDate")

          if not candidates:

                    return jsonify({

                              "source": "GBIF",

                              "searchRadiusKm": radius_km,

                              "count": 0,

                              "candidatePoolCount": 0,

                              "candidates": [],

                              "recordsFetched": len(records),

                              "coastalLocation": coastal,

                              "rankingMode": "No candidates passed the wildlife and Compendium filters",

                              "species": [],

                              "filtersApplied": ["exclude Compendium matches", "exclude domestic cats/dogs/cattle", "exclude common frog and house gecko; keep eligible arachnids for Gemma to assess"],

                    })

          # Candidate groups are adaptive. Birds, wild mammals and Lepidoptera are

          # preferred, but all other eligible native-animal groups remain in the pool.

          inland_group_order = ["Birds", "Mammals", "Butterflies and moths", "Reptiles", "Amphibians", "Fish", "Other vertebrates", "Other insects", "Marine invertebrates", "Other invertebrates", "Arachnids", "Other animals"]

          coastal_group_order = ["Birds", "Marine invertebrates", "Mammals", "Butterflies and moths", "Fish", "Reptiles", "Amphibians", "Other vertebrates", "Other insects", "Other invertebrates", "Arachnids", "Other animals"]

          group_order = coastal_group_order if coastal else inland_group_order

          group_buckets = {}

          for candidate in candidates.values():

                    group_buckets.setdefault(candidate["taxonGroup"], []).append(candidate)

          def candidate_rank(candidate):

                    coastal_penalty = 0 if (coastal and candidate["isCoastalWildlife"]) else 1

                    return (

                              coastal_penalty,

                              candidate["nearbyRecordCount"],     # only a count in this fetched sample, not global rarity

                              candidate["_distanceKm"],

                              candidate["_randomOrder"],

                              candidate["scientificName"].casefold(),

                    )

          for bucket in group_buckets.values():

                    bucket.sort(key=candidate_rank)

          present_groups = list(group_buckets)

          ordered_groups = [group for group in group_order if group in present_groups]

          ordered_groups.extend(sorted(group for group in present_groups if group not in ordered_groups))

          # Round-robin all eligible groups to keep the broad candidate pool diverse.

          candidate_pool = []

          while len(candidate_pool) < 30:

                    added = False

                    for group in ordered_groups:

                              if group_buckets[group]:

                                        candidate_pool.append(group_buckets[group].pop(0))

                                        added = True

                                        if len(candidate_pool) >= 30:

                                                  break

                    if not added:

                              break

          # Provide reference photos for the first dozen candidates only. Gemma can rank

          # the full pool without forcing dozens of separate photo lookups.

          def inaturalist_photo(candidate):

                    scientific_name = str(candidate.get("scientificName") or "").strip()

                    if not scientific_name:

                              return None

                    try:

                              response = requests.get(

                                        "https://api.inaturalist.org/v1/taxa",

                                        params={"q": scientific_name, "rank": "species", "is_active": "true", "per_page": 10},

                                        headers={"User-Agent": "WildQuest/1.0 (biodiversity exploration app)"},

                                        timeout=(2.5, 4),

                              )

                              response.raise_for_status()

                              payload = response.json()

                    except (requests.RequestException, ValueError) as exc:

                              app.logger.info("iNaturalist photo lookup unavailable for %s: %s", scientific_name, exc)

                              return None

                    expected = normalized_taxon(scientific_name)

                    results = payload.get("results", []) if isinstance(payload, dict) else []

                    for taxon in results if isinstance(results, list) else []:

                              if normalized_taxon(taxon.get("name")) != expected:

                                        continue

                              default_photo = taxon.get("default_photo") or {}

                              image_url = default_photo.get("medium_url") or default_photo.get("url")

                              if not isinstance(image_url, str) or not image_url.startswith("https://"):

                                        continue

                              attribution = str(default_photo.get("attribution") or "").strip()

                              license_code = str(default_photo.get("license_code") or "").strip()

                              if license_code and license_code.casefold() not in attribution.casefold():

                                        attribution = f"{attribution} · Licence: {license_code}" if attribution else f"Licence: {license_code}"

                              return {"photo": image_url, "photoSource": "iNaturalist taxon photo", "photoAttribution": attribution}

                    return None

          missing_photos = [candidate for candidate in candidate_pool[:12] if not candidate.get("photo")]

          if missing_photos:

                    with ThreadPoolExecutor(max_workers=min(5, len(missing_photos))) as executor:

                              for candidate, image_result in zip(missing_photos, executor.map(inaturalist_photo, missing_photos)):

                                        if image_result:

                                                  candidate.update(image_result)

          species = []

          for candidate in candidate_pool:

                    count = candidate["nearbyRecordCount"]

                    if coastal and candidate["isCoastalWildlife"]:

                              priority_label = "Coastal / marine-linked candidate"

                    elif count <= 2:

                              priority_label = "Few records in fetched sample — not a global rarity claim"

                    else:

                              priority_label = candidate["taxonGroup"]

                    candidate["distanceKm"] = round(float(candidate.pop("_distanceKm", 0.0)), 2)

                    candidate.pop("_randomOrder", None)

                    candidate["priorityLabel"] = priority_label

                    species.append(candidate)

          return jsonify({

                    "source": "GBIF",

                    "searchRadiusKm": radius_km,

                    "count": min(5, len(species)),

                    "candidatePoolCount": len(species),

                    "displayLimit": 5,

                    "recordsFetched": len(records),

                    "partialResults": bool(page_errors),

                    "pageErrorCount": len(page_errors),

                    "coastalLocation": coastal,

                    "rankingMode": "broad coastal/marine-aware candidate pool for Gemma selection" if coastal else "broad taxonomically diverse wildlife candidate pool for Gemma selection",

                    "filtersApplied": ["exclude Compendium matches", "exclude domestic cats/dogs/cattle", "exclude common frog and house gecko; keep arachnids eligible for Gemma to assess"],

                    "rarityNote": "Lower nearbyRecordCount means fewer records in this fetched GBIF sample only; it does not establish global rarity or conservation status.",

                    "species": species[:5],

                    "candidates": species,

          })

@app.post("/explore/recommend")

def recommend_nearby_species():

          """Rank only supplied GBIF candidates using habitat evidence and hosted Gemma."""

          error = check_api()

          if error:

                    return error

          body = request.get_json(silent=True) or {}

          habitat = body.get("habitat") if isinstance(body.get("habitat"), dict) else {}

          candidates = body.get("species") if isinstance(body.get("species"), list) else []

          coastal = bool(body.get("coastalLocation"))

          # Only species actually returned by the nearby GBIF endpoint may be recommended.

          candidates = [item for item in candidates if isinstance(item, dict) and str(item.get("scientificName") or "").strip()]

          candidates = candidates[:30]

          if not candidates:

                    return jsonify({"source": "Gemma + GBIF + ESA WorldCover", "recommendations": [], "model": MODEL_NAME})

          safe_candidates = []

          candidate_by_name = {}

          for item in candidates:

                    scientific_name = str(item.get("scientificName") or "").strip()

                    normalized = " ".join(scientific_name.casefold().split())

                    if normalized in candidate_by_name:

                              continue

                    candidate_by_name[normalized] = item

                    safe_candidates.append({

                              "scientificName": scientific_name,

                              "commonName": str(item.get("name") or "").strip(),

                              "taxonGroup": str(item.get("taxonGroup") or "Animal").strip(),

                              "taxonClass": str(item.get("taxonClass") or "unknown").strip(),

                              "taxonOrder": str(item.get("taxonOrder") or "unknown").strip(),

                              "taxonFamily": str(item.get("taxonFamily") or "unknown").strip(),

                              "isCoastalWildlife": bool(item.get("isCoastalWildlife")),

                              "distanceFromUserKm": item.get("distanceKm"),

                              "nearbyRecordCountInFetchedSample": max(1, int(item.get("nearbyRecordCount") or 1)),

                              "observedAt": str(item.get("observedAt") or "Unknown"),

                    })

          habitat_context = {

                    "dominantHabitat": habitat.get("dominantHabitat"),

                    "classes": [

                              {"name": str(item.get("name") or ""), "samplePercent": item.get("samplePercent")}

                              for item in (habitat.get("classes") if isinstance(habitat.get("classes"), list) else [])[:4]

                              if isinstance(item, dict)

                    ],

                    "samplingRadiusKm": habitat.get("samplingRadiusKm", 10),

          }

          prompt = f'''You are WildQuest's evidence-based wildlife candidate ranker. Return JSON only in this exact shape:

{{"recommendations":[{{"scientificName":"exact candidate scientific name","reason":"one concise evidence-aware sentence","whereToLook":"short practical habitat guidance, ideally 4-12 words"}}]}}

Choose up to five recommendations from ONLY the supplied GBIF candidate list. Never invent species, change scientific names, or add candidates. The frontend will validate every name against this list. GBIF records show documented observations within about 10 km, not proof of present-day presence. ESA land-cover classes are broad context, not proof that an animal lives in a specific class. Never claim global rarity, threatened status, or current presence from these inputs alone.

How to choose the recommendations:

- You are making the final wildlife selection, not merely sorting a fixed hand-picked list. Use each candidate's common/scientific name, taxonomic class/order/family, coastal marker, nearest record distance, observation date, and record count as evidence. Use your general natural-history knowledge cautiously to judge likely interestingness and location fit, but never invent a candidate or claim a confirmed local presence.

- Select up to five genuinely interesting wild species that fit the user's location and context. Prefer a varied taxonomic mix; avoid filling the list with very similar species just because a group appears early in the input.

- Give good consideration to birds, wild mammals, butterflies and moths, but make the choice adaptive: wetlands/coasts may suit shorebirds or aquatic wildlife; woodland/grassland may suit local birds, mammals, and insects; other native taxa remain eligible if the candidates make them a good choice.

- Avoid domestic cattle/cows, domestic dogs, and domestic cats, plus the common frog and house geckos. The GBIF endpoint should already filter these; never reintroduce them.

- Arachnids are not automatically excluded and there is no special "tarantula-only" exception. Usually avoid ordinary, unremarkable small house/garden spiders; consider a notably large, unusual, or otherwise interesting spider only when the candidate's identity supports that assessment. Do not infer body size from an unsupported flag.

- If coastalLocation is true, favour clearly coastal/marine-linked candidates when appropriate. Do not label every bird or invertebrate as coastal.

- Consider candidates with fewer records in this fetched sample as potentially less frequently recorded locally, but record count is affected by sampling effort. Never claim global rarity, endangered status, or conservation status from this count alone.

- Explanations should be species-specific, concise, and evidence-aware. Say that GBIF documents occurrence records within the search radius, not current presence; describe habitat as context, not proof that the animal occupies a specific class.

- For every recommendation, provide a short whereToLook tip based on cautious natural-history knowledge and the supplied habitat context (for example, shore edges for shorebirds or flowering patches for butterflies). Do not claim the species is definitely there, invent precise coordinates, or overstate habitats absent from the evidence. If uncertain, say: Check suitable local habitat; sightings are not guaranteed.

- For every recommended species, add `whereToLook`: a short, practical microhabitat suggestion informed by the candidate's known natural history and the provided coastal/habitat context. Examples of the style are “Check sandy or muddy shore edges” for a suitable crab candidate, “Scan shallow water and reed margins” for a wetland bird, or “Look around flowering plants in sunny clearings” for a butterfly. These are style examples only; tailor the tip to the actual species and location.

- Give a general habitat or microhabitat, not made-up directions, an exact GPS spot, or a guarantee. Do not tell someone to go to the beach for a freshwater species, or infer a species' habitat from the fact that a coastline happens to be nearby. If you cannot suggest an informed habitat, return an empty string for `whereToLook` rather than inventing one.

- Keep `whereToLook` to about 4-12 words and make it useful to a person looking around outdoors. Use simple language and, when appropriate, a local habitat type such as beach edge, mudflat, tidal pool, reed bed, flowering grassland, tree canopy, rocky outcrop, stream bank, or woodland floor.

Coastal location: {str(coastal).lower()}.

Habitat evidence:

{json.dumps(habitat_context, ensure_ascii=False)}

GBIF candidates (the only allowed names):

{json.dumps(safe_candidates, ensure_ascii=False)}

'''

          try:

                    response = client.models.generate_content(model=MODEL_NAME, contents=[prompt])

                    parsed = extract_json(response.text)

                    raw_recommendations = parsed.get("recommendations", [])

                    if not isinstance(raw_recommendations, list):

                              raw_recommendations = []

                    recommendations = []

                    seen = set()

                    for entry in raw_recommendations:

                              if not isinstance(entry, dict):

                                        continue

                              normalized = " ".join(str(entry.get("scientificName") or "").casefold().split())

                              if normalized not in candidate_by_name or normalized in seen:

                                        continue

                              seen.add(normalized)

                              candidate = candidate_by_name[normalized]

                              reason = str(entry.get("reason") or "GBIF has a nearby occurrence record; habitat context is suggestive, not confirmation.").strip()

                              where_to_look = str(entry.get("whereToLook") or "").strip()

                              # Cap untrusted model text; the UI displays this as a practical suggestion, not a confirmed site.

                              recommendations.append({

                                        "scientificName": candidate["scientificName"],

                                        "reason": reason[:360],

                                        "whereToLook": where_to_look[:180],

                              })

                              if len(recommendations) >= 5:

                                        break

                    return jsonify({

                              "source": "Gemma ranked from GBIF candidates and ESA WorldCover context",

                              "model": MODEL_NAME,

                              "recommendations": recommendations[:5],

                              "candidateCount": len(safe_candidates),

                              "returnedCount": min(len(recommendations), 5),

                              "maximumRecommendations": 5,

                    })

          except Exception as exc:

                    app.logger.exception("Gemma wildlife recommendation failed")

                    return jsonify({"error": "Gemma could not rank nearby wildlife candidates.", "details": str(exc)}), 502

if __name__ == "__main__":

          app.run(debug=True, port=5000)
