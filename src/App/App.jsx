import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthProvider } from "../context/AuthContext";

// Pages
import HomePage from "../pages/HomePage/home";
import Destination from "../pages/Destination/Destination";
import Guide from "../pages/Guide/Guide";
import Profile from "../pages/Profile/profile";
import Login from "../pages/Login/login";
import Signup from "../pages/Login/signup";

import HotelList from "../pages/Hotel/HotelList";
import HotelDetail from "../pages/Hotel/HotelDetail";
import BookingDetails from "../pages/Hotel/BookingDetails";
import Payment from "../pages/Hotel/Payment";
import Confirmed from "../pages/Hotel/Confirmed";
import AllBookings from "../pages/AllBookings";
import GuidePayment from "../pages/Guide/GuidePayment";
import Restaurants from "../pages/Restaurant/restaurant";
import ChatWidget from "../components/ChatWidget";
import AdminChat from "../pages/Restaurant/adminChat";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <ChatWidget />

      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/destination/:id" element={<Destination />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/guide-payment/:bookingId" element={<GuidePayment />} />

        {/* Hotel */}
        <Route path="/hotels" element={<HotelList />} />
        <Route path="/hotels/:id" element={<HotelDetail />} />
        <Route path="/hotels/:hotelId/book" element={<BookingDetails />} />
        <Route path="/payment/:bookingId" element={<Payment />} />
        <Route path="/confirmed" element={<Confirmed />} />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <AllBookings />
            </ProtectedRoute>
          }
        />

        {/* Restaurant */}
        <Route path="/restaurant" element={<Restaurants />} />

        {/* Admin Chat */}
        <Route
          path="/admin/chat"
          element={
            <ProtectedRoute>
              <AdminChat />
            </ProtectedRoute>
          }
        />

        {/* Protected */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
