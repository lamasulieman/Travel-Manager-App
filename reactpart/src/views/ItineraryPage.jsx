import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Navbar from "../components/Navbar";
import "../styles/Itinerary.css";
localStorage.setItem("currentTripId", "KM4wayZvPG76UtlzI4FI");

console.log(localStorage.getItem("currentTripId"));

const ItineraryView = () => {
  const [activitiesByDate, setActivitiesByDate] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const tripId = localStorage.getItem("currentTripId"); // ✅ Get from localStorage
        if (!tripId) {
          console.warn("No trip selected. Please choose a trip.");
          setLoading(false);
          return;
        }

        const activitiesCollectionRef = collection(db, "Trips", tripId, "activities");
        const querySnapshot = await getDocs(activitiesCollectionRef);

        if (querySnapshot.empty) {
          console.warn("No activities found for this trip.");
          setActivitiesByDate({});
          setLoading(false);
          return;
        }

        const activitiesData = {};
        querySnapshot.forEach((doc) => {
          const activity = doc.data();
          const date = activity.date; // Ensure 'date' field exists

          if (!activitiesData[date]) {
            activitiesData[date] = [];
          }
          activitiesData[date].push(activity);
        });

        setActivitiesByDate(activitiesData);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="itinerary-container">
      <Navbar />
      <h2>Itinerary</h2>

      {loading ? (
        <p>Loading itinerary...</p>
      ) : Object.keys(activitiesByDate).length > 0 ? (
        <div className="calendar-grid">
          {Object.entries(activitiesByDate).map(([date, activities]) => (
            <div key={date} className="calendar-day">
              <h3>📅 {new Date(date).toDateString()}</h3>
              {activities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <p>
                    <strong>{activity.time} - {activity.name}</strong>
                  </p>
                  <p>📍 {activity.location}</p>
                  {activity.notes && <p>📝 {activity.notes}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p>No activities found for this trip.</p>
      )}
    </div>
  );
};

export default ItineraryView;
