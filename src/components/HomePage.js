import React, { useEffect, useState } from "react";

function HomePage() {
  const [destinations, setDestinations] = useState([]);
  const [layout, setLayout] = useState("list");

  useEffect(() => {
    fetch("http://localhost:5000/api/destinations")
      .then((res) => res.json())
      .then((data) => setDestinations(data))
      .catch((err) => console.error("Failed to fetch:", err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🌍 Travel Destinations</h1>

      <button onClick={() => setLayout(layout === "list" ? "grid" : "list")}>
        Switch to {layout === "list" ? "Grid" : "List"} View
      </button>

      <div
        style={{
          display: layout === "grid" ? "grid" : "block",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {destinations.map((dest) => (
          <div
            key={dest._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              cursor: "pointer",
            }}
            onClick={() => alert(`You clicked on ${dest.name}`)}
          >
            <h3>{dest.name}</h3>
            <p>{dest.country}</p>
            <p>{dest.description?.slice(0, 80)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
