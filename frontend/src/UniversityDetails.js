import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./css/SingleChannel.css";

const UniversityDetails = () => {
  const { uniId } = useParams();
  const [activeTab, setActiveTab] = useState("about");
  const [university, setUniversity] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUniversityData = async () => {
      try {
        const universityResponse = await fetch(
          `http://127.0.0.1:5000/universities/${uniId}`
        );
        if (!universityResponse.ok) {
          throw new Error("Failed to fetch university details");
        }
        const universityData = await universityResponse.json();
        setUniversity(universityData);
      } catch (error) {
        console.error("Error fetching university data:", error);
        setError(error.message);
      }
    };

    const fetchReviewsData = async () => {
      try {
        const reviewsResponse = await fetch(
          `http://127.0.0.1:5000/universities/${uniId}/reviews`
        );

        if (!reviewsResponse.ok) {
          if (reviewsResponse.status === 404) {
            setReviews([]);
            return;
          }
          throw new Error("Failed to fetch reviews");
        }

        const reviewsData = await reviewsResponse.json();

        if (reviewsData.message) {
          setReviews([]);
        } else {
          setReviews(reviewsData.reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews data:", error);
        setError(error.message);
      }
    };

    fetchUniversityData();
    fetchReviewsData();
  }, [uniId]);

  if (error) return <div>Error: {error}</div>;
  if (!university) return <div>Loading university details...</div>;

  return (
    <div className="single-channel-container">
      {/* University Name Section */}
      <div className="channel_cover">
        <img
          src={"/images/background.png"}
          alt="Channel background"
          className="cover-image"
        />
        <div className="channel_profile_pic">
          <img
            src={"/images/profile_pic.jpg"}
            alt="Channel profile"
            className="profile-image"
          />
        </div>
        <h1 className="channel-title">
          {university.name || "Loading university name..."}
        </h1>
      </div>

      {/* Tabs Section */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
      </div>

      <div className="channel-content-wrapper">
        {activeTab === "about" && (
          <div className="about-section">
            <div className="about-card">
              <div className="about-card-header">
                <h2>University Rating</h2>
              </div>
              <div className="about-card-content">
                <p>Overall Rating: {university.uni_rating}</p>
                <p>Career Growth: {university.avg_career_growth}</p>
                <p>University Culture: {university.avg_uni_culture}</p>
                <p>Resources: {university.avg_resources}</p>
                <p>Co-curriculars: {university.avg_cocurriculars}</p>
                <p>Alumni: {university.avg_alumni}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="overview-section">
            <div className="overview-card">
              <div className="overview-card-header">
                <h2>Overview</h2>
              </div>
              <div className="overview-card-content">
                {university.overview ? (
                  <>
                    <p>
                      <strong>About:</strong> {university.overview.about}
                    </p>
                    <p>
                      <strong>Location:</strong> {university.overview.location}
                    </p>
                    <p>
                      <strong>Website:</strong>{" "}
                      <a
                        href={university.overview.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {university.overview.website_url}
                      </a>
                    </p>
                  </>
                ) : (
                  <p>No overview available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-section">
            {reviews.length === 0 ? (
              <p>No reviews available.</p>
            ) : (
              reviews.map((review, index) => (
                <div key={index} className="review-box">
                  <div className="rating">
                    <span className="stars">{review.rating} ★★★★☆</span>
                    <h3>{review.title}</h3>
                  </div>
                  <div className="reviewer-details">
                    <span>
                      {review.username} · {review.date}
                    </span>
                  </div>
                  <div className="review-content">
                    <strong>Pros</strong>
                    <p>{review.pros}</p>
                    <strong>Cons</strong>
                    <p>{review.cons}</p>
                  </div>
                  <div className="review-actions">
                    <button>Helpful ({review.helpfulCount})</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityDetails;
