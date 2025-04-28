import React, { useState, useEffect } from "react";
import { getUserTrips, addTrip, addActivityToTrip, subscribeToActivities ,addExpenseToTrip , uploadFile , subscribeToExpenses,updateTrip,deleteTrip} from "../controllers/tripController";
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
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedTripForActivity, setSelectedTripForActivity] = useState("");
  const [activityName, setActivityName] = useState("");
  const [activityDate, setActivityDate] = useState("");
  const [activityTime, setActivityTime] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityNotes, setActivityNotes] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [expenseNotes, setExpenseNotes] = useState("manual expense");
  const [selectedTripForExpense, setSelectedTripForExpense] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTripForUpload, setSelectedTripForUpload] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);

  
  useEffect(() => {
    let unsubscribeActivities;
    let unsubscribeExpenses;
  
    const fetchTrips = async () => {
      try {
        const userTrips = await getUserTrips();
        setTrips(userTrips);
  
        if (userTrips.length > 0) {
          const tripId = userTrips[0].id;
          setSelectedTrip(userTrips[0]);
          localStorage.setItem("currentTripId", tripId);
  
          unsubscribeActivities = subscribeToActivities(tripId, (activities) => {
            const upcoming = activities
              .filter((a) => new Date(a.date) >= new Date())
              .sort((a, b) => new Date(a.date) - new Date(b.date));
            setNextActivity(upcoming[0] || null);
          });
  
          const unsubscribe = subscribeToExpenses(userTrips[0].id, (expenses) => {
            const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            setTotalExpenses(total);
            setExpenseCount(expenses.length);
          });
          
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
      }
    };
  
    fetchTrips();
  
    return () => {
      unsubscribeActivities?.();
      unsubscribeExpenses?.();
    };
  }, []);

  const handleTripSelection = (trip) => {
    setSelectedTrip(trip);
    localStorage.setItem("currentTripId", trip.id);
    console.log("Updated trip ID in storage:", trip.id);
  
    // Fetch next activity via real-time updates
    fetchNextActivity(trip.id);
  
    // ✅ Properly subscribe to expenses with callback
    subscribeToExpenses(trip.id, (expenses) => {
      const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      setTotalExpenses(total);
      setExpenseCount(expenses.length);
    });
  };
  ;

  const fetchNextActivity = (tripId) => {
    subscribeToActivities(tripId, (activities) => {
      const now = new Date();
  
      const upcoming = activities
        .filter((activity) => {
          const activityDateTime = new Date(`${activity.date}T${activity.time}`);
          return activityDateTime >= now;
        })
        .sort((a, b) => {
          const aTime = new Date(`${a.date}T${a.time}`);
          const bTime = new Date(`${b.date}T${b.time}`);
          return aTime - bTime;
        });
  
      setNextActivity(upcoming.length > 0 ? upcoming[0] : null);
    });
  };
  
  

  
  

  const handleAddTrip = async (e) => {
    e.preventDefault();
  
    try {
      if (selectedTrip) {
        await updateTrip(selectedTrip.id, {
          tripName,
          startDate,
          endDate,
        });
        alert("Trip updated!");
      } else {
        // New trip creation
        const newTripId = await addTrip(tripName, startDate, endDate);
        alert("Trip added!");
  
        // Fetch updated trips
        const updatedTrips = await getUserTrips();
        setTrips(updatedTrips);
  
        // Find the newly created trip
        const newlyCreatedTrip = updatedTrips.find((trip) => trip.id === newTripId);
  
        if (newlyCreatedTrip) {
          setSelectedTrip(newlyCreatedTrip);
          localStorage.setItem("currentTripId", newTripId);
        }
      }
  
      setTripName("");
      setStartDate("");
      setEndDate("");
      setTripPopupOpen(false);
      // No window.location.reload() needed!

    } catch (error) {
      console.error("Error adding/editing trip:", error);
    }
  };
  
  

  // 🗑️ DELETE
const handleDeleteTrip = async (tripId) => {
  if (window.confirm("Are you sure you want to delete this trip?")) {
    try {
      await deleteTrip(tripId);
      alert("Trip deleted.");
      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
    } catch (err) {
      console.error("Error deleting trip:", err);
      alert("Failed to delete trip.");
    }
  }
};

// 📝 EDIT
const handleEditTrip = (trip) => {
  setTripName(trip.tripName);
  setStartDate(trip.startDate);
  setEndDate(trip.endDate);
  setSelectedTrip(trip); // this will now act as "currently editing"
  setTripPopupOpen(true);
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

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleUploadDocument = async () => {
    if (!selectedTripForUpload) {
      alert("Please select a trip.");
      return;
    }
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
  
    try {
      await uploadFile(selectedFile, selectedTripForUpload);
      alert("File uploaded successfully!");
      setSelectedFile(null);
      setUploadPopupOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file.");
    }
  };

  const handleAddExpense = async () => {
    if (!selectedTripForExpense) {
      alert("Please select a trip.");
      return;
    }
    if (!expenseAmount) {
      alert("Please enter an amount.");
      return;
    }
  
    try {
      await addExpenseToTrip(selectedTripForExpense, expenseNotes, expenseCategory, expenseAmount);
      alert("Expense added successfully!");
      setExpenseAmount("");
      setExpenseCategory("Food");
      setExpenseNotes("");
      setExpensePopupOpen(false);
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense.");
    }
  };

  

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Welcome to Your Trip Planner</h2>
          <button className="new-journey-btn" onClick={() => {
                setTripPopupOpen(true);
                setSelectedTrip(null);
              }}
              >
            + Plan a New Journey
          </button>
          {isTripPopupOpen && (
  <div className="popup">
    <div className="popup-content">
      <h3>Plan a New Journey</h3>
      <form onSubmit={handleAddTrip}>  {/*  Ensures handleAddTrip() is used */}
        <input
          type="text"
          placeholder="Trip Name"
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          required
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <button className="save-btn" type="submit">Create Trip</button>  
        <button className="close-btn" onClick={() => setTripPopupOpen(false)}>Close</button>
      </form>
    </div>
  </div>
)}

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
  <div key={trip.id} className="trip-card">
    <div className="trip-details" onClick={() => handleTripSelection(trip)}>
      <h4>{trip.tripName}</h4>
      <p>{trip.startDate} - {trip.endDate}</p>
    </div>

    <div className="trip-actions">
      <button onClick={() => handleEditTrip(trip)}>📝</button>
      <button onClick={() => handleDeleteTrip(trip.id)}>🗑️</button>
    </div>
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
          <p><strong>Amount spent: </strong> ${Number(totalExpenses).toFixed(2)}</p>
          <p>Tracked from {expenseCount} {expenseCount === 1 ? "activity" : "activities"}</p>
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
      <select value={selectedTripForUpload} onChange={(e) => setSelectedTripForUpload(e.target.value)} required>
        <option value="">Select Trip</option>
        {trips.map((trip) => (
          <option key={trip.id} value={trip.id}>{trip.tripName}</option>
        ))}
      </select>
      <input type="file" onChange={handleFileChange} />
      <button className="save-btn" onClick={handleUploadDocument}>Submit doc</button>
      <button className="close-btn" onClick={() => setUploadPopupOpen(false)}>Close</button>
    </div>
  </div>
)}
      {isExpensePopupOpen && (
  <div className="popup">
    <div className="popup-content">
      <h3>Add Manual Expense</h3>
      <select value={selectedTripForExpense} onChange={(e) => setSelectedTripForExpense(e.target.value)} required>
        <option value="">Select Trip</option>
        {trips.map((trip) => (
          <option key={trip.id} value={trip.id}>{trip.tripName}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Amount ($)"
        value={expenseAmount}
        onChange={(e) => setExpenseAmount(e.target.value)}
        required
      />
      <select value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)}>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Shopping">Shopping</option>
        <option value="Hotel">Hotel</option>
        <option value="Activity">Activity</option>
        <option value="Flight">Flight</option>
        <option value="Other">Other</option>

      </select>
      <textarea
        placeholder="short description/Notes"
        value={expenseNotes}
        onChange={(e) => setExpenseNotes(e.target.value)}
      ></textarea>
      <button className="save-btn" onClick={handleAddExpense}>Add Expense</button> 
      <button className="close-btn" onClick={() => setExpensePopupOpen(false)}>Close</button>
    </div>
  </div>
)}

    </div>
  );
};

export default MainDashboard;
