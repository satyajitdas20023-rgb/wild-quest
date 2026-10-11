import os
import base64
import json
import re
from io import BytesIO

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from PIL import Image, UnidentifiedImageError

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None
MODEL_NAME = "gemini-3.8-flash"

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
        return jsonify({"error": "GEMINI_API_KEY is missing. Add it to backend/.env and restart Flask."}), 500
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


def ask_gemini(image_bytes, mime_type, prompt):
    """Call the current Gemini Interactions API with an inline image."""
    interaction = client.interactions.create(
        model=MODEL_NAME,
        input=[
            {"type": "text", "text": prompt},
            {
                "type": "image",
                "data": base64.b64encode(image_bytes).decode("utf-8"),
                "mime_type": mime_type,
            },
        ],
        response_format={"type": "text", "mime_type": "application/json"},
    )
    return extract_json(interaction.output_text)


@app.get("/")
def home():
    return jsonify({"message": "WildQuest backend is running!", "status": "success", "model": MODEL_NAME})


@app.get("/health")
def health():
    return jsonify({"status": "healthy", "model": MODEL_NAME, "provider": "Google Gemini API", "api_key_configured": bool(API_KEY)})


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
        result = ask_gemini(image_bytes, mime_type, prompt)
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
        app.logger.exception("Gemini group identification failed")
        return jsonify({"error": "Gemini could not analyse this image. Check the API key, model access, and quota.", "details": str(exc)}), 502


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
    prompt = f'''Identify the main visible organism in this image. User-selected group: {chosen_label}. Treat this group as a hint, not proof; if the image clearly contradicts it, identify what is actually visible and explain uncertainty. Return JSON only in this shape:
{{"species":"common name or best broad identification","scientific_name":"scientific name if reasonably certain, otherwise empty string","category":"one allowed category key","alternatives":["alternative 1","alternative 2"],"description":"one short sentence describing visible evidence","identification_status":"identified or uncertain"}}
Allowed category keys: bird, mammal, reptile, amphibian, fish, insect, arachnid, crustacean, mollusc, other_invertebrate, plant, fungus, other. Identify only as specifically as the visual evidence supports. Do not invent a scientific name. If species-level identification is uncertain, use a broader common name and set identification_status to uncertain. The image may contain an animal, plant, fungus, or no clearly identifiable organism.'''
    try:
        result = ask_gemini(image_bytes, mime_type, prompt)
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
            "category": category,
            "category_label": GROUPS[category],
            "group_candidates": [],
            "species": species,
            "scientific_name": scientific_name,
            "predictions": predictions,
            "description": str(result.get("description", "")),
            "identification_status": "unverified_suggestion" if str(result.get("identification_status", "uncertain")).lower() not in ("identified", "certain") else "unverified_suggestion",
            "notice": "Gemini's result is an AI suggestion, not a confirmed species identification. Check uncertain results against a trusted source.",
            "model": MODEL_NAME,
        })
    except Exception as exc:
        app.logger.exception("Gemini image identification failed")
        return jsonify({"error": "Gemini could not identify this image. Check the API key, model access, and quota.", "details": str(exc)}), 502


if __name__ == "__main__":
    app.run(debug=True, port=5000)
