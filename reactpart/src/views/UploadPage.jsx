import React from "react";
import { Link } from "react-router-dom";

const MainPage = () => {
  return (
    <div>
      <h1>Main Dashboard</h1>
      <p>Upload documents and start planning your trips.</p>
      <Link to="/upload">
        <button>Upload Booking</button>
      </Link>
    </div>
  );
};

export default MainPage;
