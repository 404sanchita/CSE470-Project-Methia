import React, { useEffect, useState } from "react";
import { fetchComments, postComment } from "../App/commentApi";
import { Link } from "react-router-dom";
import "./CommentSection.css";

function CommentSection({ resourceType, resourceId }) {
  const token = localStorage.getItem("token");

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchComments(resourceType, resourceId)
      .then((data) => setComments(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [resourceType, resourceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!token) {
      alert("Please login to comment");
      return;
    }

    try {
      const newComment = await postComment({
        resourceType,
        resourceId,
        text,
        token,
      });

      setComments((prev) => [newComment, ...prev]);
      setText("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit comment");
    }
  };

  return (
    <div>
      {token ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Write your comment..."
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
          <button
            type="submit"
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
              cursor: "pointer",
            }}
          >
            Submit Comment
          </button>
        </form>
      ) : (
        <p>
          🔒 <Link to="/login">Login</Link> to write a comment
        </p>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {comments.map((c) => (
            <li
              key={c._id}
              style={{
                backgroundColor: "#f9f9f9",
                padding: "1rem",
                borderRadius: "6px",
                marginBottom: "1rem",
              }}
            >
              <p>{c.text}</p>
              <small style={{ color: "#555" }}>
                {new Date(c.createdAt).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CommentSection;
