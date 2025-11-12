import React, { useState } from "react";
import axios from "axios";

const BookingSummary = ({ booking, onEdit, onDelete }) => {
  
  const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="border p-6 rounded-lg bg-gray-50">
      <h2 className="text-2xl font-bold mb-4 text-green-700">
        Booking Confirmed!
      </h2>
      <div className="space-y-2">
        <p>
          <strong>Guide:</strong> {booking.guideName}
        </p>
        <p>
          <strong>Destination:</strong> {booking.destination}
        </p>
        <p>
          <strong>Name:</strong> {booking.userName}
        </p>
        <p>
          <strong>Date:</strong> {formattedDate}
        </p>
        <p>
          <strong>Hours:</strong> {booking.hours}
        </p>
        <p className="text-xl font-semibold">
       
          <strong>Total Cost:</strong> ${booking.totalCost}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={onEdit}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Update Booking
        </button>
        <button
          onClick={onDelete}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cancel Booking
        </button>
      </div>
    </div>
  );
};

const GuideBooking = () => {
  const [destinations] = useState([
    "Paris", "Kyoto", "Bali", "New York City", "Rome", "London", "Dubai",
  ]);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [date, setDate] = useState("");
  const [hours, setHours] = new useState(2); 
  const [userName, setUserName] = useState("");
  const [bookingInfo, setBookingInfo] = useState(null); 
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false); 


  const [editDate, setEditDate] = useState("");
  const [editHours, setEditHours] = useState(2);

  const fetchGuides = async (destination) => {
 
    setSelectedGuide(null);
    setBookingInfo(null);
    setMessage("");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/guides/${destination}`
      );
      setGuides(res.data);
    } catch (err) {
      setMessage("Could not fetch guides.");
      setGuides([]);
    }
  };

  const handleBook = async () => {
    if (!selectedGuide || !date || !userName) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/guides/book", {
        guideId: selectedGuide._id,
        destination: selectedDestination,
        userName,
        date,
        hours,
      });

    
      setBookingInfo({
        ...res.data.booking, 
        guideName: selectedGuide.name, 
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Guide unavailable or error occurred."
      );
    }
  };

  const handleUpdateClick = () => {
    
    const formattedDate = new Date(bookingInfo.date).toISOString().split("T")[0];
    setEditDate(formattedDate);
    setEditHours(bookingInfo.hours);
    setIsEditing(true); 
    setMessage(""); 
  };

 
  const handleUpdate = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/guides/book/${bookingInfo._id}`,
        {
          date: editDate,
          hours: editHours,
        }
      );

      setBookingInfo({
        ...bookingInfo, 
        ...res.data.booking, 
      });

      setIsEditing(false); 
      setMessage("Booking updated successfully!");
    } catch (err) {
      setMessage("Error updating booking.");
    }
  };


  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await axios.delete(
          `http://localhost:5000/api/guides/book/${bookingInfo._id}`
        );
        setMessage("Booking successfully cancelled.");
      
        setBookingInfo(null);
        setSelectedDestination("");
        setGuides([]);
        setSelectedGuide(null);
        setDate("");
        setHours(2);
        setUserName("");
        setIsEditing(false);
      } catch (err) {
        setMessage("Error cancelling booking.");
      }
    }
  };

  
  const resetForm = () => {
    setSelectedDestination("");
    setGuides([]);
    setSelectedGuide(null);
    setDate("");
    setHours(2);
    setUserName("");
    setMessage("");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Book a Travel Guide</h1>

      
      {!bookingInfo && (
        <>
          <label className="block mb-2">Select Destination:</label>
          <select
            className="border p-2 w-full mb-4"
            value={selectedDestination}
            onChange={(e) => {
              setSelectedDestination(e.target.value);
              if (e.target.value) {
                fetchGuides(e.target.value);
              } else {
                setGuides([]); 
              }
            }}
          >
            <option value="">-- Select Destination --</option>
            {destinations.map((d, i) => (
              <option key={i} value={d}>
                {d}
              </option>
            ))}
          </select>

          {guides.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-2">Available Guides:</h2>
              <ul className="mb-4 max-h-60 overflow-y-auto">
                {guides.map((g) => (
                  <li
                    key={g._id}
                    className={`border p-3 mb-2 rounded cursor-pointer ${
                      selectedGuide?._id === g._id ? "bg-blue-100 border-blue-400" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedGuide(g)}
                  >
                    <p className="font-bold text-lg">{g.name}</p>
                    <p>Experience: {g.experience}</p>
                    <p>Rate: ${g.hourlyRate}/hr</p>
                    <p>Languages: {g.language.join(", ")}</p>
                    <p>
                      Unavailable:{" "}
                      {g.unavailableDates.length
                        ? g.unavailableDates
                            .map((d) =>
                              new Date(d).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                timeZone: "UTC",
                              })
                            )
                            .join(", ")
                        : "None"}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {selectedGuide && (
            <>
              <label className="block mb-2">Your Name:</label>
              <input
                className="border p-2 w-full mb-3"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />

              <label className="block mb-2">Select Date:</label>
              <input
                type="date"
                className="border p-2 w-full mb-3"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <label className="block mb-2">Hours (min 2):</label>
              <input
                type="number"
                min="2"
                className="border p-2 w-full mb-3"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />

              <button
                onClick={handleBook}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Confirm Booking
              </button>
            </>
          )}
        </>
      )}

     
      {bookingInfo && !isEditing && (
        <>
          <BookingSummary
            booking={bookingInfo}
            onEdit={handleUpdateClick}
            onDelete={handleDelete}
          />
          <button
            onClick={resetForm}
            className="mt-4 text-blue-500 hover:underline"
          >
            Book Another Guide
          </button>
        </>
      )}

     
      {bookingInfo && isEditing && (
        <div className="border p-6 rounded-lg bg-gray-50">
          <h2 className="text-2xl font-bold mb-4">Update Your Booking</h2>
          <p className="mb-4">
            You are editing your booking with <strong>{bookingInfo.guideName}</strong> for{" "}
            <strong>{bookingInfo.destination}</strong>.
          </p>

          <label className="block mb-2">Update Date:</label>
          <input
            type="date"
            className="border p-2 w-full mb-3"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />

          <label className="block mb-2">Update Hours (min 2):</label>
          <input
            type="number"
            min="2"
            className="border p-2 w-full mb-3"
            value={editHours}
            onChange={(e) => setEditHours(e.target.value)}
          />

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleUpdate}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      
      {message && (
        <p
          className={`mt-4 text-center text-lg ${
            message.includes("") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default GuideBooking;
