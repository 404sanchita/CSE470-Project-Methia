import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar";
import Login from "./pages/login";
import Signup from "./pages/signup";
import HotelList from "./pages/hotellist";
import HotelDetail from "./pages/hoteldetail";
import BookingDetails from "./pages/bookingdetail";
import Payment from "./pages/payment";
import Confirmed from "./pages/confirmation";
import MyBookings from "./pages/mybookings";

// Basic route protection
const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("userId");
  return userId ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Pages */}
        <Route
          path="/hotels"
          element={
            <ProtectedRoute>
              <HotelList />
            </ProtectedRoute>
          }
        />

        <Route path="/my-bookings" element={<MyBookings />} />

        <Route
          path="/hotels/:id"
          element={
            <ProtectedRoute>
              <HotelDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book/:id"
          element={
            <ProtectedRoute>
              <BookingDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/confirmed"
          element={
            <ProtectedRoute>
              <Confirmed />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}

export default App;
