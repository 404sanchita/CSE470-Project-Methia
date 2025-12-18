import React, { useEffect, useState } from "react";
import axios from "axios";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return; // 👈 guard INSIDE useEffect

    axios
      .get(`http://localhost:5000/api/bookings/my/${userId}`)
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  }, [userId]);

  const cancelBooking = async (id) => {
    await axios.put(`http://localhost:5000/api/bookings/cancel/${id}`);
    setBookings(bookings.map(b =>
      b._id === id ? { ...b, status: "cancelled" } : b
    ));
  };

  const today = new Date();

  const current = bookings.filter(
    b => new Date(b.checkOutDate) >= today && b.status === "confirmed"
  );

  const past = bookings.filter(
    b => new Date(b.checkOutDate) < today || b.status === "cancelled"
  );

  // ✅ Conditional rendering AFTER hooks
  if (!userId) {
    return <p>Please log in to view your bookings.</p>;
  }

  return (
    <div>
      <h2>My Bookings</h2>

      <h3>🟢 Current Bookings</h3>
      {current.length === 0 && <p>No active bookings.</p>}
      {current.map(b => (
        <div key={b._id}>
          <p>{b.hotelName}</p>
          <p>{b.checkInDate} → {b.checkOutDate}</p>
          <button onClick={() => cancelBooking(b._id)}>Cancel</button>
        </div>
      ))}

      <h3>⚫ Past / Cancelled</h3>
      {past.map(b => (
        <div key={b._id}>
          <p>{b.hotelName}</p>
          <p>Status: {b.status}</p>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;
