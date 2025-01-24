import React, { useState, useEffect } from "react";
import "./css/home.css"; // Import your custom CSS

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
  });

  // Fetch posts from an API (replace with your API endpoint)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://localhost:5000/posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div id="feed-contents">
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
          <div className="card-content">
            <h4>{post.title}</h4>
            <p>{post.content}</p>
          </div>
          <div className="card-footer">
            <div className="actions">
              <span>
                <i className="fa fa-heart"></i> {post.like_count}
              </span>
              <span>
                <i className="fa fa-comment"></i> {post.comment_count}
              </span>
              <span>
                <i className="fa fa-eye"></i> {post.view_count}
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
