import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Confirmed = () => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Retrieve booking details from localStorage
    const lastBooking = localStorage.getItem("lastBooking");
    if (lastBooking) {
      setBooking(JSON.parse(lastBooking));
    }
  }, []);

  const goBackToHotels = () => {
    localStorage.removeItem("lastBooking");
    navigate("/hotels");
  };

  const goToMyBookings = () => {
    localStorage.removeItem("lastBooking");
    navigate("/my-bookings");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!booking) return 0;
    return booking.hotelPrice * calculateNights();
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-icon">🎉</div>
        <h2>Booking Confirmed!</h2>
        <p>Your hotel reservation has been successfully booked. A confirmation email has been sent to you.</p>

        {booking && (
          <div style={{
            background: "var(--light-bg)",
            padding: "25px",
            borderRadius: "8px",
            marginBottom: "25px",
            textAlign: "left",
            border: "1px solid var(--border-color)"
          }}>
            <h3 style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              color: "var(--text-dark)",
              marginBottom: "15px",
              paddingBottom: "10px",
              borderBottom: "2px solid var(--border-color)"
            }}>
              Booking Details
            </h3>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px"
            }}>
              <div>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--text-light)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: "5px"
                }}>
                  Hotel Name
                </p>
                <p style={{
                  fontSize: "1rem",
                  color: "var(--text-dark)",
                  fontWeight: "600",
                  margin: "0"
                }}>
                  {booking.hotelName}
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--text-light)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: "5px"
                }}>
                  Location
                </p>
                <p style={{
                  fontSize: "1rem",
                  color: "var(--text-dark)",
                  fontWeight: "600",
                  margin: "0"
                }}>
                  {booking.hotelLocation}
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--text-light)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: "5px"
                }}>
                  Check-in
                </p>
                <p style={{
                  fontSize: "1rem",
                  color: "var(--text-dark)",
                  fontWeight: "600",
                  margin: "0"
                }}>
                  {formatDate(booking.checkInDate)}
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--text-light)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: "5px"
                }}>
                  Check-out
                </p>
                <p style={{
                  fontSize: "1rem",
                  color: "var(--text-dark)",
                  fontWeight: "600",
                  margin: "0"
                }}>
                  {formatDate(booking.checkOutDate)}
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--text-light)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: "5px"
                }}>
                  Guests
                </p>
                <p style={{
                  fontSize: "1rem",
                  color: "var(--text-dark)",
                  fontWeight: "600",
                  margin: "0"
                }}>
                  {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--text-light)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: "5px"
                }}>
                  Duration
                </p>
                <p style={{
                  fontSize: "1rem",
                  color: "var(--text-dark)",
                  fontWeight: "600",
                  margin: "0"
                }}>
                  {calculateNights()} {calculateNights() === 1 ? "night" : "nights"}
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--text-light)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: "5px"
                }}>
                  Price per Night
                </p>
                <p style={{
                  fontSize: "1rem",
                  color: "var(--text-dark)",
                  fontWeight: "600",
                  margin: "0"
                }}>
                  ${booking.hotelPrice}
                </p>
              </div>

              <div>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--text-light)",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  marginBottom: "5px"
                }}>
                  Status
                </p>
                <p style={{
                  fontSize: "1rem",
                  color: "var(--success-color)",
                  fontWeight: "700",
                  margin: "0"
                }}>
                  ✅ {booking.bookingStatus}
                </p>
              </div>
            </div>

            <div style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "2px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{
                fontSize: "0.9rem",
                color: "var(--text-light)"
              }}>
                Total Amount:
              </span>
              <span style={{
                fontSize: "1.3rem",
                fontWeight: "700",
                color: "var(--success-color)"
              }}>
                ${calculateTotal()}
              </span>
            </div>

            {booking._id && (
              <div style={{
                marginTop: "15px",
                padding: "10px",
                background: "rgba(37, 99, 235, 0.05)",
                borderRadius: "6px",
                fontSize: "0.85rem",
                color: "var(--text-light)"
              }}>
                <strong>Booking ID:</strong> {booking._id}
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
          <button
            className="btn-primary"
            onClick={goToMyBookings}
          >
            View My Bookings
          </button>
          <button
            className="btn-secondary"
            onClick={goBackToHotels}
          >
            Browse More Hotels
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmed;
