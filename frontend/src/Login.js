import React, { useState } from "react";
import "./css/Signup.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "", // Clear specific error when the user types
    });
    setSuccessMessage(""); // Clear success message when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful login
        localStorage.setItem("user_id", data.user_id); // Save user_id
        localStorage.setItem("username", data.username); // Save username
        localStorage.setItem("email", data.email); // Save email
        setSuccessMessage(data.message);

        // Redirect to Home
        window.location.href = "/";
      } else {
        // Handle errors
        if (data.error === "Invalid email") {
          setErrors({ email: "Invalid email", password: "" });
        } else if (data.error === "Incorrect password") {
          setErrors({ email: "", password: "Incorrect password" });
        } else if (data.error === "Email and Password are required") {
          setErrors({
            email: "Email is required",
            password: "Password is required",
          });
        } else {
          setErrors({ email: "", password: "" });
          setSuccessMessage("Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      setSuccessMessage("Something went wrong. Please try again later.");
    }
  };

  return (
    <div id="login-card">
      <h1>Log into your Open Desk Community!</h1>
      <form className="signup-form login-form" onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
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
          {errors.password && (
            <p className="error-message">{errors.password}</p>
          )}
        </div>
        <button id="login_button" type="submit">
          Login
        </button>
      </form>
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default Login;
