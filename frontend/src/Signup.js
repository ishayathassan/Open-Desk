import "./css/Signup.css";
import React, { useState, useEffect } from "react";
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

  const [message, setMessage] = useState("");

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
      [name]: type === "checkbox" || type === "radio" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for password mismatch
    if (formData.password1 !== formData.password2) {
      setMessage("Passwords do not match!");
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      has_reviewed: false,
      bio: "",
      profile_image: "",
    };

    try {
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        setMessage("Signup successful!");
        setFormData({
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
      } else {
        setMessage("Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error occurred. Please try again.");
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
              placeholder="full name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="institute email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
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
          </div>
          <div>
            <input
              type="password"
              id="password2"
              name="password2"
              placeholder="Re-type password"
              value={formData.password2}
              onChange={handleChange}
              required
            />
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
          Already a member? <a href="#">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
