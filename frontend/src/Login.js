import React, { useState } from "react";
import "./css/Signup.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/users?username=${formData.username}`
      );
      const data = await response.json();

      if (data.length === 0) {
        setMessage("User not found!");
        return;
      }

      const user = data[0];

      if (user.password === formData.password) {
        setMessage("Login successful!");
        // Handle successful login (e.g., redirect, save user info to context/state)
      } else {
        setMessage("Incorrect password!");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <div id="login-card">
      <h1>Log into your Open Desk Community!</h1>
      <form className="signup-form login-form" onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button id="login_button" type="submit">
          Login
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
