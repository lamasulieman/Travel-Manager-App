import React, { useState, useEffect } from "react";
import { fetchActivities, deleteActivity , updateActivity } from "../controllers/tripController";
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
    console.log("Using stored trip ID:", storedTripId);
    
    if (storedTripId) {
      setCurrentTripId(storedTripId);
      fetchTripActivities(storedTripId);
    }
  }, []);

  const getTitle = (activity) => {
    if (activity.name?.toLowerCase() === "tour" && activity["name(s)"]) {
      return `Tour with ${activity["name(s)"]}`;
    } else if (activity.name?.toLowerCase() === "museum entry" && activity["name(s)"]) {
      return `Entry to ${activity["name(s)"]}`;
    }
    return activity.name || "Activity";
  };
  

  const fetchTripActivities = async (tripId) => {
    try {
      const activities = await fetchActivities(tripId);

      // Group activities by date and sort them by time
      const groupedActivities = activities.reduce((acc, activity) => {
        const { date, time } = activity;
        if (!acc[date]) acc[date] = [];
        acc[date].push(activity);
        acc[date].sort((a, b) => a.time.localeCompare(b.time)); // Sort by time
        return acc;
      }, {});

      setActivitiesByDate(groupedActivities);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
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
      await fetchTripActivities(currentTripId); // refresh list
    } catch (err) {
      console.error("Error updating activity:", err);
    }
  };
  
  const handleDeleteActivity = async (activityId) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      try {
        await deleteActivity(currentTripId, activityId);
        await fetchTripActivities(currentTripId);
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
                    <p><strong>🕒 {activity.time} - {getTitle(activity)}</strong></p>
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
