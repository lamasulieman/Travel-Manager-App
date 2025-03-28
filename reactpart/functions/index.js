const {onObjectFinalized} = require("firebase-functions/v2/storage");
const {defineSecret} = require("firebase-functions/params");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");
const vision = require("@google-cloud/vision");
const path = require("path");
const os = require("os");
const fs = require("fs");
const {OpenAI} = require("openai"); // ✅ OpenAI SDK v4+

// 🔐 Access OpenAI API key securely
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

// 🏁 Init Firebase
initializeApp();
const db = getFirestore();
const visionClient = new vision.ImageAnnotatorClient();

// 👁‍🗨 Image Upload Trigger with OCR + OpenAI
exports.ocrOnImageUpload = onObjectFinalized(
    {
      secrets: [OPENAI_API_KEY],
    },
    async (event) => {
      const filePath = event.data.name;

      if (!filePath) {
        console.log("❌ No filePath found in event:", event);
        return;
      }

      const bucket = require("firebase-admin").storage().bucket(event.data.bucket);// eslint-disable-line max-len
      const file = bucket.file(filePath);

      const [metadata] = await file.getMetadata();
      const contentType = metadata.contentType || "";

      if (!contentType.startsWith("image/")) {
        console.log("⛔️ Skipped non-image file:", filePath);
        return;
      }

      const fileName = path.basename(filePath);
      const tempFilePath = path.join(os.tmpdir(), fileName);

      // ⬇️ Download image locally
      await file.download({destination: tempFilePath});
      console.log(`✅ Image downloaded locally to ${tempFilePath}`);

      // 🔍 OCR using Google Vision
      const [result] = await visionClient.textDetection(tempFilePath);
      const detections = result.textAnnotations;

      if (!detections || detections.length === 0) {
        console.log("⚠️ No text detected.");
        return;
      }

      const extractedText = detections[0].description;
      console.log("🧠 Extracted text:", extractedText);

      try {
      // 🤖 Send to OpenAI for parsing
        const openai = new OpenAI({
          apiKey: OPENAI_API_KEY.value(),
        });

        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
              "You are a travel assistant that extracts structured booking info from OCR text. Return JSON with keys: date, time, from, to, price, name(s), transport_mode.", // eslint-disable-line max-len
            },
            {
              role: "user",
              content: extractedText,
            },
          ],
        });

        console.log("📥 Full AI response:", JSON.stringify(aiResponse, null, 2));

        const parsedData = aiResponse.choices[0].message.content;
        console.log("📦 AI-parsed data:", parsedData);

        // 💾 Save to Firestore
        await db.collection("ocrResults").add({
          file: fileName,
          originalText: extractedText,
          parsed: parsedData,
          timestamp: FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error("❌ OpenAI call failed:", err.message);
      } finally {
      // 🧹 Cleanup
        fs.unlinkSync(tempFilePath);
      }
    },
);
