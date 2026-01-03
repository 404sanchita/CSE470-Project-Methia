import React, { useState } from "react";
import { toggleReaction } from "../App/reactionApi";
import "./LikeDislike.css";

function LikeDislike({
  resourceType,
  resourceId,
  initialLikes = 0,
  initialDislikes = 0,
  initialReaction = null,
}) {
  const token = localStorage.getItem("token");

  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [reaction, setReaction] = useState(initialReaction);
  const [loading, setLoading] = useState(false);

  const handleReaction = async (type) => {
    if (!token) {
      alert("Please login to react");
      return;
    }

    try {
      setLoading(true);
      const data = await toggleReaction({
        resourceType,
        resourceId,
        type,
        token,
      });

      setLikes(data.likes);
      setDislikes(data.dislikes);
      setReaction(data.userReaction);
    } catch (err) {
      console.error(err);
      alert("Failed to update reaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
      <button
        onClick={() => handleReaction("like")}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          backgroundColor: reaction === "like" ? "#2e7d32" : "#4caf50",
          color: "white",
        }}
      >
        👍 {likes}
      </button>

      <button
        onClick={() => handleReaction("dislike")}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          backgroundColor: reaction === "dislike" ? "#c62828" : "#f44336",
          color: "white",
        }}
      >
        👎 {dislikes}
      </button>
    </div>
  );
}

export default LikeDislike;
