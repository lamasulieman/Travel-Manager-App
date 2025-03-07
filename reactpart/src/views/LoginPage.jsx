import React from "react";
import "../styles/Login.css";

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <p>"Welcome back! Ready to continue planning your next adventure?"</p>
        <input type="text" placeholder="Username" className="input-field" />
        <input type="password" placeholder="Password" className="input-field" />
        <button className="login-btn">Log In</button>
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </div>
    </div>
  );
};

export default LoginPage;
