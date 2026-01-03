import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const BookingDetails = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [hotel, setHotel] = useState(null);

  // Fetch hotel details
  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/hotels/${hotelId}`);
        setHotel(res.data);
      } catch (err) {
        console.error("Error fetching hotel:", err);
        setError("Failed to load hotel details");
      }
    };
    fetchHotel();
  }, [hotelId]);

  // Real-time availability check
  useEffect(() => {
    if (!checkIn || !checkOut || !hotelId) {
      setAvailability(null);
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setAvailability({
        isAvailable: false,
        message: "Check-out date must be after check-in date"
      });
      return;
    }

    const checkAvailability = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/hotels/availability/check",
          {
            hotelId: hotelId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            roomsNeeded: parseInt(guests)
          }
        );
        setAvailability(res.data);
      } catch (err) {
        console.error("Error checking availability:", err);
      }
    };

    checkAvailability();
  }, [checkIn, checkOut, guests, hotelId]);

  const handleConfirm = async () => {
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates");
      return;
    }

    if (!availability?.isAvailable) {
      setError(availability?.message || "Selected dates are not available");
      return;
    }

    // Get userId from user object (from AuthContext or localStorage)
    let userId = null;
    if (user && user._id) {
      userId = user._id;
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          userId = userObj._id || userObj.id;
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      }
    }

    if (!userId) {
      setError("Please login to make a booking");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const booking = {
        hotelId: hotelId,
        userId: userId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: parseInt(guests),
        paymentMethod: null
      };

      const res = await axios.post(
        "http://localhost:5000/api/bookings",
        booking
      );

      // Store booking details for confirmation page
      localStorage.setItem("lastBooking", JSON.stringify(res.data));

      navigate(`/payment/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create booking. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateTotalPrice = () => {
    if (!hotel) return 0;
    const pricePerNight = hotel.price || hotel.pricePerNight || 0;
    return pricePerNight * calculateNights();
  };

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="booking-detail-container">
      <div className="booking-detail-card">
        <h2 className="page-title">Booking Details</h2>

        {hotel && (
          <div style={{
            background: "var(--light-bg)",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "25px",
            borderLeft: "4px solid var(--primary-color)"
          }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>{hotel.name}</h3>
            <p style={{ margin: "5px 0", color: "var(--text-light)" }}>
              📍 {hotel.location}
            </p>
            <p style={{ margin: "5px 0", color: "var(--text-dark)", fontWeight: "600" }}>
              ${hotel.price || hotel.pricePerNight || 0} / night
            </p>
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(220, 38, 38, 0.1)",
            color: "var(--danger-color)",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "0.9rem",
            border: "1px solid rgba(220, 38, 38, 0.3)"
          }}>
            ❌ {error}
          </div>
        )}

        {availability && availability.isAvailable && (
          <div style={{
            background: "rgba(22, 163, 74, 0.1)",
            color: "var(--success-color)",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "0.9rem",
            border: "1px solid rgba(22, 163, 74, 0.3)"
          }}>
            ✅ {availability.message} ({availability.availableRooms}/{availability.totalRooms})
          </div>
        )}

        {availability && !availability.isAvailable && (
          <div style={{
            background: "rgba(220, 38, 38, 0.1)",
            color: "var(--danger-color)",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "0.9rem",
            border: "1px solid rgba(220, 38, 38, 0.3)"
          }}>
            ❌ {availability.message}
          </div>
        )}

        <form className="booking-form">
          <div className="form-group">
            <label htmlFor="checkin">Check-in Date</label>
            <input
              id="checkin"
              type="date"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setError("");
              }}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkout">Check-out Date</label>
            <input
              id="checkout"
              type="date"
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setError("");
              }}
              min={checkIn || new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="guests">Number of Guests</label>
            <input
              id="guests"
              type="number"
              min="1"
              max="10"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>

          {nights > 0 && hotel && (
            <div style={{
              background: "var(--light-bg)",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "15px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span>{nights} night(s) × ${hotel.price || hotel.pricePerNight || 0}</span>
                <span style={{ fontWeight: "600" }}>${totalPrice}</span>
              </div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                paddingTop: "10px",
                borderTop: "1px solid var(--border-color)",
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "var(--success-color)"
              }}>
                <span>Total:</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={handleConfirm}
            disabled={loading || !availability?.isAvailable}
            style={{
              opacity: loading || !availability?.isAvailable ? 0.6 : 1,
              cursor: loading || !availability?.isAvailable ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
            style={{ marginTop: "10px" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingDetails;
