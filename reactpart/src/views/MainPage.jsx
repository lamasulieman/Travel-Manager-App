import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/Main.css";

const MainDashboard = () => {
  const [isUploadPopupOpen, setUploadPopupOpen] = useState(false);
  const [isActivityPopupOpen, setActivityPopupOpen] = useState(false);
  const [isReviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [isExpensePopupOpen, setExpensePopupOpen] = useState(false);
  const [isTripPopupOpen, setTripPopupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");

  // Sample trip details (Later, these will be fetched dynamically)
  const tripStartDate = "2025-06-10"; 
  const tripEndDate = "2025-06-15";
  
  // Sample activities per day
  const activitiesByDate = {
    "2025-06-10": [
      { name: "Arrive in Rome", time: "10:00 AM", location: "Fiumicino Airport" },
      { name: "Visit Colosseum", time: "2:00 PM", location: "Rome" }
    ],
    "2025-06-11": [
      { name: "Vatican Museums Tour", time: "9:30 AM", location: "Vatican City" },
      { name: "Dinner at Trastevere", time: "7:00 PM", location: "Rome" }
    ]
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Determine which day’s activities to show
  const tripNotStarted = today < tripStartDate;
  const displayDate = tripNotStarted ? tripStartDate : today;
  const todaysActivities = activitiesByDate[displayDate] || [];

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Welcome to Your Trip Planner</h2>
          <button className="new-journey-btn" onClick={() => setTripPopupOpen(true)}>+ Plan a New Journey</button>
        </div>

        <div className="trip-section">
          <h3>Current Trip - {tripNotStarted ? "Upcoming (First Day Activities)" : "Today's Activities"}</h3>
          <div className="trip-card">
            {todaysActivities.length > 0 ? (
              todaysActivities.map((activity, index) => (
                <p key={index}>
                  <strong>{activity.time} - {activity.name}</strong> ({activity.location})
                </p>
              ))
            ) : (
              <p>No activities planned for this day.</p>
            )}
          </div>
        </div>

        <div className="actions-section">
          <button className="action-btn upload-btn" onClick={() => setUploadPopupOpen(true)}>📄 Upload Doc</button>
          <button className="action-btn activity-btn" onClick={() => setActivityPopupOpen(true)}>📌 Add Manual Activity</button>
          <button className="action-btn review-btn" onClick={() => setReviewPopupOpen(true)}>✍️ Write Review</button>
          <button className="action-btn expense-btn" onClick={() => setExpensePopupOpen(true)}>💰 Add Manual Expense</button>
        </div>

        <div className="expense-tracker">
          <h3>Expense Overview</h3>
          <p><strong>Total Expenses:</strong> $120</p>
          <p>Tracked from 2 activities</p>
        </div>
      </div>

      {/* POPUPS */}
      {/* Start New Trip Popup */}
      {isTripPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Plan a New Journey</h3>
            <input type="text" placeholder="Trip Title" />
            <input type="date" placeholder="Start Date" />
            <input type="date" placeholder="End Date" />
            <button className="save-btn">Start Trip</button>
            <button className="close-btn" onClick={() => setTripPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Upload Doc Popup */}
      {isUploadPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Upload a Document</h3>
            <input type="file" />
            <button className="close-btn" onClick={() => setUploadPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Add Manual Activity Popup */}
      {isActivityPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Manual Activity</h3>
            <input type="text" placeholder="Activity Name" />
            <input type="time" placeholder="Time" />
            <input type="text" placeholder="Location" />
            <button className="close-btn" onClick={() => setActivityPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Write Review Popup */}
      {isReviewPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Write a Review</h3>
            <select onChange={(e) => setSelectedActivity(e.target.value)}>
              <option value="">Select an Activity</option>
              {todaysActivities.map((activity, index) => (
                <option key={index} value={activity.name}>{activity.name}</option>
              ))}
            </select>
            <textarea placeholder="Write your review..."></textarea>
            <button className="close-btn" onClick={() => setReviewPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Add Manual Expense Popup */}
      {isExpensePopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Manual Expense</h3>
            <input type="number" placeholder="Amount ($)" />
            <select>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
            </select>
            <textarea placeholder="Additional Notes"></textarea>
            <button className="close-btn" onClick={() => setExpensePopupOpen(false)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MainDashboard;
