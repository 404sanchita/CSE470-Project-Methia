import React, { useEffect, useState } from "react";
import axios from "axios";
import BookingForm from "./bookingform"; 

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: "", date: "", service: "", status: "" });

  // fetch
  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // new
  const handleBookingAdded = (newBooking) => {
    setBookings((prev) => [...prev, newBooking]);
  };

  // delete
  const deleteBooking = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`);
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  // edit
  const startEdit = (booking) => {
    setEditing(booking._id);
    setFormData(booking);
  };

  const saveEdit = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/bookings/${editing}`, formData);
      setBookings((prev) =>
        prev.map((b) => (b._id === editing ? res.data : b))
      );
      setEditing(null);
    } catch (err) {
      console.error("Error updating booking:", err);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Booking Dashboard</h2>
      <p>Total Bookings: {bookings.length}</p>

      <BookingForm onBookingAdded={handleBookingAdded} />

      <table
        border="1"
        cellPadding="10"
        style={{ margin: "20px auto", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Service</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>
                {editing === b._id ? (
                  <input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                ) : (
                  b.name
                )}
              </td>
              <td>
                {editing === b._id ? (
                  <input
                    type="date"
                    value={formData.date.split("T")[0]}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                ) : (
                  new Date(b.date).toLocaleDateString()
                )}
              </td>
              <td>
                {editing === b._id ? (
                  <input
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                  />
                ) : (
                  b.service
                )}
              </td>
              <td>
                {editing === b._id ? (
                  <input
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  />
                ) : (
                  b.status
                )}
              </td>
              <td>
                {editing === b._id ? (
                  <>
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={() => setEditing(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(b)}>Edit</button>
                    <button onClick={() => deleteBooking(b._id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;
