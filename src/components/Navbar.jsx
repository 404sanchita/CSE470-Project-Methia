import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthButton from "./AuthButton";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem",
        borderBottom: "1px solid #ddd",
      }}
    >
      <ul style={{ display: "flex", gap: "1rem", listStyle: "none" }}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/restaurant">Restaurants</Link></li>
        <li><Link to="/hotel">Hotels</Link></li>
        <li><Link to="/guide">Guides</Link></li>
        <li><Link to="/booking">Booking</Link></li>

        {/* ✅ Show only when logged in */}
        {user && <li><Link to="/profile">Profile</Link></li>}
      </ul>

      {/* ✅ Common login/logout button */}
      <AuthButton />
    </nav>
  );
}

