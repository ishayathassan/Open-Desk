import { Link, useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./css/SingleChannel.css";

const SingleChannel = () => {
  const { channelId } = useParams(); // Get channelId from the URL params
  const [isJoined, setIsJoined] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [channel, setChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followCount, setFollowCount] = useState(0);

  useEffect(() => {
    if (!channelId) {
      console.error("Channel ID is undefined");
      return;
    }

    const fetchChannelData = async () => {
      const username = localStorage.getItem("username"); // Get username from localStorage

      if (!username) {
        alert("Please log in to access channel data.");
        return;
      }

      try {
        // Fetch channel details
        const channelResponse = await fetch(
          `http://127.0.0.1:5000/channels/${channelId}`
        );
        const channelData = await channelResponse.json();
        setChannel(channelData);

        // Fetch follow status and posts for the channel
        const followResponse = await fetch(
          `http://127.0.0.1:5000/channels/${channelId}/follow-status?username=${username}`
        );
        const followData = await followResponse.json();

        if (followResponse.ok && !followData.error) {
          setIsJoined(followData.follow_status === "Following");
        } else {
          console.error("Error fetching follow status:", followData.error);
          setIsJoined(false);
        }

        const postsResponse = await fetch(
          `http://127.0.0.1:5000/channels/${channelId}/posts`
        );
        const postsData = await postsResponse.json();
        setPosts(postsData);

        setFollowCount(channelData.follow_count); // Set follow count from channel data
      } catch (error) {
        console.error("Error fetching channel data:", error);
      }
    };

    fetchChannelData();
  }, [channelId]);

  const handleJoinToggle = async () => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      alert("Please log in to follow/unfollow channels.");
      return;
    }

    const method = isJoined ? "DELETE" : "POST"; // DELETE when leaving, POST when joining

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/channels/${channelId}/follow`,
        {
          method: method,
          headers: {
            Authorization: `Bearer ${userId}`,
            "X-User-ID": userId,
          },
        }
      );

      if (response.ok) {
        setIsJoined(!isJoined); // Toggle follow status
        setFollowCount((prevCount) => prevCount + (isJoined ? -1 : 1)); // Update follow count
      } else {
        alert("Failed to update follow status.");
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
    }
  };

  if (!channel) return <div>Loading...</div>;

  return (
    <div className="single-channel-container">
      {/* Channel Cover Section */}
      <div className="channel_cover">
        <img
          src={channel.cover_image || "/images/background.png"}
          alt="Channel background"
          className="cover-image"
        />
        <div className="channel_profile_pic">
          <img
            src={channel.logo_image || "/images/profile_pic.jpg"}
            alt="Channel profile"
            className="profile-image"
          />
        </div>
        <h1 className="channel-title">{channel.name}</h1>
        <button
          onClick={handleJoinToggle}
          className={`join-button ${isJoined ? "joined" : ""}`}
        >
          {isJoined ? "Leave" : "Join"}
        </button>
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
          className={`tab-button ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
      </div>

      <div className="channel-content-wrapper">
        {/* About Section */}
        {activeTab === "about" && (
          <div className="about-section">
            <div className="about-card">
              <div className="about-card-header">
                <h2>Bio</h2>
              </div>
              <div className="about-card-content">
                <p>{channel.bio || "No bio available for this channel."}</p>
              </div>
            </div>

            <div className="about-card">
              <div className="about-card-header">
                <h2>Rules</h2>
              </div>
              <div className="about-card-content">
                <p>{channel.rules || "No rules available for this channel."}</p>
              </div>
            </div>
          </div>
        )}
        {/* Posts Section */}
        {activeTab === "posts" && (
          <div className="posts-section">
            {posts.map((post) => (
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleChannel;
