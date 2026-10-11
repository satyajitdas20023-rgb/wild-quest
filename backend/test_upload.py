import requests

image_path = r"C:\Users\Satyajit\Downloads\duck.jpeg"

with open(image_path, "rb") as image:
    response = requests.post(
        "http://127.0.0.1:5000/identify/group-test",
        files={"image": image},
    )

print(response.status_code)
print(response.json())