import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Function to get the page name from path
  const getPageName = (path) => {
    switch (path) {
      case "/": return "Home";
      case "/dashboard": return "Dashboard";
      case "/itinerary": return "Itinerary";
      case "/expenses": return "Expenses";
      case "/storage": return "Storage";
      case "/signup": return "Sign Up";
      case "/login": return "Login";
      default: return "Travel Planner";
    }
  };

  return (
    <nav className="navbar">
      <div className="menu-icon" onClick={toggleMenu}>☰</div>
      
      {/* Display Current Page Name */}
      <h2 className="page-title">{getPageName(location.pathname)}</h2>
      
      {menuOpen && (
        <div className="dropdown-menu open">
          <ul className="nav-links">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
            <li><Link to="/itinerary" onClick={() => setMenuOpen(false)}>Itinerary</Link></li>
            <li><Link to="/expenses" onClick={() => setMenuOpen(false)}>Expenses</Link></li>
            <li><Link to="/storage" onClick={() => setMenuOpen(false)}>Storage</Link></li>
          </ul>
        </div>
      )}

      <div className="profile-icon">👤</div>
    </nav>
  );
};

export default Navbar;
