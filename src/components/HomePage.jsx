import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [destinations, setDestinations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [layout, setLayout] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Fetch all destinations
  useEffect(() => {
    fetch("http://localhost:5001/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        setDestinations(data);
        setFiltered(data);
      })
      .catch((err) => console.error("Failed to fetch:", err));
  }, []);

  // Handle search
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(term) ||
        d.country.toLowerCase().includes(term)
    );
    setFiltered(results);
  }, [searchTerm, destinations]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🌍 Travel Destinations</h1>

      {/* Search + Layout Switch */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <input
          type="text"
          placeholder="Search destinations or countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            width: "60%",
            fontSize: "1rem",
          }}
        />

        <button
          onClick={() => setLayout(layout === "list" ? "grid" : "list")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
          }}
        >
          {layout === "list" ? "Grid View" : "List View"}
        </button>
      </div>

      {/* Destination Cards */}
      <div
        style={{
          display: layout === "grid" ? "grid" : "block",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((dest) => (
            <div
              key={dest._id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "1rem",
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onClick={() => navigate(`/destination/${dest._id}`)}
            >
              <h3>{dest.name}</h3>
              <p style={{ color: "#666" }}>{dest.country}</p>
              <p>{dest.description?.slice(0, 80)}...</p>

              {/* ✅ Like/Dislike counts only */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "0.5rem",
                  color: "#444",
                }}
              >
                <span>👍 {dest.likes || 0}</span>
                <span>👎 {dest.dislikes || 0}</span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ marginTop: "2rem" }}>No destinations found.</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;
