import React, { useEffect, useState } from "react";
import axios from "axios";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 1
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [availabilityInfo, setAvailabilityInfo] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bookings/my/${userId}`);
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const startEdit = (booking) => {
    setEditingId(booking._id);
    setEditForm({
      checkInDate: booking.checkInDate.split('T')[0],
      checkOutDate: booking.checkOutDate.split('T')[0],
      guests: booking.guests || 1
    });
    setEditError("");
    setEditSuccess("");
    setAvailabilityInfo(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ checkInDate: "", checkOutDate: "", guests: 1 });
    setEditError("");
    setEditSuccess("");
    setAvailabilityInfo(null);
  };

  const calculateNights = () => {
    if (!editForm.checkInDate || !editForm.checkOutDate) return 0;
    const checkIn = new Date(editForm.checkInDate);
    const checkOut = new Date(editForm.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const getHotelPrice = () => {
    const booking = bookings.find(b => b._id === editingId);
    return booking?.hotelPrice || 0;
  };

  const calculatePrice = () => {
    return getHotelPrice() * calculateNights();
  };

  const submitEdit = async () => {
    setEditError("");
    setEditSuccess("");

    if (!editForm.checkInDate || !editForm.checkOutDate) {
      setEditError("Please select both check-in and check-out dates");
      return;
    }

    if (new Date(editForm.checkInDate) >= new Date(editForm.checkOutDate)) {
      setEditError("Check-out date must be after check-in date");
      return;
    }

    if (editForm.guests < 1) {
      setEditError("Number of guests must be at least 1");
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/bookings/modify/${editingId}`, {
        checkInDate: editForm.checkInDate,
        checkOutDate: editForm.checkOutDate,
        guests: parseInt(editForm.guests)
      });

      // Update bookings list
      setBookings(bookings.map(b =>
        b._id === editingId
          ? {
              ...b,
              checkInDate: editForm.checkInDate,
              checkOutDate: editForm.checkOutDate,
              guests: parseInt(editForm.guests),
              totalPrice: res.data.totalPrice
            }
          : b
      ));

      setEditSuccess("✅ Booking updated successfully!");
      setTimeout(() => {
        setEditingId(null);
        setEditForm({ checkInDate: "", checkOutDate: "", guests: 1 });
        setEditSuccess("");
      }, 2000);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update booking");
    }
  };

  const cancelBooking = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/cancel/${id}`);
      setBookings(bookings.map(b =>
        b._id === id ? { ...b, bookingStatus: "Cancelled" } : b
      ));
    } catch (err) {
      console.error("Error cancelling booking:", err);
    }
  };

  if (!userId) {
    return (
      <div className="my-bookings-container">
        <div className="empty-state">
          <p>Please log in to view your bookings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-bookings-container">
        <h1 className="page-title">My Bookings</h1>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  const current = bookings.filter(
    b => b.bookingStatus === "Pending" || b.bookingStatus === "Confirmed"
  );

  const past = bookings.filter(
    b => b.bookingStatus === "Cancelled"
  );

  return (
    <div className="my-bookings-container">
      <h1 className="page-title">My Bookings</h1>

      <div className="bookings-section">
        <h2 className="bookings-section-title">🟢 Active Bookings ({current.length})</h2>
        {current.length === 0 ? (
          <div className="empty-state">
            <p>You have no active bookings.</p>
          </div>
        ) : (
          current.map(b => (
            <div key={b._id} className="booking-item">
              {editingId === b._id ? (
                // Edit Mode
                <div style={{ padding: "20px", background: "var(--light-bg)", borderRadius: "8px" }}>
                  <h3 style={{ marginTop: "0", marginBottom: "20px", fontSize: "1.1rem" }}>Edit Booking</h3>

                  {editError && (
                    <div style={{
                      background: "rgba(220, 38, 38, 0.1)",
                      color: "var(--danger-color)",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      fontSize: "0.9rem"
                    }}>
                      ❌ {editError}
                    </div>
                  )}

                  {editSuccess && (
                    <div style={{
                      background: "rgba(22, 163, 74, 0.1)",
                      color: "var(--success-color)",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      fontSize: "0.9rem"
                    }}>
                      {editSuccess}
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem" }}>Check-in Date</label>
                      <input
                        type="date"
                        value={editForm.checkInDate}
                        onChange={(e) => {
                          setEditForm({ ...editForm, checkInDate: e.target.value });
                          setEditError("");
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "2px solid var(--border-color)",
                          borderRadius: "6px",
                          fontSize: "0.9rem"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem" }}>Check-out Date</label>
                      <input
                        type="date"
                        value={editForm.checkOutDate}
                        onChange={(e) => {
                          setEditForm({ ...editForm, checkOutDate: e.target.value });
                          setEditError("");
                        }}
                        min={editForm.checkInDate || new Date().toISOString().split("T")[0]}
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "2px solid var(--border-color)",
                          borderRadius: "6px",
                          fontSize: "0.9rem"
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "0.9rem" }}>Guests</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editForm.guests}
                      onChange={(e) => {
                        setEditForm({ ...editForm, guests: e.target.value });
                        setEditError("");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "2px solid var(--border-color)",
                        borderRadius: "6px",
                        fontSize: "0.9rem"
                      }}
                    />
                  </div>

                  {calculateNights() > 0 && (
                    <div style={{
                      background: "white",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "15px",
                      fontSize: "0.9rem"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span>{calculateNights()} night(s) × ${getHotelPrice()}</span>
                        <span style={{ fontWeight: "600" }}>${calculatePrice()}</span>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: "8px",
                        borderTop: "1px solid var(--border-color)",
                        fontWeight: "700",
                        color: "var(--success-color)"
                      }}>
                        <span>New Total:</span>
                        <span>${calculatePrice()}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={submitEdit}
                      className="btn-primary"
                      style={{ flex: 1, padding: "10px", fontSize: "0.9rem" }}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn-secondary"
                      style={{ flex: 1, padding: "10px", fontSize: "0.9rem" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <>
                  <div className="booking-item-header">
                    <h3 className="booking-item-title">{b.hotelName}</h3>
                    <span className={`booking-status ${b.bookingStatus.toLowerCase()}`}>
                      {b.bookingStatus}
                    </span>
                  </div>
                  <div className="booking-item-details">
                    <div className="booking-detail-item">
                      <span className="booking-detail-label">Location</span>
                      <span className="booking-detail-value">📍 {b.hotelLocation}</span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="booking-detail-label">Check-in</span>
                      <span className="booking-detail-value">
                        {new Date(b.checkInDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="booking-detail-label">Check-out</span>
                      <span className="booking-detail-value">
                        {new Date(b.checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="booking-detail-label">Guests</span>
                      <span className="booking-detail-value">{b.guests || 1}</span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="booking-detail-label">Total Price</span>
                      <span className="booking-detail-value" style={{ color: "var(--success-color)", fontWeight: "700" }}>
                        ${b.totalPrice || b.hotelPrice}
                      </span>
                    </div>
                    <div className="booking-detail-item">
                      <span className="booking-detail-label">Payment Status</span>
                      <span className="booking-detail-value">{b.payment?.status || "N/A"}</span>
                    </div>
                  </div>
                  <div className="booking-item-actions">
                    <button
                      className="btn-primary"
                      onClick={() => startEdit(b)}
                      style={{ fontSize: "0.85rem" }}
                    >
                      ✏️ Edit
                    </button>
                    {b.bookingStatus !== "Cancelled" && (
                      <button
                        className="btn-danger"
                        onClick={() => cancelBooking(b._id)}
                        style={{ fontSize: "0.85rem" }}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="bookings-section">
        <h2 className="bookings-section-title">⚫ Cancelled Bookings ({past.length})</h2>
        {past.length === 0 ? (
          <div className="empty-state">
            <p>No cancelled bookings.</p>
          </div>
        ) : (
          past.map(b => (
            <div key={b._id} className="booking-item cancelled">
              <div className="booking-item-header">
                <h3 className="booking-item-title">{b.hotelName}</h3>
                <span className="booking-status cancelled">
                  Cancelled
                </span>
              </div>
              <div className="booking-item-details">
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Location</span>
                  <span className="booking-detail-value">📍 {b.hotelLocation}</span>
                </div>
                <div className="booking-detail-item">
                  <span className="booking-detail-label">Cancelled On</span>
                  <span className="booking-detail-value">
                    {new Date(b.cancelledAt || b.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBookings;
