import React, { useState, useEffect } from "react";
import { fetchActivities } from "../controllers/tripController";
import Navbar from "../components/Navbar";
import "../styles/Itinerary.css";

const ItineraryView = () => {
  const [activitiesByDate, setActivitiesByDate] = useState({});
  const [currentTripId, setCurrentTripId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    const storedTripId = localStorage.getItem("currentTripId");
    console.log("Using stored trip ID:", storedTripId);
    
    if (storedTripId) {
      setCurrentTripId(storedTripId);
      fetchTripActivities(storedTripId);
    }
  }, []);

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
                    <p><strong>🕒 {activity.time} - {activity.name}</strong></p>
                    <p>📍 {activity.location}</p>
                    {activity.notes && <p>📝 {activity.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No activities found for this trip.</p>
      )}
    </div>
  );
};

export default ItineraryView;
