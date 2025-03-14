import React, { useState, useEffect } from "react";
import { getUserTrips, addTrip, addActivityToTrip, fetchActivities } from "../controllers/tripController";
import Navbar from "../components/Navbar";
import "../styles/Main.css";

const MainDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [nextActivity, setNextActivity] = useState(null);
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
  const [activityDate, setActivityDate] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityNotes, setActivityNotes] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const userTrips = await getUserTrips();
        setTrips(userTrips);
        if (userTrips.length > 0) {
          setSelectedTrip(userTrips[0]); 
          localStorage.setItem("currentTripId", userTrips[0].id);
          fetchNextActivity(userTrips[0].id);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };

    fetchTrips();
  }, []);

  const handleTripSelection = (trip) => {
    setSelectedTrip(trip);
    localStorage.setItem("currentTripId", trip.id);
    console.log("Updated trip ID in storage:", trip.id);
    fetchNextActivity(trip.id);
  };

  const fetchNextActivity = async (tripId) => {
    try {
      const activities = await fetchActivities(tripId);
      const upcoming = activities
        .filter((activity) => new Date(activity.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setNextActivity(upcoming.length > 0 ? upcoming[0] : null);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

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
    if (!activityName || !activityDate || !activityTime || !activityLocation) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      await addActivityToTrip(
        selectedTripForActivity,
        activityName,
        activityDate,
        activityTime,
        activityLocation,
        activityNotes
      );
      alert("Activity added successfully!");
      setActivityName("");
      setActivityDate("");
      setActivityTime("");
      setActivityLocation("");
      setActivityNotes("");
      setActivityPopupOpen(false);
      fetchNextActivity(selectedTripForActivity); // Refresh next activity
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

        {selectedTrip ? (
          <div className="trip-section">
            <h3>Current Trip: {selectedTrip.tripName}</h3>
            <p>{selectedTrip.startDate} - {selectedTrip.endDate}</p>
          </div>
        ) : (
          <p>No trips found. Start planning!</p>
        )}

        {nextActivity ? (
          <div className="trip-section">
            <h3>Next Activity: {nextActivity.name}</h3>
            <p>📅 {nextActivity.date} | 🕒 {nextActivity.time}</p>
            <p>📍 {nextActivity.location}</p>
            {nextActivity.notes && <p>📝 {nextActivity.notes}</p>}
          </div>
        ) : (
          <p>No upcoming activities.</p>
        )}

        {trips.length > 0 && (
          <div className="trip-list">
            <h3>Your Trips</h3>
            {trips.map((trip) => (
              <div key={trip.id} className="trip-card" onClick={() => handleTripSelection(trip)}>
                <h4>{trip.tripName}</h4>
                <p>{trip.startDate} - {trip.endDate}</p>
              </div>
            ))}
          </div>
        )}

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
            <input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} required />
            <input type="time" value={activityTime} onChange={(e) => setActivityTime(e.target.value)} required />
            <input type="text" placeholder="Location" value={activityLocation} onChange={(e) => setActivityLocation(e.target.value)} required />
            <textarea placeholder="Notes (Optional)" value={activityNotes} onChange={(e) => setActivityNotes(e.target.value)}></textarea>
            <button className="save-btn" onClick={handleAddActivity}>Add Activity</button>
            <button className="close-btn" onClick={() => setActivityPopupOpen(false)}>Close</button>
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
            <button className="save-btn">Add Expense</button> 
            <button className="close-btn" onClick={() => setExpensePopupOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;
