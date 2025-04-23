import React, { useState, useEffect } from "react";
import {
  uploadFile,
  addActivityToTrip,
  addExpenseToTrip,
} from "../controllers/tripController";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  doc,
} from "firebase/firestore";
import { db, auth } from "../services/firebaseConfig";
import "../styles/Storage.css";

const Storage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTripId, setSelectedTripId] = useState("");
  const [userTrips, setUserTrips] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupView, setPopupView] = useState("loading");
  const [ocrText, setOcrText] = useState("");
  const [aiText, setAiText] = useState("");

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return alert("Please select a file first.");
    if (!selectedTripId) return alert("Please select a trip first.");

    setShowPopup(true);
    setPopupView("loading");
    setOcrText("");
    setAiText("");

    try {
      const url = await uploadFile(selectedFile, selectedTripId);
      if (url) {
        await fetchUserFiles();
        await waitForOcrResult(selectedFile.name);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setSelectedFile(null);
    }
  };

  const waitForOcrResult = async (fileName) => {
    const ocrRef = collection(db, "ocrResults");
    const q = query(ocrRef, orderBy("timestamp", "desc"), limit(5));

    const check = async () => {
      const snapshot = await getDocs(q);
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.file === fileName) {
          setOcrText(data.originalText || "No OCR text found.");
          setPopupView("ocr");

          setTimeout(() => {
            setPopupView("ai");
            setAiText(data.parsed || "No AI results found.");

            try {
              const parsedArray = Array.isArray(data.parsed) ? data.parsed : JSON.parse(data.parsed);
              setAiText(parsedArray);
            
              parsedArray.forEach((activity) => {
                const {
                  activityTitle,
                  activityType,
                  date,
                  time,
                  location,
                  price,
                  notes,
                } = activity;
            
                const loc = typeof location === "object"
                  ? location.location || location.from || ""
                  : location;
            
                addActivityToTrip(
                  selectedTripId,
                  activityTitle || "Activity",
                  date || "",
                  time || "",
                  loc,
                  notes || ""
                );
            
                const cleanPrice = parsedArray.price
                  ? parseFloat(parsedArray.price.replace(/[^0-9.]/g, ""))
                  : 0;

                addExpenseToTrip(
                  selectedTripId,
                  `${activityTitle}`,
                  parsedArray.activityType || "Other",
                  cleanPrice
                );

              });
            } catch (error) {
              console.error("Failed to auto-add activity/expense:", error);
            }
            
          }, 3000);
          return;
        }
      }
      setTimeout(check, 2000);
    };

    check();
  };

  const fetchUserFiles = async () => {
    const user = auth.currentUser;
    if (!user || !selectedTripId) return;

    const filesCollection = collection(db, "users", user.uid, "files");
    const q = query(filesCollection, where("tripId", "==", selectedTripId));
    const querySnapshot = await getDocs(q);

    const fetchedFiles = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setFiles(fetchedFiles);
  };

  const fetchUserTrips = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    const userRef = doc(db, "users", user.uid);  // ✅ correct ref
    const tripsQuery = query(
      collection(db, "Trips"),
      where("createdBy", "==", userRef)
    );
  
    try {
      const snapshot = await getDocs(tripsQuery);  // ✅ snapshot is now defined
      const trips = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      setUserTrips(trips);
      if (trips.length > 0) {
        setSelectedTripId(trips[0].id);
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };
  

  useEffect(() => {
    fetchUserTrips();
  }, []);

  useEffect(() => {
    const run = async () => await fetchUserFiles();
    run();
  }, [selectedTripId]);
  

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="storage-container">
      <h2>Storage</h2>

      <select
        value={selectedTripId}
        onChange={(e) => setSelectedTripId(e.target.value)}
        className="trip-selector"
      >
        <option value="">Select Trip</option>
        {userTrips.map((trip) => (
          <option key={trip.id} value={trip.id}>
            {trip.tripName}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search files..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload} disabled={!selectedFile}>
        Upload File
      </button>

      <div className="file-list">
        {filteredFiles.length === 0 ? (
          <p>No files found.</p>
        ) : (
          filteredFiles.map((file, index) => (
            <div key={index} className="file-card">
              <p>{file.name}</p>
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </div>
          ))
        )}
      </div>

      {/* 📦 OCR / AI Result Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-processing">
            <h3>OCR & AI Processing</h3>

            {popupView === "loading" && (
              <p>⏳ Uploading and analyzing file...</p>
            )}

            {popupView === "ocr" && (
              <>
                <h4>📄 OCR Text</h4>
                <pre className="popup-text">{ocrText}</pre>
              </>
            )}

            {popupView === "ai" && (
              <>
                <h4>🧠 AI Extracted Info</h4>
                <pre className="popup-text">
                  {typeof aiText === "string" ? aiText : JSON.stringify(aiText, null, 2)}
                </pre>
                <button className="close-btn" onClick={() => setShowPopup(false)}>
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Storage;
