import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/WelcomePage.css";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <nav className="navbar">

      </nav>
      <div className="welcome-content">
        <div className="text-section">
          <h1>Your Travel Companion for Effortless Planning</h1>
          <p>
            Discover a smarter way to organize your trips. Easily plan, track expenses, and store all your bookings in one place. Make your journeys seamless and stress-free!
          </p>
          <div className="buttons">
            <button className="join-btn" onClick={() => navigate("/signup")}>Join Now</button>
            <button className="login-btn" onClick={() => navigate("/login")}>Log In</button>
            
          </div>
        </div>
        <div className="image-section">
          <img src="/assets/welcome.jpg" alt="Travel" className="illustration" />
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
