import React, { useEffect, useState } from 'react';

function BookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const API_URL = "http://localhost:5000/api/bookings";

  // load
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setBookings(data));
  }, []);

  // edit
  const handleEdit = (booking) => {
    setEditingId(booking._id);
    setFormData(booking);
  };

  // save
  const handleSave = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setEditingId(null);
    const updated = await fetch(API_URL).then(res => res.json());
    setBookings(updated);
  };

  // delete
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setBookings(bookings.filter(b => b._id !== id));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Hotel Booking Management Dashboard</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>User</th>
            <th>Hotel</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th>Guests</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b._id}>
              {editingId === b._id ? (
                <>
                  <td><input value={formData.userName} onChange={e => setFormData({ ...formData, userName: e.target.value })} /></td>
                  <td><input value={formData.hotelName} onChange={e => setFormData({ ...formData, hotelName: e.target.value })} /></td>
                  <td><input type="date" value={formData.checkIn?.slice(0,10)} onChange={e => setFormData({ ...formData, checkIn: e.target.value })} /></td>
                  <td><input type="date" value={formData.checkOut?.slice(0,10)} onChange={e => setFormData({ ...formData, checkOut: e.target.value })} /></td>
                  <td><input value={formData.guests} onChange={e => setFormData({ ...formData, guests: e.target.value })} /></td>
                  <td><input value={formData.totalPrice} onChange={e => setFormData({ ...formData, totalPrice: e.target.value })} /></td>
                  <td><input value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} /></td>
                  <td>
                    <button onClick={() => handleSave(b._id)}>Save</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{b.userName}</td>
                  <td>{b.hotelName}</td>
                  <td>{b.checkIn?.slice(0,10)}</td>
                  <td>{b.checkOut?.slice(0,10)}</td>
                  <td>{b.guests}</td>
                  <td>${b.totalPrice}</td>
                  <td>{b.status}</td>
                  <td>
                    <button onClick={() => handleEdit(b)}>Edit</button>
                    <button onClick={() => handleDelete(b._id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BookingDashboard;
