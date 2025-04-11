const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const vision = require("@google-cloud/vision");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { saveOCRResult } = require("./models/ocrModel");
const { OpenAI } = require("openai");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

initializeApp();
const db = getFirestore();
const visionClient = new vision.ImageAnnotatorClient();

exports.ocrOnImageUpload = onObjectFinalized({
  secrets: [OPENAI_API_KEY],
}, async (event) => {
  const filePath = event.data.name;

  if (!filePath) return console.log("❌ No filePath found in event:", event);

  const bucket = require("firebase-admin").storage().bucket(event.data.bucket);
  const file = bucket.file(filePath);

  const [metadata] = await file.getMetadata();
  const contentType = metadata.contentType || "";

  if (!contentType.startsWith("image/")) return console.log("⛔️ Skipped non-image file:", filePath);

  const fileName = path.basename(filePath);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  await file.download({ destination: tempFilePath });
  console.log(`✅ Image downloaded locally to ${tempFilePath}`);

  const [result] = await visionClient.textDetection(tempFilePath);
  const detections = result.textAnnotations;
  if (!detections || detections.length === 0) return console.log("⚠️ No text detected.");

  const extractedText = detections[0].description;
  console.log("🧠 Extracted text:", extractedText);

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are an intelligent itinerary assistant.
You will be given raw OCR text extracted from a booking-related document such as a flight ticket, hotel booking, museum pass, bus/train reservation, or event confirmation.

Extract one or more structured **activity objects** in JSON format, using these fields:
- **activityTitle**: including the activity type + specific detail if known (e.g., "Tour with Alternative Berlin Tours", "Entry to Louvre Museum")
- **activityType**: One of: "Flight", "Train", "Bus", "Accommodation", "Tour", "Museum", "Restaurant", or "Other"
- **date**: Most relevant date (check-in, departure, or event date)
- **time**:
   - For transport or events: "HH:MM" or "HH:MM - HH:MM"
   - For accommodation: { "check_in": "...", "check_out": "..." }
- **location**:
   - For transport (Flight, Train, Bus): { "from": "...", "to": "..." }
   - For others: { "location": "..." }
- **price**: Optional (e.g., "EUR 42.99", "$56", "Free")
- **notes**: Optional extra details (confirmation codes, booking numbers, etc.)

⚠️ Rules:
- Never include 'from/to' in the **activityTitle**
- Only use 'from/to' for transport types (Flight, Bus, Train)
- For all other types, use 'location'
- Always return a valid JSON array, even for one activity.

Example:
[
  {
    "activityTitle": "Bus Ride with FlixBus",
    "activityType": "Bus",
    "date": "Sunday, 19 May 2024",
    "time": "21:00",
    "location": "Vienna Erdberg (Busterminal VIB), Erdbergstraße 200A, 1030 Wien",
    "price": "EUR 31.99",
    "notes": "Confirmation: 83475623"
  }
]

OCR TEXT:
"""
${extractedText}
"""
          `,
        },
      ],
    });

    console.log("📥 Full AI response:", JSON.stringify(aiResponse, null, 2));
    const parsedData = aiResponse.choices[0].message.content;
    console.log("📦 AI-parsed data:", parsedData);

    let structured;
    try {
      structured = JSON.parse(parsedData);
    } catch (err) {
      console.error("🛑 Failed to parse AI response as JSON:", err.message);
      return;
    }

    await saveOCRResult(fileName, extractedText, structured);
  } catch (err) {
    console.error("❌ OpenAI call failed:", err.message);
  } finally {
    fs.unlinkSync(tempFilePath);
  }
});
