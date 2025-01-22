import "./css/Signup.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchUniversities, fetchPrograms } from "./fetchSignupFormData";

const Signup = () => {
  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
    password1: "",
    password2: "",
    university: "",
    program: "",
    year_of_study: "",
    is_anonymous: false,
  });
  const [errors, setErrors] = useState({
    passwordMismatch: false,
    usernameError: "",
    emailError: "",
  });
  const [passwordStrengthMessage, setPasswordStrengthMessage] = useState("");
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);

  // Function to validate password strength
  const validatePasswordStrength = (password) => {
    const lengthCheck = password.length >= 8;
    const numberCheck = /[0-9]/.test(password);
    const letterCheck = /[a-zA-Z]/.test(password);
    const specialCharCheck = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Check if password meets strength requirements
    if (lengthCheck && numberCheck && letterCheck && specialCharCheck) {
      setIsPasswordStrong(true);
      setPasswordStrengthMessage("Password is strong!");
    } else if (password.length < 8) {
      setIsPasswordStrong(false);
      setPasswordStrengthMessage(
        "Password must be at least 8 characters long."
      );
    } else if (!numberCheck || !letterCheck || !specialCharCheck) {
      setIsPasswordStrong(false);
      setPasswordStrengthMessage(
        "Password must include letters, numbers, and special characters."
      );
    } else {
      setIsPasswordStrong(false);
      setPasswordStrengthMessage("");
    }
  };
  useEffect(() => {
    const loadUniversities = async () => {
      const data = await fetchUniversities();
      setUniversities(data);
    };
    const loadPrograms = async () => {
      const data = await fetchPrograms();
      setPrograms(data);
    };
    loadUniversities();
    loadPrograms();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (name === "password1" || name === "password2") {
      setErrors({ ...errors, passwordMismatch: false }); // Reset password error
    }
    if (name === "username" || name === "email") {
      setErrors({ ...errors, usernameError: "", emailError: "" }); // Reset username/email errors
    }
    // Check password strength as user types
    if (name === "password1") {
      validatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password1 !== formData.password2) {
      setErrors({ ...errors, passwordMismatch: true });
      setFormData({ ...formData, password1: "", password2: "" });
      return;
    }
    if (!isPasswordStrong) {
      setPasswordStrengthMessage("Password must meet the strength criteria.");
      return;
    }

    const user = {
      full_name: formData.full_name,
      email: formData.email,
      username: formData.username,
      password: formData.password1,
      university: formData.university,
      program: formData.program,
      year_of_study: formData.year_of_study,
      is_anonymous: formData.is_anonymous,
    };

    try {
      console.log("Sending data:", user); // Log data before sending

      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Signup successful!");
      } else {
        if (result.error === "Username is already taken") {
          setErrors({ ...errors, usernameError: result.error });
        } else if (result.error === "Email is already registered") {
          setErrors({ ...errors, emailError: result.error });
        } else {
          alert("Signup failed! Please try again.");
        }
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };
  return (
    <div id="main">
      <div id="left">
        <h1>Unlock the Power of Community</h1>
        <p>
          Open Desk is a platform designed to bring university students
          together, fostering collaboration, communication, and community.
          Whether you're seeking academic support, sharing experiences, or
          exploring opportunities, Open Desk creates a space where your voice is
          heard, and your ideas are valued.
        </p>
        <p>
          Engage with students across campuses, discuss topics that matter to
          you, and build meaningful connections that extend beyond your academic
          life. From study groups to career advice, Open Desk is your go-to
          destination for navigating university life with the support of a
          like-minded community.
        </p>
        <p>Join Open Desk today—where every student has a seat at the table!</p>
      </div>
      <div className="right">
        <h2>Sign up for Open Desk</h2>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              id="name"
              name="full_name"
              placeholder="Full name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Institutional email"
              value={formData.email}
              onChange={handleChange}
              style={{
                borderColor: errors.emailError ? "red" : "",
              }}
              required
            />
            {errors.emailError && (
              <p style={{ color: "red" }}>{errors.emailError}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              style={{
                borderColor: errors.usernameError ? "red" : "",
              }}
              required
            />
            {errors.usernameError && (
              <p style={{ color: "red" }}>{errors.usernameError}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              id="password1"
              name="password1"
              placeholder="Enter a strong password"
              value={formData.password1}
              onChange={handleChange}
              required
            />
            {passwordStrengthMessage && (
              <p
                style={{
                  fontSize: "12px",
                  marginBottom: "0px",
                  marginLeft: "2px",
                  width: "500px",
                }}
                className={`password-strength-message ${
                  isPasswordStrong ? "strong" : "weak"
                }`}
              >
                {passwordStrengthMessage}
              </p>
            )}
          </div>
          <div>
            <input
              type="password"
              id="password2"
              name="password2"
              placeholder="Re-type password"
              value={formData.password2}
              onChange={handleChange}
              style={{
                borderColor: errors.passwordMismatch ? "red" : "",
              }}
              required
            />
            {errors.passwordMismatch && (
              <p style={{ color: "red" }}>
                Passwords do not match. Please try again.
              </p>
            )}
          </div>
          <div>
            <select
              id="university"
              name="university"
              value={formData.university}
              onChange={handleChange}
              required
            >
              <option value="">Select University</option>
              {universities.map((university) => (
                <option key={university.id} value={university.name}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
            >
              <option value="">Select Program</option>
              {programs.map((program) => (
                <option key={program.id} value={program.name}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="number"
              id="study_year"
              name="year_of_study"
              placeholder="Year of study"
              value={formData.year_of_study}
              onChange={handleChange}
              required
            />
          </div>
          <div id="anonymous_div">
            <input
              type="radio"
              id="is_anonymous"
              name="is_anonymous"
              checked={formData.is_anonymous}
              onChange={handleChange}
            />
            <label htmlFor="is_anonymous">Remain Anonymity</label>
          </div>
          <button type="submit">Signup</button>
        </form>

        <p className="agreement">
          By creating an account, you agree to our <a href="#">Terms of Use</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </p>

        <p className="signin">
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
