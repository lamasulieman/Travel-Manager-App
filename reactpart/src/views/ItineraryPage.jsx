import React, { useState, useEffect } from "react";
import { subscribeToActivities, deleteActivity , updateActivity } from "../controllers/tripController";
import Navbar from "../components/Navbar";
import "../styles/Itinerary.css";

const ItineraryView = () => {
  const [activitiesByDate, setActivitiesByDate] = useState({});
  const [currentTripId, setCurrentTripId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});
  const [editingActivity, setEditingActivity] = useState(null);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    const storedTripId = localStorage.getItem("currentTripId");
    if (!storedTripId) return;
  
    setCurrentTripId(storedTripId);
  
    const unsubscribe = subscribeToActivities(storedTripId, (activities) => {
      const grouped = activities.reduce((acc, activity) => {
        const { date, time } = activity;
        if (!acc[date]) acc[date] = [];
        acc[date].push(activity);
        acc[date].sort((a, b) => a.time.localeCompare(b.time));
        return acc;
      }, {});
      setActivitiesByDate(grouped);
      setLoading(false);
    });
  
    return () => unsubscribe(); // Cleanup on unmount
  }, []);
  
  const getTitle = (activity) => {
    const type = activity.activityType?.toLowerCase();
  
    if (!type) return activity.name || "Activity";
  
    switch (type) {
      case "tour":
        return activity.name || "Guided Tour";
  
      case "museum":
        return activity.name?.toLowerCase().includes("entry")
          ? `Entry to ${activity.name.replace(/entry/i, "").trim()}`
          : activity.name || "Museum Visit";
  
      case "accommodation":
        return activity.name || "Accommodation";
  
      case "flight":
      case "train":
      case "bus":
        return activity.name || `${type.charAt(0).toUpperCase() + type.slice(1)} Trip`;
  
      case "restaurant":
        return activity.name || "Meal Reservation";
  
      default:
        return activity.name || "Activity";
    }
  };
  
  

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setEditName(activity.name);
    setEditDate(activity.date);
    setEditTime(activity.time);
    setEditLocation(activity.location);
    setEditNotes(activity.notes || "");
    setEditFormVisible(true);
  };
  
  const handleUpdateActivity = async () => {
    try {
      await updateActivity(currentTripId, editingActivity.id, {
        name: editName,
        date: editDate,
        time: editTime,
        location: editLocation,
        notes: editNotes,
      });
  
      setEditFormVisible(false);
      setEditingActivity(null);
    } catch (err) {
      console.error("Error updating activity:", err);
    }
  };
  
  const handleDeleteActivity = async (activityId) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await deleteActivity(currentTripId, activityId);
      } catch (err) {
        console.error("Error deleting activity:", err);
      }
    }
  };
  

  const toggleExpandDate = (date) => {
    setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  return (
    <div className="itinerary-container">
      <Navbar />
      <h2>Itinerary</h2>
  
      {loading ? (
        <p>Loading itinerary...</p>
      ) : Object.keys(activitiesByDate).length > 0 ? (
        Object.keys(activitiesByDate).map((date) => (
          <div key={date} className="date-section">
            <div className="date-header" onClick={() => toggleExpandDate(date)}>
              <h3>{date} 📅</h3>
              <span className="dropdown-icon">{expandedDates[date] ? "▼" : "▶"}</span>
            </div>
  
            {expandedDates[date] && (
              <div className="activity-list">
                {activitiesByDate[date].map((activity) => (
                  <div key={activity.id} className="activity-card">
                  <p><strong>{getTitle(activity)}</strong></p>
                
                  {/* Render time safely based on type */}
                  {activity.activityType === "Accommodation" && typeof activity.time === "object" && (
                    <>
                      <p>🕒 Check-in: {activity.time.check_in}</p>
                      <p>🕒 Check-out: {activity.time.check_out}</p>
                    </>
                  )}
                
                  {["Bus", "Train", "Flight", "Tour", "Museum", "Restaurant", "Other"].includes(activity.activityType) && typeof activity.time === "string" && (
                    <p>🕒 {activity.time}</p>
                  )}
                
                  {!activity.activityType && typeof activity.time === "string" && (
                    <p>🕒 {activity.time}</p>
                  )}
                
                  <p>📍 {activity.location}</p>
                  {activity.notes && <p>📝 {activity.notes}</p>}
                  <button onClick={() => handleEditActivity(activity)}>📝</button>
                  <button onClick={() => handleDeleteActivity(activity.id)}>🗑️</button>
                </div>
                
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No activities found for this trip.</p>
      )}
  
      {editFormVisible && (
        <div className="popup">
          <div className="popup-content">
            <h3>Edit Activity</h3>
            <input
              type="text"
              placeholder="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <input
              type="time"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
            />
            <textarea
              placeholder="Notes"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
            <button className="save-btn" onClick={handleUpdateActivity}>Update</button>
            <button className="close-btn" onClick={() => setEditFormVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}  

export default ItineraryView;
