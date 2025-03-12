import React, { useState, useEffect } from "react";
import { getUserTrips, addTrip, addActivityToTrip } from "../controllers/tripController"; // ✅ Firestore integration
import Navbar from "../components/Navbar";
import "../styles/Main.css";

const MainDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isTripPopupOpen, setTripPopupOpen] = useState(false);
  const [isUploadPopupOpen, setUploadPopupOpen] = useState(false);
  const [isActivityPopupOpen, setActivityPopupOpen] = useState(false);
  const [isReviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [isExpensePopupOpen, setExpensePopupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedTripForActivity, setSelectedTripForActivity] = useState("");
  const [activityName, setActivityName] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityNotes, setActivityNotes] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userTrips = await getUserTrips();
        setTrips(userTrips);
        if (userTrips.length > 0) {
          setSelectedTrip(userTrips[0]); // ✅ Default to first trip
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchTrips();
  }, []);

  const handleAddTrip = async (e) => {
    e.preventDefault();
    try {
      await addTrip(tripName, startDate, endDate);
      alert("Trip added successfully!");
      setTripName("");
      setStartDate("");
      setEndDate("");
      setTripPopupOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error adding trip:", error);
    }
  };

  const handleAddActivity = async () => {
    if (!selectedTripForActivity) {
      alert("Please select a trip to add the activity to.");
      return;
    }
    if (!activityName || !activityTime || !activityLocation) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      await addActivityToTrip(selectedTripForActivity, activityName, activityTime, activityLocation, activityNotes);
      alert("Activity added successfully!");
      setActivityName("");
      setActivityTime("");
      setActivityLocation("");
      setActivityNotes("");
      setActivityPopupOpen(false);
    } catch (error) {
      console.error("Error adding activity:", error);
      alert("Failed to add activity.");
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Welcome to Your Trip Planner</h2>
          <button className="new-journey-btn" onClick={() => setTripPopupOpen(true)}>
            + Plan a New Journey
          </button>
        </div>

        {/* ✅ Current Trip Section */}
        {selectedTrip ? (
          <div className="trip-section">
            <h3>Current Trip: {selectedTrip.tripName}</h3>
            <p>{selectedTrip.startDate} - {selectedTrip.endDate}</p>
          </div>
        ) : (
          <p>No trips found. Start planning!</p>
        )}

        {/* ✅ List All User Trips */}
        {trips.length > 0 && (
          <div className="trip-list">
            <h3>Your Trips</h3>
            {trips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <h4>{trip.tripName}</h4>
                <p>{trip.startDate} - {trip.endDate}</p>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Actions Section */}
        <div className="actions-section">
          <button className="action-btn upload-btn" onClick={() => setUploadPopupOpen(true)}>📄 Upload Doc</button>
          <button className="action-btn activity-btn" onClick={() => setActivityPopupOpen(true)}>📌 Add Manual Activity</button>
          <button className="action-btn review-btn" onClick={() => setReviewPopupOpen(true)}>✍️ Write Review</button>
          <button className="action-btn expense-btn" onClick={() => setExpensePopupOpen(true)}>💰 Add Manual Expense</button>
        </div>

        {/* ✅ Expense Tracker Section */}
        <div className="expense-tracker">
          <h3>Expense Overview</h3>
          <p><strong>Total Expenses:</strong> $120</p>
          <p>Tracked from 2 activities</p>
        </div>
      </div>

      {/* ✅ Popups */}
      {isTripPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Plan a New Journey</h3>
            <form onSubmit={handleAddTrip}>
              <input type="text" placeholder="Trip Title" value={tripName} onChange={(e) => setTripName(e.target.value)} required />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              <button type="submit" className="save-btn">Start Trip</button>
            </form>
            <button className="close-btn" onClick={() => setTripPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}
      {/* ✅ Write Review Popup with Submit Button */}
      {isReviewPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Write a Review</h3>
            <select onChange={(e) => setSelectedActivity(e.target.value)}>
              <option value="">Select an Activity</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.tripName}>{trip.tripName}</option>
              ))}
            </select>
            <textarea placeholder="Write your review..."></textarea>
            <button className="save-btn">Submit Review</button> {/* ✅ Added Submit Button */}
            <button className="close-btn" onClick={() => setReviewPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Upload Doc Popup */}
      {isUploadPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Upload a Document</h3>
            <input type="file" />
            <button className="save-btn">Submit doc</button> {/* ✅ Added Submit Button */}
            <button className="close-btn" onClick={() => setUploadPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}
      {/* ✅ Add Manual Expense Popup with Submit Button */}
      {isExpensePopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Manual Expense</h3>
            <input type="number" placeholder="Amount ($)" required />
            <select>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
            </select>
            <textarea placeholder="Additional Notes"></textarea>
            <button className="save-btn">Add Expense</button> {/* ✅ Added Submit Button */}
            <button className="close-btn" onClick={() => setExpensePopupOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ✅ Add Manual Activity Popup with Trip Selection */}
      {isActivityPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add Manual Activity</h3>
            <select value={selectedTripForActivity} onChange={(e) => setSelectedTripForActivity(e.target.value)} required>
              <option value="">Select Trip</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>{trip.tripName}</option>
              ))}
            </select>
            <input type="text" placeholder="Activity Name" value={activityName} onChange={(e) => setActivityName(e.target.value)} required />
            <input type="time" value={activityTime} onChange={(e) => setActivityTime(e.target.value)} required />
            <input type="text" placeholder="Location" value={activityLocation} onChange={(e) => setActivityLocation(e.target.value)} required />
            <textarea placeholder="Notes (Optional)" value={activityNotes} onChange={(e) => setActivityNotes(e.target.value)}></textarea>
            <button className="save-btn" onClick={handleAddActivity}>Add Activity</button>
            <button className="close-btn" onClick={() => setActivityPopupOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;
