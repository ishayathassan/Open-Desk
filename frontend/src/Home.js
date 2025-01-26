import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "./css/home.css";

const Home = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userVotes, setUserVotes] = useState({});
  const [hoverVotes, setHoverVotes] = useState({});
  const userId = parseInt(localStorage.getItem("user_id"), 10);

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage("Post created successfully!");
      window.history.replaceState({}, document.title);
    } else if (location.state?.error) {
      setErrorMessage(location.state.error);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/");
        const data = await response.json();
        setPosts(data);

        // Fetch user votes for all posts
        if (userId) {
          const votes = {};
          for (const post of data) {
            try {
              const voteResponse = await fetch(
                `http://127.0.0.1:5000/posts/${post.id}/vote`,
                { headers: { Authorization: `Bearer ${userId}` } }
              );
              if (voteResponse.ok) {
                const voteData = await voteResponse.json();
                votes[post.id] = voteData.vote_type;
              }
            } catch (err) {
              console.error("Error fetching vote for post", post.id, err);
            }
          }
          setUserVotes(votes);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, [userId]);

  const handleVote = async (postId, voteType) => {
    if (!userId) {
      alert("Please login to vote!");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/posts/${postId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userId}`,
          },
          body: JSON.stringify({ vote_type: voteType }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  upvote_counts: data.new_upvotes,
                  downvote_counts: data.new_downvotes,
                }
              : post
          )
        );
        setUserVotes((prev) => ({
          ...prev,
          [postId]: data.new_vote_status,
        }));
      } else {
        alert(data.error || "Failed to process vote");
      }
    } catch (err) {
      alert("Failed to connect to server");
    }
  };

  const getVoteColor = (postId, voteType) => {
    if (userVotes[postId] === voteType) return "#ff0000";
    if (hoverVotes[postId] === voteType) return "#ff0000";
    return "inherit";
  };

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
              <span
                onMouseEnter={() =>
                  setHoverVotes((prev) => ({ ...prev, [post.id]: "upvote" }))
                }
                onMouseLeave={() =>
                  setHoverVotes((prev) => ({ ...prev, [post.id]: null }))
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(post.id, "upvote");
                }}
                style={{
                  color: getVoteColor(post.id, "upvote"),
                  cursor: "pointer",
                }}
              >
                <i className="fa fa-thumbs-up"></i> {post.upvote_counts}
              </span>
              <span
                onMouseEnter={() =>
                  setHoverVotes((prev) => ({ ...prev, [post.id]: "downvote" }))
                }
                onMouseLeave={() =>
                  setHoverVotes((prev) => ({ ...prev, [post.id]: null }))
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(post.id, "downvote");
                }}
                style={{
                  color: getVoteColor(post.id, "downvote"),
                  cursor: "pointer",
                }}
              >
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
