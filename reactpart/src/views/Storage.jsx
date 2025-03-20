import React, { useState, useEffect } from "react";
import { uploadFile } from "../controllers/tripController";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, getDocs,addDoc } from "firebase/firestore";
import { db, auth, storage } from "../services/firebaseConfig";  
import "../styles/Storage.css";

const Storage = () => {
  const [files, setFiles] = useState([]); // Store uploaded files
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search input state

  // Handle file selection
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to upload files.");
      return;
    }

    const storageRef = ref(storage, `uploads/${user.uid}/${selectedFile.name}`);

    try {
      const metadata = { contentType: selectedFile.type };
      const snapshot = await uploadBytes(storageRef, selectedFile, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log("File uploaded successfully:", downloadURL);

      await addDoc(collection(db, "users", user.uid, "files"), {
        name: selectedFile.name,
        url: downloadURL,
        uploadedAt: new Date().toISOString(),
      });

      alert("File uploaded!");
      setFiles((prevFiles) => [...prevFiles, { name: selectedFile.name, url: downloadURL }]);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    }
  };

  // Fetch user files from Firestore
  const fetchUserFiles = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const filesCollection = collection(db, "users", user.uid, "files");
      const querySnapshot = await getDocs(filesCollection);
      
      const fetchedFiles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFiles(fetchedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchUserFiles();
  }, []);

  // Filter files based on search query
  const filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="storage-container">
      <h2>Storage</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search files..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      {/* File Upload Input */}
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload} disabled={!selectedFile}>Upload File</button>

      {/* Display Uploaded Files */}
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
    </div>
  );
};

export default Storage;
