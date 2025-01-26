import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./css/home.css"; // Import your custom CSS

const EditPostModal = ({
  editedContent,
  setEditedContent,
  onCancel,
  onUpdate,
}) => (
  <div className="modal-backdrop">
    <div className="edit-modal-content">
      <h3>Edit Post</h3>
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        rows="5"
        autoFocus // Add autoFocus to improve UX
      />
      <div className="edit-modal-buttons">
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button className="confirm-btn" onClick={onUpdate}>
          Update
        </button>
      </div>
    </div>
  </div>
);

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userVote, setUserVote] = useState(null);
  const [hoverVote, setHoverVote] = useState(null);
  const userId = parseInt(localStorage.getItem("user_id"), 10);

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]); // Initialize with empty array

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showDeletePostModal, setShowDeletePostModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  // Add these handlers
  const handlePostMenuToggle = () => setShowPostMenu(!showPostMenu);
  const closeModals = () => {
    setShowPostMenu(false);
    setShowDeletePostModal(false);
    setShowEditModal(false);
  };

  const handleEditPost = () => {
    setEditedContent(post.content);
    setShowEditModal(true);
    setShowPostMenu(false);
  };

  const handleUpdatePost = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({ content: editedContent }),
      });

      const data = await response.json();
      if (response.ok) {
        setPost((prev) => ({
          ...prev,
          content: data.content,
          updated_at: data.updated_at,
        }));
        setShowEditModal(false);
      } else {
        alert(data.error || "Failed to update post");
      }
    } catch (err) {
      alert("Failed to connect to server");
    }
  };

  const handleDeletePostConfirm = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userId}`,
        },
      });

      if (response.ok) {
        window.location.href = "/"; // Redirect to home after deletion
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete post");
      }
    } catch (err) {
      alert("Failed to connect to server");
    } finally {
      setShowDeletePostModal(false);
    }
  };

  // Add modals to the component
  const PostMenuDropdown = () => (
    <div className="post-menu-dropdown">
      <button onClick={handleEditPost}>Edit Post</button>
      <button onClick={() => setShowDeletePostModal(true)}>Delete Post</button>
    </div>
  );

  const DeletePostModal = () => (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Delete Post</h3>
        <p>
          Are you sure you want to delete this post? This action cannot be
          undone.
        </p>
        <div className="modal-buttons">
          <button
            className="cancel-btn"
            onClick={() => setShowDeletePostModal(false)}
          >
            Cancel
          </button>
          <button className="confirm-btn" onClick={handleDeletePostConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const handleDeleteInit = (commentId) => {
    setSelectedCommentId(commentId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCommentId) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/comments/${selectedCommentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userId}`,
          },
        }
      );

      if (response.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment.comment_id !== selectedCommentId)
        );
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete comment");
      }
    } catch (err) {
      alert("Failed to connect to server");
    } finally {
      setShowDeleteModal(false);
      setSelectedCommentId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedCommentId(null);
  };

  // Add this modal component before the return statement
  const DeleteConfirmationModal = () => (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Delete Comment</h3>
        <p>
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </p>
        <div className="modal-buttons">
          <button className="cancel-btn" onClick={handleDeleteCancel}>
            Cancel
          </button>
          <button className="confirm-btn" onClick={handleDeleteConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/posts/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userId}`,
          },
          body: JSON.stringify({
            content: newComment,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setComments((prev) => [data, ...prev]);
        setNewComment("");
      } else {
        alert(data.error || "Failed to post comment");
      }
    } catch (err) {
      alert("Failed to connect to server");
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userId}`,
          },
        }
      );

      if (response.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment.comment_id !== commentId)
        );
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete comment");
      }
    } catch (err) {
      alert("Failed to connect to server");
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First fetch post details
        const postResponse = await fetch(`http://127.0.0.1:5000/posts/${id}`);
        if (!postResponse.ok) {
          throw new Error("Failed to fetch post");
        }
        const postData = await postResponse.json();
        setPost(postData);

        // Then fetch comments
        const commentsResponse = await fetch(
          `http://127.0.0.1:5000/posts/${id}/comments`
        );
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          setComments(commentsData);
        }

        // Then fetch user vote if logged in
        if (userId) {
          const voteResponse = await fetch(
            `http://127.0.0.1:5000/posts/${id}/vote`,
            { headers: { Authorization: `Bearer ${userId}` } }
          );
          if (voteResponse.ok) {
            const voteData = await voteResponse.json();
            setUserVote(voteData.vote_type);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, userId]);

  // Single instance of rendering checks
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div>Post not found</div>;

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
          <div className="post-menu-container">
            {post.user?.user_id == userId && (
              <button className="post-menu-btn" onClick={handlePostMenuToggle}>
                <i className="fa-solid fa-ellipsis"></i>
              </button>
            )}

            {showPostMenu && <PostMenuDropdown />}
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
      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>

        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="3"
          />
          <button type="submit">Post Comment</button>
        </form>

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.comment_id} className="comment-card">
              <img
                src={comment.user?.avatar || "/images/user.png"}
                alt="User avatar"
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-header">
                  <div>
                    <span className="comment-username">
                      {comment.user?.username || "Anonymous"}
                    </span>
                    <span className="comment-time">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {comment.user?.user_id == userId && (
                    <button
                      className="delete-comment-btn"
                      onClick={() => handleDeleteInit(comment.comment_id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="comment-text">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showDeleteModal && <DeleteConfirmationModal />}
      {showEditModal && <EditPostModal />}
      {showDeletePostModal && <DeletePostModal />}
      {showEditModal && (
        <EditPostModal
          editedContent={editedContent}
          setEditedContent={setEditedContent}
          onCancel={() => setShowEditModal(false)}
          onUpdate={handleUpdatePost}
        />
      )}
    </div>
  );
};

export default PostDetail;
