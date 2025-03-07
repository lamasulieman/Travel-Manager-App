import React from "react";
import "../styles/Signup.css";

const SignupPage = () => {
  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Sign Up</h2>
        <p>Already Registered? <a href="/login">Login</a></p>
        <input type="text" placeholder="Username" className="input-field" />
        <input type="email" placeholder="Email" className="input-field" />
        <input type="password" placeholder="Password" className="input-field" />
        <button className="signup-btn">Sign Up</button>
      </div>
    </div>
  );
};

export default SignupPage;
