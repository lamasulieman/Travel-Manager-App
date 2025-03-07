import React, { useState, useEffect } from "react";
import "../styles/Itinerary.css";

const ItineraryView = ({ startDate, endDate }) => {
  const [days, setDays] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);

  // Sample hardcoded activities (Later, these will be dynamic)
  const activities = {
    "2025-06-10": [
      { name: "Visit Colosseum", time: "10:00 AM", location: "Rome", notes: "Tickets booked online" },
      { name: "Dinner at Trastevere", time: "7:00 PM", location: "Rome", notes: "Recommended by locals" }
    ],
    "2025-06-11": [
      { name: "Vatican Museums Tour", time: "9:30 AM", location: "Vatican City", notes: "Arrive early to avoid crowds" }
    ]
  };

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const tempDays = [];

      while (start <= end) {
        tempDays.push(new Date(start).toISOString().split("T")[0]); // Format as YYYY-MM-DD
        start.setDate(start.getDate() + 1);
      }

      setDays(tempDays);
    }
  }, [startDate, endDate]);

  // Toggle dropdown for a selected day
  const toggleDay = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <div className="itinerary-container">
      <h2>Trip Itinerary</h2>
      <div className="itinerary-list">
        {days.map((day, index) => (
          <div key={index} className="day-group">
            {/* Date acts like a folder title */}
            <h3 className="day-title" onClick={() => toggleDay(day)}>
              📅 {new Date(day).toDateString()}
            </h3>

            {/* Expandable Activities Section */}
            {expandedDay === day && (
              <div className="activities-list">
                {activities[day]?.map((activity, i) => (
                  <div key={i} className="activity-card">
                    <div className="activity-header">
                      <strong>{activity.name}</strong>
                    </div>
                    <div className="activity-details">
                      <p><strong>Time:</strong> {activity.time}</p>
                      <p><strong>Location:</strong> {activity.location}</p>
                      <p><strong>Notes:</strong> {activity.notes}</p>
                    </div>
                  </div>
                )) || <p>No activities planned.</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryView;
