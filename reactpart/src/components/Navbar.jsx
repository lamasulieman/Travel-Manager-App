import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import "../styles/Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // ✅ Updates state when user logs in or out
    });

    return () => unsubscribe();
  }, [auth]);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // ✅ Ensure user state updates after logout
      alert("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
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

  // 🔹 Hide Navbar on Login and Signup Pages
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return user ? ( // 🔥 Only show Navbar if user is logged in
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
            {user && ( // ✅ Only show Logout button if user is logged in
              <li><button className="logout-btn" onClick={handleLogout}>Logout</button></li>
            )}
          </ul>
        </div>
      )}

      <div className="profile-icon"></div>
    </nav>
  ) : null; // 🔥 If user is logged out, Navbar won't be rendered
};

export default Navbar;
