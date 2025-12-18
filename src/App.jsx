import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Destinations from "./pages/destination";
import Restaurants from "./pages/restaurant";
import Hotels from "./pages/hotel";
import Guides from "./pages/guide";
import Booking from "./pages/booking";
import Quiz from "./pages/quiz";

// Extra components
import HomePage from "./components/HomePage";
import Profile from "./components/Profile";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />

        {/* Simple extra nav bar */}
        <nav
          style={{
            display: "flex",
            gap: "1rem",
            padding: "1rem",
            background: "#eee",
          }}
        >
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
        </nav>

        <Routes>
          {/* Existing routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/destination"
            element={
              <ProtectedRoute>
                <Destinations />
              </ProtectedRoute>
            }
          />
          <Route path="/restaurant" element={<Restaurants />} />
          <Route path="/hotel" element={<Hotels />} />
          <Route path="/guide" element={<Guides />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/quiz" element={<Quiz />} />

          {/* New routes */}
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
