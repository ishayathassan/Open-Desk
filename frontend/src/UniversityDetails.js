import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./css/SingleChannel.css";

const UniversityDetails = () => {
  const { uniId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [university, setUniversity] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [posts, setPosts] = useState([]); // Initialize posts as an empty array
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
          setReviews(reviewsData.reviews || []); // Ensure reviews is an array
        }
      } catch (error) {
        console.error("Error fetching reviews data:", error);
        setError(error.message);
      }
    };

    const fetchPostsData = async () => {
      try {
        const postsResponse = await fetch(
          `http://127.0.0.1:5000/universities/${uniId}/posts`
        );

        if (!postsResponse.ok) {
          if (postsResponse.status === 404) {
            setPosts([]); // Set posts to an empty array if no posts are found
            return;
          }
          throw new Error("Failed to fetch posts");
        }

        const postsData = await postsResponse.json();
        console.log("Posts Data:", postsData); // Add this line to debug

        // If the postsData is directly an array, use it like this:
        setPosts(postsData || []); // Directly set the posts array
      } catch (error) {
        console.error("Error fetching posts data:", error);
        setError(error.message);
      }
    };

    fetchUniversityData();
    fetchReviewsData();
    fetchPostsData();
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
        <button
          className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
      </div>

      <div className="channel-content-wrapper">
        {activeTab === "overview" && (
          <div className="about-section">
            <div className="about-card">
              <div className="about-card-header">
                <h2>Overview</h2>
              </div>
              <div className="about-card-content">
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

        {activeTab === "posts" && (
          <div className="posts-section">
            {posts.length === 0 ? (
              <p>No posts available.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="card-header">
                    <img
                      src="/images/user.png"
                      alt="User"
                      className="user-icon"
                    />
                    <div className="header-info">
                      <div className="first-row">
                        <Link to="">
                          <span className="post-category">
                            {post.channel_name}
                          </span>
                        </Link>
                        <span className="bullet">•</span>
                        <span className="post-time">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="second-row">
                        <span className="post-channel">
                          {post.user.institute}
                        </span>
                        <span className="bullet">•</span>
                        <span className="post-user">{post.user.username}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-content">
                    <p>{post.content}</p>
                  </div>
                  <div className="card-footer">
                    <div className="actions">
                      <span>
                        <i className="fa fa-thumbs-up"></i> {post.upvote_counts}
                      </span>
                      <span>
                        <i className="fa fa-thumbs-down"></i>{" "}
                        {post.downvote_counts}
                      </span>
                    </div>
                    <div className="share">
                      <i className="fa fa-share-alt"></i> Share
                    </div>
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
