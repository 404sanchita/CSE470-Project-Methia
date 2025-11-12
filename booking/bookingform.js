import React, { useState } from "react";
import axios from "axios";

const BookingForm = ({ onBookingAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    service: "",
    status: "Pending",
  });

  // input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // new
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/bookings", formData);
      onBookingAdded(res.data); // update parent dashboard
      setFormData({ name: "", date: "", service: "", status: "Pending" });
    } catch (err) {
      console.error("Error creating booking:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <h3>Create New Booking</h3>

      <input
        type="text"
        name="name"
        placeholder="Customer Name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="service"
        placeholder="Service (e.g., Hotel Room)"
        value={formData.service}
        onChange={handleChange}
        required
      />

      <select name="status" value={formData.status} onChange={handleChange}>
        <option>Pending</option>
        <option>Confirmed</option>
        <option>Cancelled</option>
      </select>

      <button type="submit">Add Booking</button>
    </form>
  );
};

export default BookingForm;

