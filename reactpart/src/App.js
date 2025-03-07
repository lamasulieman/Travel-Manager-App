import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // ✅ Ensure this is imported
import WelcomePage from "./views/WelcomePage";
import SignupPage from "./views/SignupPage";
import LoginPage from "./views/LoginPage";
import MainDashboard from "./views/MainPage";
import ItineraryView from "./views/ItineraryPage";

// ✅ Check if these files exist before importing
import ExpensesReviews from "./views/ExpensesReviews"; // Add this if the file exists
 import Storage from "./views/Storage"; // Add this if the file exists

function App() {
  return (
    <Router>
      <div>
        <Navbar />  {/* ✅ Make sure Navbar is used here */}
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/itinerary" element={<ItineraryView startDate="2025-06-10" endDate="2025-06-15" />} />
          {/* ✅ Remove these if the components don't exist yet */}
          <Route path="/expenses" element={<ExpensesReviews />} />
          <Route path="/storage" element={<Storage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
