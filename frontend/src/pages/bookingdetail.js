import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BookingDetails = () => {
  const { id } = useParams(); // hotelId
  const navigate = useNavigate();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const handleConfirm = async () => {
    const booking = {
      hotelId: id,
      userId: localStorage.getItem("userId"),
      checkIn,
      checkOut,
      guests,
      status: "Pending"
    };

    const res = await axios.post(
      "http://localhost:5000/api/bookings",
      booking
    );

    navigate(`/payment/${res.data._id}`);
  };

  return (
    <div>
      <h2>Booking Details</h2>

      <label>Check-in</label>
      <input type="date" onChange={(e) => setCheckIn(e.target.value)} />

      <label>Check-out</label>
      <input type="date" onChange={(e) => setCheckOut(e.target.value)} />

      <label>Guests</label>
      <input
        type="number"
        min="1"
        value={guests}
        onChange={(e) => setGuests(e.target.value)}
      />

      <button onClick={handleConfirm}>
        Confirm Booking
      </button>
    </div>
  );
};

export default BookingDetails;
