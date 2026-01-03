import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthButton from "./AuthButton";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <header className="site-header">
      {/* Site Name / Logo */}
      <div className="site-name">
        <Link to="/">METHEIA</Link>
      </div>

      {/* Navigation Links */}
      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/restaurant">Restaurants</Link></li>
          <li><Link to="/hotels">Hotels</Link></li>
          <li><Link to="/guide">Guides</Link></li>
        

          {user && <li><Link to="/profile">Profile</Link></li>}
          {user && <li><Link to="/my-bookings">📋 My Bookings</Link></li>}
          {user && user.role === "admin" && (
            <li><Link to="/admin/chat">💬 Chat</Link></li>
          )}
        </ul>

        {/* Login / Logout Button */}
        <AuthButton className="auth-button" />
      </nav>
    </header>
  );
}
