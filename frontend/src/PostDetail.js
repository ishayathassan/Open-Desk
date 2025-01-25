import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./css/home.css"; // Import your custom CSS

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userVote, setUserVote] = useState(null);
  const [hoverVote, setHoverVote] = useState(null);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchPostAndVote = async () => {
      try {
        // Fetch post details
        const postResponse = await fetch(`http://127.0.0.1:5000/posts/${id}`);
        const postData = await postResponse.json();

        if (!postResponse.ok) {
          setError(postData.error || "Failed to load post");
          return;
        }

        // Fetch user's vote if logged in
        if (userId) {
          const voteResponse = await fetch(
            `http://127.0.0.1:5000/posts/${id}/vote`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const voteData = await voteResponse.json();
          if (voteResponse.ok) {
            setUserVote(voteData.vote_type);
          }
        }

        setPost(postData);
      } catch (err) {
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndVote();
  }, [id, userId]);

  const handleVote = async (voteType) => {
    if (!userId) {
      alert("Please login to vote!");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/posts/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({
          vote_type: voteType,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPost((prev) => ({
          ...prev,
          upvote_counts: data.new_upvotes,
          downvote_counts: data.new_downvotes,
        }));
        setUserVote(data.new_vote_status);
      } else {
        alert(data.error || "Failed to process vote");
      }
    } catch (err) {
      alert("Failed to connect to server");
    }
  };

  const getVoteColor = (voteType) => {
    if (userVote === voteType) return "#ff0000";
    if (hoverVote === voteType) return "#ff0000";
    return "inherit";
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div>Post not found</div>;

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="feed-contents">
      <h1>Post Details</h1>
      <div className="posts card">
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
        <div className="card-content">
          <p>{post.content}</p>
        </div>
        <div className="card-footer">
          <div className="actions">
            <span
              onMouseEnter={() => setHoverVote("upvote")}
              onMouseLeave={() => setHoverVote(null)}
              onClick={() => handleVote("upvote")}
              style={{ color: getVoteColor("upvote"), cursor: "pointer" }}
            >
              <i className="fa fa-thumbs-up"></i> {post.upvote_counts}
            </span>
            <span
              onMouseEnter={() => setHoverVote("downvote")}
              onMouseLeave={() => setHoverVote(null)}
              onClick={() => handleVote("downvote")}
              style={{ color: getVoteColor("downvote"), cursor: "pointer" }}
            >
              <i className="fa fa-thumbs-down"></i> {post.downvote_counts}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
