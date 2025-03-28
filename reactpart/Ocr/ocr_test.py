from google.cloud import vision
import os

# Set the path to your service account key file
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/Users/lamasulieman/TravelManager-App/reactpart/Ocr/OcrKey.json"

# Initialize the client
client = vision.ImageAnnotatorClient()

def extract_text(image_path):
    with open(image_path, 'rb') as img_file:
        content = img_file.read()

    image = vision.Image(content=content)

    # Perform text detection
    response = client.text_detection(image=image)

    if response.error.message:
        raise Exception(f"Google Cloud Vision Error: {response.error.message}")

    annotations = response.text_annotations

    if not annotations:
        return "No text found."

    # The first element is the full text
    return annotations[0].description

# Test it
if __name__ == "__main__":
    image_path = "/Users/lamasulieman/TravelManager-App/reactpart/Ocr/testticket.png"  # <- Put your image file here
    text = extract_text(image_path)
    print("Extracted Text:\n", text)
