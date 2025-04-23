const {onObjectFinalized} = require("firebase-functions/v2/storage");
const {defineSecret} = require("firebase-functions/params");
const vision = require("@google-cloud/vision");
const path = require("path");
const os = require("os");
const fs = require("fs");
const {saveOCRResult} = require("./models/ocrModel");
const {OpenAI} = require("openai");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

const visionClient = new vision.ImageAnnotatorClient();

exports.ocrOnImageUpload = onObjectFinalized({
  secrets: [OPENAI_API_KEY],
}, async (event) => {
  const filePath = event.data.name;

  if (!filePath) {
    return console.log("❌ No filePath found in event:", event);
  }

  const bucket = require("firebase-admin").storage().bucket(event.data.bucket);
  const file = bucket.file(filePath);

  const [metadata] = await file.getMetadata();
  const contentType = metadata.contentType || "";

  if (!contentType.startsWith("image/")) {
    return console.log("⛔️ Skipped non-image file:", filePath);
  }

  const fileName = path.basename(filePath);
  const tempFilePath = path.join(os.tmpdir(), fileName);
  await file.download({destination: tempFilePath});
  console.log(`✅ Image downloaded locally to ${tempFilePath}`);

  const [result] = await visionClient.textDetection(tempFilePath);
  const detections = result.textAnnotations;
  if (!detections || detections.length === 0) {
    return console.log("⚠️ No text detected.");
  }

  const extractedText = detections[0].description;
  console.log("🧠 Extracted text:", extractedText);

  try {
    const openai = new OpenAI({apiKey: OPENAI_API_KEY.value()});

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
          You are an intelligent itinerary assistant.

          You will be given raw OCR text extracted from a booking-related 
          document such as a flight ticket, hotel booking, 
          restaurant reservation, museum pass, or bus/train ticket.

          Your job is to extract **one or more structured 
          JSON activity objects** in this format:

          Each activity has:
          - **activityTitle**
            (E.g., "Dinner at Black Swan Bar", "Check-in at Hotel California")
          - **activityType**: 
            One of: "Flight", "Train", "Bus", "Accommodation", 
            "Tour", "Museum", 
            "Restaurant", "Other"
          - **date**
          - **time** 
            (either string like "20:00", 
            or for accommodation: { check_in: "...", check_out: "..." })
          - **location** 
            (for transport: { from: "...", to: "..." }, 
            for others: { location: "..." })
          - **price**: Optional
          - **notes**: Optional extra data like confirmation numbers

          ⚠️ Rules:
          - Do NOT use 'from/to' unless it's Flight, Bus, or Train
          - For all other types, use 'location'
          - Return only a valid JSON **array**, even for a single activity

          Now extract from the following:

          OCR TEXT:
          """
          ${extractedText}
          """
          `,
        },
      ],
    });

    console.log("📥 Full AI response:", JSON.stringify(aiResponse, null, 2));

    let structured;
    try {
      structured = JSON.parse(aiResponse.choices[0].message.content);
    } catch (err) {
      console.error("🛑 Failed to parse AI response as JSON:", err.message);
      return;
    }

    const processedActivities = structured.map((activity) => {
      const title = activity.activityTitle?.toLowerCase() || "";

      if (
        !activity.activityType &&
        (title.includes("bus") ||
        title.includes("train") ||
        title.includes("flight") ||
        title.includes("plane") ||
        title.includes("car"))
      ) {
        activity.activityType = "Transport";
      } else if (
        !activity.activityType &&
        (title.includes("hostel") ||
        title.includes("hotel") ||
        title.includes("bnb") ||
        title.includes("apartment") ||
        title.includes("inn") ||
        typeof activity.time === "object")
      ) {
        activity.activityType = "Accommodation";
      } else if (
        !activity.activityType &&
        (title.includes("restaurant") ||
        title.includes("bar") ||
        title.includes("dinner") ||
        title.includes("lunch"))
      ) {
        activity.activityType = "Restaurant";
      }

      if (!activity.activityType) {
        activity.activityType = "Activity";
      }

      return activity;
    });

    await saveOCRResult(fileName, extractedText, processedActivities);
  } catch (err) {
    console.error("❌ OpenAI call failed:", err.message);
  } finally {
    fs.unlinkSync(tempFilePath);
  }
});
