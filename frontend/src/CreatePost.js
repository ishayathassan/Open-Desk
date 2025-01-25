import React, { useState, useEffect } from "react";
import "./css/Create_post.css";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [channels, setChannels] = useState([]); // State to store the list of channels
  const [selectedChannel, setSelectedChannel] = useState("");

  // Fetch followed channels on component mount
  useEffect(() => {
    const fetchFollowedChannels = async () => {
      const userId = localStorage.getItem("user_id"); // Get user ID from localStorage
      if (!userId) {
        console.error("User ID is not available in localStorage");
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/followed_channels?user_id=${userId}`
        );
        const data = await response.json();

        if (response.ok) {
          setChannels(data.channels); // Set the fetched channels
        } else {
          console.error("Failed to fetch channels:", data.message);
        }
      } catch (error) {
        console.error("Error fetching followed channels:", error);
      }
    };

    fetchFollowedChannels();
  }, []);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleInput = (e) => {
    // Adjust the height dynamically based on content
    e.target.style.height = "auto"; // Reset height to calculate new height
    e.target.style.height = `${e.target.scrollHeight}px`; // Set new height
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      "Post submitted with content:",
      content,
      "Channel:",
      selectedChannel
    );
    // Add your post submission logic here
  };

  return (
    <div className="create-post-container">
      <h2>Create Post</h2>
      <form id="create-post-form" onSubmit={handleSubmit}>
        <div className="content-section">
          <div style={{ marginBottom: "20px" }}>
            <select
              name="select_channel"
              id="select-channel"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              required
            >
              <option value="">Select Community</option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            id="create-post-content"
            name="content"
            placeholder="Write your content here..."
            value={content}
            onChange={handleContentChange}
            onInput={handleInput}
            style={{ overflow: "hidden" }}
            required
          ></textarea>
        </div>
        <button type="submit" id="post-btn">
          Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
