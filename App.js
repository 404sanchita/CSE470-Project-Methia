import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Destinations from "./pages/destination";
import Restaurants from "./pages/restaurant";
import Hotels from "./pages/hotel";
import Guides from "./pages/guide";
import Booking from "./pages/booking";
import Quiz from "./pages/quiz";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

