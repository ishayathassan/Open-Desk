import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./css/home.css";

const AllChannels = () => {
  const [channels, setChannels] = useState([]); // State to hold channel data
  const [error, setError] = useState(null); // State to hold errors
  const [loading, setLoading] = useState(true); // State to track loading

  // Fetch channels on component mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/channels"); // Replace with your API URL
        if (!response.ok) {
          throw new Error("Failed to fetch channels");
        }
        const data = await response.json();
        setChannels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  if (loading) return <div>Loading channels...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="all-channels">
      <h1>All Channels</h1>
      <div id="feed-contents">
        {channels.length === 0 ? (
          <p>No channels available.</p>
        ) : (
          channels.map((channel) => (
            <div key={channel.channel_id} className="posts card">
              <Link to={`/channels/${channel.channel_id}`}>
                <div className="card-header">
                  <img
                    src={channel.logo_image || "/images/user.png"}
                    alt={`${channel.name} Logo`}
                    className="user-icon"
                  />
                  <div className="header-info">
                    <div className="first-row">
                      <h2 className="post-category">{channel.name}</h2>
                    </div>
                    <div className="second-row">
                      <span className="post-channel">
                        {channel.is_private
                          ? "Private Channel"
                          : "Public Channel"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <div className="card-content">
                <p>{channel.bio}</p>
              </div>
              <div className="card-footer">
                <div className="actions">
                  <span>
                    <i className="fa fa-users"></i> {channel.follow_count}{" "}
                    Followers
                  </span>
                  <span>
                    <i className="fa fa-pencil"></i> {channel.post_count} Posts
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllChannels;
