import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";

import HomePage from "../pages/HomePage/home";
import Destination from "../pages/Destination/destination";
import Guide from "../pages/Guide/guide";
import Profile from "../pages/Profile/profile";
import Login from "../pages/Login/login";
import Signup from "../pages/Login/signup";

import { AuthProvider } from "../context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/destination/:id" element={<Destination />} />
        <Route path="/guide" element={<Guide />} />

        {/* 🔒 Protected Profile Route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
