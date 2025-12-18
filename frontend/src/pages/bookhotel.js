import React, { useState } from "react";
import axios from "axios";

const BookHotel = () => {
  const [formData, setFormData] = useState({
    hotelName: "",
    date: "",
    service: "Room",
    status: "Pending",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // include a userId to ensure privacy
      const payload = { ...formData, userId: localStorage.getItem("userId") };
      const res = await axios.post("http://localhost:5000/api/bookings", payload);
      alert("Booking created successfully!");
      setFormData({ hotelName: "", date: "", service: "Room", status: "Pending" });
    } catch (err) {
      console.error(err);
      alert("Failed to create booking.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Book a Hotel</h2>
      <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
        <div>
          <label>Hotel Name:</label><br />
          <input
            type="text"
            name="hotelName"
            value={formData.hotelName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Date:</label><br />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Service:</label><br />
          <input
            type="text"
            name="service"
            value={formData.service}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Status:</label><br />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Cancelled</option>
          </select>
        </div>
        <div style={{ marginTop: "10px" }}>
          <button type="submit">Book Hotel</button>
        </div>
      </form>
    </div>
  );
};

export default BookHotel;
