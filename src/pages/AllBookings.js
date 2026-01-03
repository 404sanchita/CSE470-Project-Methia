import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import api from "../App/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AllBookings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [hotelBookings, setHotelBookings] = useState([]);
  const [restaurantBookings, setRestaurantBookings] = useState([]);
  const [guideBookings, setGuideBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hotel booking edit state
  const [editingHotelId, setEditingHotelId] = useState(null);
  const [editForm, setEditForm] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 1
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Restaurant booking edit state
  const [editingRestaurantId, setEditingRestaurantId] = useState(null);
  const [editRestaurantForm, setEditRestaurantForm] = useState({
    date: "",
    time: "",
    numberOfGuests: 1,
    specialRequests: ""
  });
  const [editRestaurantError, setEditRestaurantError] = useState("");
  const [editRestaurantSuccess, setEditRestaurantSuccess] = useState("");

  // Guide booking edit state
  const [editingGuideId, setEditingGuideId] = useState(null);
  const [editGuideForm, setEditGuideForm] = useState({
    date: "",
    hours: 1
  });
  const [editGuideError, setEditGuideError] = useState("");
  const [editGuideSuccess, setEditGuideSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAllBookings();
  }, [user, navigate]);

  const fetchAllBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch hotel bookings (using userId)
      if (user._id) {
        try {
          const hotelRes = await axios.get(`http://localhost:5000/api/bookings/my/${user._id}`);
          setHotelBookings(hotelRes.data || []);
        } catch (err) {
          console.error("Error fetching hotel bookings:", err);
          setHotelBookings([]);
        }
      }

      // Fetch restaurant bookings (using email)
      if (user.email) {
        try {
          const restaurantRes = await axios.get(
            `http://localhost:5000/api/restaurants/bookings/my?email=${encodeURIComponent(user.email)}`
          );
          setRestaurantBookings(restaurantRes.data || []);
        } catch (err) {
          console.error("Error fetching restaurant bookings:", err);
          setRestaurantBookings([]);
        }
      }

      // Fetch guide bookings (using protected route) - only if route exists
      // Note: This route may not be registered in server.js
      try {
        const guideRes = await api.get("/guidebookings/my");
        setGuideBookings(guideRes.data || []);
      } catch (err) {
        // Route may not exist, silently fail
        console.error("Guide bookings not available:", err.message);
        setGuideBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hotel booking functions
  const startEditHotel = (booking) => {
    setEditingHotelId(booking._id);
    setEditForm({
      checkInDate: booking.checkInDate.split('T')[0],
      checkOutDate: booking.checkOutDate.split('T')[0],
      guests: booking.guests || 1
    });
    setEditError("");
    setEditSuccess("");
  };

  const cancelEditHotel = () => {
    setEditingHotelId(null);
    setEditForm({ checkInDate: "", checkOutDate: "", guests: 1 });
    setEditError("");
    setEditSuccess("");
  };

  const submitEditHotel = async () => {
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

    try {
      const res = await axios.post(`http://localhost:5000/api/bookings/modify/${editingHotelId}`, {
        checkInDate: editForm.checkInDate,
        checkOutDate: editForm.checkOutDate,
        guests: parseInt(editForm.guests)
      });

      setHotelBookings(hotelBookings.map(b =>
        b._id === editingHotelId
          ? { ...b, ...res.data }
          : b
      ));

      setEditSuccess("✅ Booking updated successfully!");
      setTimeout(() => {
        cancelEditHotel();
      }, 2000);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update booking");
    }
  };

  const cancelHotelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await axios.put(`http://localhost:5000/api/bookings/cancel/${id}`);
      setHotelBookings(hotelBookings.map(b =>
        b._id === id ? { ...b, bookingStatus: "Cancelled" } : b
      ));
    } catch (err) {
      alert("Failed to cancel booking. Please try again.");
      console.error("Error cancelling booking:", err);
    }
  };

  // Restaurant booking functions
  const startEditRestaurant = (booking) => {
    setEditingRestaurantId(booking._id);
    setEditRestaurantForm({
      date: booking.date,
      time: booking.time,
      numberOfGuests: booking.numberOfGuests || 1,
      specialRequests: booking.specialRequests || ""
    });
    setEditRestaurantError("");
    setEditRestaurantSuccess("");
  };

  const cancelEditRestaurant = () => {
    setEditingRestaurantId(null);
    setEditRestaurantForm({ date: "", time: "", numberOfGuests: 1, specialRequests: "" });
    setEditRestaurantError("");
    setEditRestaurantSuccess("");
  };

  const submitEditRestaurant = async () => {
    setEditRestaurantError("");
    setEditRestaurantSuccess("");

    if (!editRestaurantForm.date || !editRestaurantForm.time || !editRestaurantForm.numberOfGuests) {
      setEditRestaurantError("Please fill in all required fields");
      return;
    }

    if (editRestaurantForm.numberOfGuests < 1) {
      setEditRestaurantError("Number of guests must be at least 1");
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/restaurants/bookings/${editingRestaurantId}`, editRestaurantForm);

      setRestaurantBookings(restaurantBookings.map(b =>
        b._id === editingRestaurantId
          ? { ...b, ...res.data.booking }
          : b
      ));

      setEditRestaurantSuccess("✅ Booking updated successfully!");
      setTimeout(() => {
        cancelEditRestaurant();
      }, 2000);
    } catch (err) {
      setEditRestaurantError(err.response?.data?.message || "Failed to update booking");
    }
  };

  const cancelRestaurantBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await axios.put(`http://localhost:5000/api/restaurants/bookings/${id}/cancel`);
      setRestaurantBookings(restaurantBookings.map(b =>
        b._id === id ? { ...b, bookingStatus: "cancelled" } : b
      ));
    } catch (err) {
      // If cancel route doesn't exist, just show message
      alert("Cancellation feature not available for restaurant bookings yet.");
      console.error("Error cancelling restaurant booking:", err);
    }
  };

  // Guide booking functions
  const startEditGuide = (booking) => {
    setEditingGuideId(booking._id);
    const bookingDate = booking.date ? (new Date(booking.date).toISOString().split('T')[0]) : "";
    setEditGuideForm({
      date: bookingDate,
      hours: booking.hours || 1
    });
    setEditGuideError("");
    setEditGuideSuccess("");
  };

  const cancelEditGuide = () => {
    setEditingGuideId(null);
    setEditGuideForm({ date: "", hours: 1 });
    setEditGuideError("");
    setEditGuideSuccess("");
  };

  const submitEditGuide = async () => {
    setEditGuideError("");
    setEditGuideSuccess("");

    if (!editGuideForm.date || !editGuideForm.hours) {
      setEditGuideError("Please fill in all required fields");
      return;
    }

    if (editGuideForm.hours < 1) {
      setEditGuideError("Hours must be at least 1");
      return;
    }

    try {
      const res = await api.put(`/guidebookings/${editingGuideId}`, editGuideForm);

      setGuideBookings(guideBookings.map(b =>
        b._id === editingGuideId
          ? { ...b, ...res.data.booking }
          : b
      ));

      setEditGuideSuccess("✅ Booking updated successfully!");
      setTimeout(() => {
        cancelEditGuide();
        fetchAllBookings(); // Refresh to get updated totalCost
      }, 2000);
    } catch (err) {
      setEditGuideError(err.response?.data?.message || "Failed to update booking");
    }
  };

  const confirmGuideBooking = async (id) => {
    if (!window.confirm("Confirm this booking? This will mark it as confirmed.")) return;
    
    try {
      const res = await api.put(`/guidebookings/${id}/confirm`);
      setGuideBookings(guideBookings.map(b =>
        b._id === id ? { ...b, paymentStatus: "confirmed" } : b
      ));
      alert("Booking confirmed successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to confirm booking. Please try again.");
      console.error("Error confirming guide booking:", err);
    }
  };

  const cancelGuideBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await api.put(`/guidebookings/${id}/cancel`);
      setGuideBookings(guideBookings.map(b =>
        b._id === id ? { ...b, paymentStatus: "cancelled" } : b
      ));
    } catch (err) {
      alert("Failed to cancel booking. Please try again.");
      console.error("Error cancelling guide booking:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>My Bookings</h1>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  const activeHotelBookings = hotelBookings.filter(b => 
    b.bookingStatus !== "Cancelled"
  );
  const cancelledHotelBookings = hotelBookings.filter(b => 
    b.bookingStatus === "Cancelled"
  );

  const activeRestaurantBookings = restaurantBookings.filter(b => 
    b.bookingStatus !== "cancelled" && b.bookingStatus !== "Cancelled"
  );
  const cancelledRestaurantBookings = restaurantBookings.filter(b => 
    b.bookingStatus === "cancelled" || b.bookingStatus === "Cancelled"
  );

  const activeGuideBookings = guideBookings.filter(b => 
    b.paymentStatus !== "cancelled"
  );
  const cancelledGuideBookings = guideBookings.filter(b => 
    b.paymentStatus === "cancelled"
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>📋 My Bookings</h1>

      {/* Hotel Bookings Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1rem", color: "#2563eb" }}>
          🏨 Hotel Bookings ({activeHotelBookings.length} active, {cancelledHotelBookings.length} cancelled)
        </h2>
        
        {activeHotelBookings.length === 0 && cancelledHotelBookings.length === 0 ? (
          <p style={{ color: "#666" }}>No hotel bookings found.</p>
        ) : (
          <>
            {activeHotelBookings.map(booking => (
              <div key={booking._id} style={{
                background: "#f9fafb",
                padding: "1.5rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                border: "1px solid #e5e7eb"
              }}>
                {editingHotelId === booking._id ? (
                  <div>
                    <h3>Edit Booking - {booking.hotelName}</h3>
                    {editError && <p style={{ color: "red" }}>{editError}</p>}
                    {editSuccess && <p style={{ color: "green" }}>{editSuccess}</p>}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                      <div>
                        <label>Check-in Date</label>
                        <input
                          type="date"
                          value={editForm.checkInDate}
                          onChange={(e) => setEditForm({ ...editForm, checkInDate: e.target.value })}
                          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                        />
                      </div>
                      <div>
                        <label>Check-out Date</label>
                        <input
                          type="date"
                          value={editForm.checkOutDate}
                          onChange={(e) => setEditForm({ ...editForm, checkOutDate: e.target.value })}
                          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                      <label>Guests</label>
                      <input
                        type="number"
                        min="1"
                        value={editForm.guests}
                        onChange={(e) => setEditForm({ ...editForm, guests: parseInt(e.target.value) })}
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                      <button onClick={submitEditHotel} style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Save
                      </button>
                      <button onClick={cancelEditHotel} style={{ padding: "0.5rem 1rem", background: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{booking.hotelName}</h3>
                        <p style={{ margin: "0.5rem 0", color: "#666" }}>📍 {booking.hotelLocation}</p>
                      </div>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        background: booking.bookingStatus === "Confirmed" ? "#dcfce7" : "#fef3c7",
                        color: booking.bookingStatus === "Confirmed" ? "#166534" : "#92400e"
                      }}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                      <div>
                        <strong>Check-in:</strong> {new Date(booking.checkInDate).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Check-out:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Guests:</strong> {booking.guests || 1}
                      </div>
                      <div>
                        <strong>Total:</strong> ${booking.totalPrice || booking.hotelPrice}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button
                        onClick={() => startEditHotel(booking)}
                        style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => cancelHotelBooking(booking._id)}
                        style={{ padding: "0.5rem 1rem", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </section>

      {/* Restaurant Bookings Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1rem", color: "#dc2626" }}>
          🍽️ Restaurant Bookings ({activeRestaurantBookings.length} active, {cancelledRestaurantBookings.length} cancelled)
        </h2>
        
        {activeRestaurantBookings.length === 0 && cancelledRestaurantBookings.length === 0 ? (
          <p style={{ color: "#666" }}>No restaurant bookings found.</p>
        ) : (
          activeRestaurantBookings.map(booking => (
            <div key={booking._id} style={{
              background: "#f9fafb",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              border: "1px solid #e5e7eb"
            }}>
              {editingRestaurantId === booking._id ? (
                <div>
                  <h3>Edit Booking - {booking.restaurantName || "Restaurant"}</h3>
                  {editRestaurantError && <p style={{ color: "red" }}>{editRestaurantError}</p>}
                  {editRestaurantSuccess && <p style={{ color: "green" }}>{editRestaurantSuccess}</p>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                    <div>
                      <label>Date</label>
                      <input
                        type="date"
                        value={editRestaurantForm.date}
                        onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, date: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                      />
                    </div>
                    <div>
                      <label>Time</label>
                      <input
                        type="time"
                        value={editRestaurantForm.time}
                        onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, time: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    <label>Number of Guests</label>
                    <input
                      type="number"
                      min="1"
                      value={editRestaurantForm.numberOfGuests}
                      onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, numberOfGuests: parseInt(e.target.value) })}
                      style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                    />
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    <label>Special Requests (optional)</label>
                    <textarea
                      value={editRestaurantForm.specialRequests}
                      onChange={(e) => setEditRestaurantForm({ ...editRestaurantForm, specialRequests: e.target.value })}
                      style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem", minHeight: "80px" }}
                      placeholder="Any special requests..."
                    />
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button onClick={submitEditRestaurant} style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                      Save
                    </button>
                    <button onClick={cancelEditRestaurant} style={{ padding: "0.5rem 1rem", background: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{booking.restaurantName || "Restaurant"}</h3>
                    </div>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      background: "#fef3c7",
                      color: "#92400e"
                    }}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                    <div><strong>Date:</strong> {booking.date}</div>
                    <div><strong>Time:</strong> {booking.time}</div>
                    <div><strong>Guests:</strong> {booking.numberOfGuests}</div>
                    {booking.specialRequests && (
                      <div><strong>Requests:</strong> {booking.specialRequests}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      onClick={() => startEditRestaurant(booking)}
                      style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => cancelRestaurantBooking(booking._id)}
                      style={{ padding: "0.5rem 1rem", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Cancel Booking
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </section>

      {/* Guide Bookings Section */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ marginBottom: "1rem", color: "#059669" }}>
          🧳 Guide Bookings ({activeGuideBookings.length} active, {cancelledGuideBookings.length} cancelled)
        </h2>
        
        {activeGuideBookings.length === 0 && cancelledGuideBookings.length === 0 ? (
          <p style={{ color: "#666" }}>No guide bookings found.</p>
        ) : (
          activeGuideBookings.map(booking => (
            <div key={booking._id} style={{
              background: "#f9fafb",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              border: "1px solid #e5e7eb"
            }}>
              {editingGuideId === booking._id ? (
                <div>
                  <h3>Edit Guide Booking</h3>
                  {editGuideError && <p style={{ color: "red" }}>{editGuideError}</p>}
                  {editGuideSuccess && <p style={{ color: "green" }}>{editGuideSuccess}</p>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                    <div>
                      <label>Date</label>
                      <input
                        type="date"
                        value={editGuideForm.date}
                        onChange={(e) => setEditGuideForm({ ...editGuideForm, date: e.target.value })}
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                      />
                    </div>
                    <div>
                      <label>Hours</label>
                      <input
                        type="number"
                        min="1"
                        value={editGuideForm.hours}
                        onChange={(e) => setEditGuideForm({ ...editGuideForm, hours: parseInt(e.target.value) })}
                        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button onClick={submitEditGuide} style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                      Save
                    </button>
                    <button onClick={cancelEditGuide} style={{ padding: "0.5rem 1rem", background: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                    <div>
                      <h3 style={{ margin: 0 }}>Guide Booking</h3>
                      <p style={{ margin: "0.5rem 0", color: "#666" }}>📍 {booking.destination}</p>
                    </div>
                    <span style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      background: "#dcfce7",
                      color: "#166534"
                    }}>
                      {booking.paymentStatus || "Active"}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                    <div><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</div>
                    {booking.hours && <div><strong>Hours:</strong> {booking.hours}</div>}
                    {booking.totalCost && <div><strong>Cost:</strong> {booking.totalCost}</div>}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <button
                      onClick={() => startEditGuide(booking)}
                      style={{ padding: "0.5rem 1rem", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      ✏️ Edit
                    </button>
                    {booking.paymentStatus === "pending" && (
                      <button
                        onClick={() => confirmGuideBooking(booking._id)}
                        style={{ padding: "0.5rem 1rem", background: "#059669", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        ✅ Confirm Booking
                      </button>
                    )}
                    {booking.paymentStatus !== "paid" && booking.paymentStatus !== "cancelled" && booking.totalCost && (
                      <button
                        onClick={() => navigate(`/guide-payment/${booking._id}`)}
                        style={{ padding: "0.5rem 1rem", background: "#7c3aed", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        💳 Pay Now
                      </button>
                    )}
                    <button
                      onClick={() => cancelGuideBooking(booking._id)}
                      style={{ padding: "0.5rem 1rem", background: "#dc2626", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Cancel Booking
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default AllBookings;

