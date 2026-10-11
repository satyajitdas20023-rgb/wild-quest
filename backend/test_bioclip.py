
import torch
import open_clip
from PIL import Image

print("Loading BioCLIP 2...")

model_name = "hf-hub:imageomics/bioclip-2"

model, _, preprocess = open_clip.create_model_and_transforms(
    model_name
)
tokenizer = open_clip.get_tokenizer(model_name)

model.eval()
model.to("cpu")

print("Model loaded. Analyzing image...")

image_path = r"C:\Users\Satyajit\Downloads\kingfish.jpg"
image = preprocess(
    Image.open(image_path).convert("RGB")
).unsqueeze(0)

labels = [
    "a photograph of a white-throated kingfisher",
    "a photograph of a common myna",
    "a photograph of an Asian koel",
    "a photograph of a house sparrow",
    "a photograph of a rose-ringed parakeet",
    "a photograph of an unknown bird species",
]

text = tokenizer(labels)

with torch.no_grad():
    image_features = model.encode_image(image)
    text_features = model.encode_text(text)

    image_features /= image_features.norm(dim=-1, keepdim=True)
    text_features /= text_features.norm(dim=-1, keepdim=True)

    scores = (image_features @ text_features.T)[0]

for label, score in sorted(
    zip(labels, scores.tolist()),
    key=lambda item: item[1],
    reverse=True,
):
    print(f"{label}: {score:.3f}")

