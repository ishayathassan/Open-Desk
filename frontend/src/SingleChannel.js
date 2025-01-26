import "./css/SingleChannel.css";
import React, { useState, useEffect } from "react";

const SingleChannel = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  const handleJoinToggle = () => {
    setIsJoined((prevState) => !prevState);
  };
  const demoPosts = [
    {
      id: 1,
      content: "This is a demo post about software engineering challenges...",
      category: "General",
      created_at: new Date().toISOString(),
      user: {
        username: "demoUser",
        institute: "UIU",
      },
      upvote_counts: 12,
      downvote_counts: 2,
    },
    {
      id: 2,
      content:
        "Another post discussing best practices in software development...",
      category: "Discussion",
      created_at: new Date().toISOString(),
      user: {
        username: "anotherUser",
        institute: "UIU",
      },
      upvote_counts: 8,
      downvote_counts: 1,
    },
  ];

  return (
    <div className="single-channel-container">
      {/* Channel Cover Section */}
      <div className="channel_cover">
        <img
          src="/images/background.png"
          alt="Channel background"
          className="cover-image"
        />
        <div className="channel_profile_pic">
          <img
            src="/images/profile_pic.jpg"
            alt="Channel profile"
            className="profile-image"
          />
        </div>
        <h1 className="channel-title">Software Engineering</h1>
        <button
          onClick={handleJoinToggle}
          className={`join-button ${isJoined ? "joined" : ""}`}
        >
          {isJoined ? "Leave" : "Join"}
        </button>
      </div>
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
        <button
          className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
      </div>
      <div className="channel-content-wrapper">
        {/* Posts Section */}
        <div className="posts-section">
          {demoPosts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="card-header">
                <img
                  src="/images/userIcon.png"
                  alt="User"
                  className="user-icon"
                />
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
      </div>
    </div>
  );
};

export default SingleChannel;
