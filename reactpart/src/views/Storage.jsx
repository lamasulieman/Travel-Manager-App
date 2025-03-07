import React, { useState } from "react";
import "../styles/Storage.css";

const Storage = () => {
  // Sample stored files grouped by trip name
  const [files, setFiles] = useState([
    { name: "Flight Ticket - Budapest to Rome.pdf", trip: "Rome 2025", date: "2025-02-15" },
    { name: "Hotel Booking - Hilton Rome.png", trip: "Rome 2025", date: "2025-02-14" },
    { name: "Colosseum Entry Ticket.pdf", trip: "Rome 2025", date: "2025-02-12" },
    { name: "Flight Ticket - Tokyo Roundtrip.pdf", trip: "Japan 2024", date: "2024-07-20" },
    { name: "Train Pass - JR Rail Pass.pdf", trip: "Japan 2024", date: "2024-07-18" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  // Sort files by newest first
  const sortedFiles = [...files].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter files based on search query
  const filteredFiles = sortedFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group files by trip name
  const groupedFiles = filteredFiles.reduce((acc, file) => {
    if (!acc[file.trip]) acc[file.trip] = [];
    acc[file.trip].push(file);
    return acc;
  }, {});

  return (
    <div className="storage-container">
      <h2>Storage</h2>

      {/* Search Bar */}
      <input
        type="text"
        className="search-bar"
        placeholder="Search files..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Display files grouped by trip name */}
      <div className="file-list">
        {Object.keys(groupedFiles).map((trip, index) => (
          <div key={index} className="trip-group">
            <h3 className="trip-title">📂 {trip}</h3>
            {groupedFiles[trip].map((file, i) => (
              <div key={i} className="file-card">
                <span className="file-name">{file.name}</span>
                <span className="file-date">{new Date(file.date).toDateString()}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storage;
