const {db, FieldValue} = require("../firebaseAdmin");
/**
 * Saves OCR result to Firestore.
 *
 * @param {string} fileName
 * @param {string} extractedText
 * @param {Array} parsedData
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

module.exports = {saveOCRResult};
