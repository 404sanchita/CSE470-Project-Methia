import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function DestinationDetail() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);

  // Fetch single destination
  useEffect(() => {
    fetch(`http://localhost:5001/api/destinations/${id}`)
      .then((res) => res.json())
      .then((data) => setDestination(data))
      .catch((err) => console.error("Failed to load destination:", err));
  }, [id]);

  // Handle like
  const handleLike = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/destinations/${id}/like`, {
        method: "PUT",
      });
      const data = await res.json();
      setDestination((prev) => ({ ...prev, likes: data.likes }));
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  // Handle dislike
  const handleDislike = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/destinations/${id}/dislike`, {
        method: "PUT",
      });
      const data = await res.json();
      setDestination((prev) => ({ ...prev, dislikes: data.dislikes }));
    } catch (err) {
      console.error("Failed to dislike:", err);
    }
  };

  if (!destination) return <p style={{ padding: "2rem" }}>Loading destination...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <Link to="/" style={{ textDecoration: "none", color: "#007bff" }}>
        ← Back to Home
      </Link>

      <h1 style={{ marginTop: "1rem" }}>{destination.name}</h1>
      <p>
        <strong>Country:</strong> {destination.country}
      </p>
      <p>
        <strong>Best Season:</strong> {destination.bestSeason}
      </p>
      <p>
        <strong>Estimated Budget:</strong> {destination.estimatedBudget}
      </p>
      <p>
        <strong>Language:</strong> {destination.language}
      </p>
      <p>
        <strong>Currency:</strong> {destination.currency}
      </p>
      <p style={{ marginTop: "1rem" }}>{destination.description}</p>

      {/* ✅ Like / Dislike Buttons */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          onClick={handleLike}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "white",
            cursor: "pointer",
          }}
        >
          👍 {destination.likes || 0}
        </button>

        <button
          onClick={handleDislike}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#f44336",
            color: "white",
            cursor: "pointer",
          }}
        >
          👎 {destination.dislikes || 0}
        </button>
      </div>

      {/* Image Gallery */}
      <h2 style={{ marginTop: "2rem" }}>📸 Gallery</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
        }}
      >
        {destination.image?.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Destination ${index}`}
            style={{ width: "100%", borderRadius: "8px" }}
          />
        ))}
      </div>

      {/* Top Attractions */}
      <h2 style={{ marginTop: "2rem" }}>🏛️ Top Attractions</h2>
      <ul>
        {destination.topAttractions?.map((att, i) => (
          <li key={i}>
            <a href={att} target="_blank" rel="noopener noreferrer">
              {att}
            </a>
          </li>
        ))}
      </ul>

      {/* Restaurants */}
      <h2 style={{ marginTop: "2rem" }}>🍽️ Popular Restaurants</h2>
      <ul>
        {destination.restaurants?.map((rest, i) => (
          <li key={i}>
            <a href={rest} target="_blank" rel="noopener noreferrer">
              {rest}
            </a>
          </li>
        ))}
      </ul>

      {/* Transport Options */}
      <h2 style={{ marginTop: "2rem" }}>🚗 Transport Options</h2>
      <ul>
        {destination.transportOptions?.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>

      {/* Etiquette Tips */}
      <h2 style={{ marginTop: "2rem" }}>🤝 Etiquette Tips</h2>
      <ul>
        {destination.etiquetteTips?.map((tip, i) => (
          <li key={i}>{tip}</li>
        ))}
      </ul>

      {/* Packing Checklist */}
      <h2 style={{ marginTop: "2rem" }}>🎒 Packing Checklist</h2>
      <ul>
        {destination.packingChecklist?.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default DestinationDetail;
