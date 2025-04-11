const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const db = getFirestore();

/**
 * Save OCR result and AI-parsed data to Firestore
 */
const saveOCRResult = async (fileName, extractedText, parsedData) => {
  try {
    await db.collection("ocrResults").add({
      file: fileName,
      originalText: extractedText,
      parsed: parsedData,
      timestamp: FieldValue.serverTimestamp(),
    });
    console.log(`✅ Saved parsed data for file: ${fileName}`);
  } catch (error) {
    console.error("❌ Failed to save OCR result:", error.message);
  }
};

module.exports = { saveOCRResult };
