import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom"; // Add this import
import "./css/home.css"; // Import your custom CSS

const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const location = useLocation(); // Get location state
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // const [formData, setFormData] = useState({
  //   title: "",
  //   content: "",
  //   category: "",
  // });

  // Read state on component mount
  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage("Post created successfully!");
      // Clear state after displaying
      window.history.replaceState({}, document.title);
    } else if (location.state?.error) {
      setErrorMessage(location.state.error);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch posts from an API (replace with your API endpoint)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/");
        const data = await response.json();
        console.log(data);
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  // Handle input change
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div id="feed-contents">
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {posts.map((post) => (
        <div key={post.id} className="posts card">
          <div className="card-header">
            <img src="/images/user.png" alt="User" />
            <div className="header-info">
              <div className="first-row">
                <span className="post-category">{post.category}</span>
                <span className="bullet">•</span>
                <span className="post-time">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="second-row">
                <span className="post-channel">{post.user.institute}</span>
                <span className="bullet">•</span>
                <span className="post-user">{post.user.username}</span>
              </div>
            </div>
          </div>
          <div
            className="card-content"
            onClick={() => navigate(`/posts/${post.id}`)}
          >
            <p style={{ cursor: "pointer" }}>
              {truncateContent(post.content)}
              {post.content.length > 150 && (
                <Link to={`/posts/${post.id}`} className="see-more-link">
                  See More
                </Link>
              )}
            </p>
          </div>
          <div className="card-footer">
            <div className="actions">
              <span>
                <i className="fa fa-thumbs-up"></i> {post.upvote_counts}
              </span>
              <span>
                <i className="fa fa-thumbs-down"></i> {post.downvote_counts}
              </span>
            </div>
            <div className="share">
              <i className="fa fa-share-alt"></i> Share
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
