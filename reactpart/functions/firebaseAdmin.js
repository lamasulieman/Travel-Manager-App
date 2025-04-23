const {initializeApp, applicationDefault, getApps} =
 require("firebase-admin/app");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

const db = getFirestore();

module.exports = {db, FieldValue};
