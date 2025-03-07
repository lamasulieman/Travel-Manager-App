import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  
    apiKey: "AIzaSyDPhkm266gXEn6JHlTVNwAadzJomHSHfQI",
    authDomain: "travelmanager-3d01b.firebaseapp.com",
    projectId: "travelmanager-3d01b",
    storageBucket: "travelmanager-3d01b.firebasestorage.app",
    messagingSenderId: "557034644050",
    appId: "1:557034644050:web:4b148725a907395900758b",
    measurementId: "G-QSP56RHC14"
  
  
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage }


