import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./components/HomePage";
import Profile from "./components/Profile";
import DestinationDetail from "./components/DestinationDetail"; // ✅ new import

function App() {
  return (
    <Router>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem", background: "#eee" }}>
        <Link to="/">Home</Link>
        <Link to="/profile">Profile</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/destination/:id" element={<DestinationDetail />} /> {/* ✅ new route */}
      </Routes>
    </Router>
  );
}

export default App;

