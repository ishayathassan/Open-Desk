import React, { useState } from "react";
import "./css/Create_post.css"; // Import your custom CSS

const CreatePost = () => {
  const [content, setContent] = useState("");

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
    console.log("Post submitted with content:", content);
    // Add your post submission logic here
  };

  const handleAddTag = () => {
    console.log("Add Tag clicked");
    // Add logic for handling tags here
  };

  const handleSaveDraft = () => {
    console.log("Draft saved with content:", content);
    // Add logic for saving drafts here
  };

  return (
    <div className="create-post-container">
      <h2>Create Post</h2>
      <form id="create-post-form" onSubmit={handleSubmit}>
        <div className="content-section">
          <div style={{ marginBottom: "20px" }}>
            <select name="select_channel" id="">
              <option value="default">Select Community</option>

              <option value="CSE">CSE</option>
              <option value="AI">AI</option>
              <option value="DS">DS</option>
            </select>
          </div>
          {/* <div style={{ marginTop: "10px", marginBottom: "20px" }}>
            <select name="select_tags" id="">
              <option value="default">Select Tag</option>

              <option value="CSE">CSE</option>
              <option value="AI">AI</option>
              <option value="DS">DS</option>
            </select>
          </div> */}

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
