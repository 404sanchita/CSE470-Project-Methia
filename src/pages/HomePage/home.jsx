import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [destinations, setDestinations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [layout, setLayout] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/destinations")
      .then((res) => res.json())
      .then((data) => {
        setDestinations(data);
        setFiltered(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFiltered(
      destinations.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.country.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, destinations]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>WELCOME!</h1>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <input
          placeholder="Search destinations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "60%", padding: "0.5rem" }}
        />

        <button onClick={() => setLayout(layout === "list" ? "grid" : "list")}>
          {layout === "list" ? "Grid View" : "List View"}
        </button>
      </div>

      <div
        style={{
          display: layout === "grid" ? "grid" : "block",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        {filtered.map((dest) => (
          <div
            key={dest._id}
            onClick={() => navigate(`/destination/${dest._id}`)}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <h3>{dest.name}</h3>
            <p>{dest.country}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
