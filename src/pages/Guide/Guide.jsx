import React, { useState, useMemo, useContext, useEffect } from "react";
import axios from "axios";
import api from "../../App/api";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import LikeDislike from "../../components/LikeDislike";
import CommentSection from "../../components/CommentSection";
import "./Guide.css";

export default function GuideBooking({ destinationsList }) {
  const { user } = useContext(AuthContext);
  const destinations = destinationsList || ["Paris", "Kyoto", "Bali", "New York", "Rome", "London", "Dubai"];

  const [selectedDestination, setSelectedDestination] = useState("");
  const [guides, setGuides] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [bookingInfo, setBookingInfo] = useState(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [userName, setUserName] = useState(user?.name || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize userName from user if logged in
  useEffect(() => {
    if (user && user.name) {
      setUserName(user.name);
    }
  }, [user]);

  // Fetch guides by location
  const fetchGuides = async (destination) => {
    setSelectedGuide(null);
    setBookingInfo(null);
    setGuides([]);
    if (!destination) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/guides/by-location/${destination}`);
      setGuides(res.data || []);
      setMessage(res.data.length === 0 ? "No guides found" : "");
    } catch (err) {
      console.error(err);
      setMessage("Could not fetch guides. Check the backend server.");
    }
  };

  const filteredGuides = useMemo(() => {
    if (!guides) return [];
    return filterName
      ? guides.filter((g) => g.name.toLowerCase().includes(filterName.toLowerCase()))
      : guides;
  }, [guides, filterName]);

  // Helper function to extract currency symbol and numeric value from hourlyRate
  const parseHourlyRate = (hourlyRateString) => {
    if (!hourlyRateString) return { currency: "$", amount: 0 };
    
    // Match currency symbols at the start (€, $, £, ¥) or currency codes (AED, USD, etc.)
    const currencyMatch = hourlyRateString.match(/^([€$£¥]|[A-Z]{2,4})\s*/);
    const currency = currencyMatch ? currencyMatch[1] : "$";
    
    // Extract numeric value (remove all non-numeric characters except decimal point)
    const amount = parseFloat(hourlyRateString.replace(/[^0-9.]/g, '')) || 0;
    
    return { currency, amount };
  };

  const handleBook = async () => {
    const finalUserName = userName || (user ? user.name : "");
    
    if (!selectedGuide || !date || !startTime || !endTime || !finalUserName) {
      setMessage("Please fill in all fields");
      return;
    }

    if (!user) {
      setMessage("Please login to make a booking");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Calculate hours
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      const hours = Math.abs(end - start) / (1000 * 60 * 60);
      
      // Calculate total cost with proper currency
      let totalCost = null;
      if (selectedGuide.hourlyRate) {
        const { currency, amount } = parseHourlyRate(selectedGuide.hourlyRate);
        const calculatedAmount = hours * amount;
        totalCost = `${currency}${calculatedAmount.toFixed(2)}`;
      }

      const bookingData = {
        guideId: selectedGuide._id,
        destination: selectedDestination,
        userName: finalUserName,
        date,
        hours: hours.toFixed(1),
        totalCost
      };

      const response = await api.post("/guidebookings", bookingData);

      setBookingInfo({
        guideId: selectedGuide._id,
        guideName: selectedGuide.name,
        destination: selectedDestination,
        userName: finalUserName,
        date,
        startTime,
        endTime,
      });
      setMessage("Booking successful! Check 'My Bookings' to see your booking.");
      
      // Reset form after successful booking
      setTimeout(() => {
        setDate("");
        setStartTime("");
        setEndTime("");
        setUserName("");
        setSelectedGuide(null);
        setBookingInfo(null);
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error creating booking:", error);
      setMessage(error.response?.data?.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="guide-page">
        <h1>Select a Guide</h1>

        <select
          value={selectedDestination}
          onChange={(e) => {
            setSelectedDestination(e.target.value);
            fetchGuides(e.target.value);
          }}
        >
          <option value="">-- Choose Destination --</option>
          {destinations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {guides.length > 0 && (
          <>
            <input
              type="text"
              placeholder="Filter by name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            <ul>
              {filteredGuides.map((g) => (
                <li key={g._id} onClick={() => setSelectedGuide(g)}>
                  {g.name} - {g.hourlyRate}/hr
                </li>
              ))}
            </ul>
          </>
        )}

        {selectedGuide && (
          <div className="booking-form">
            <h2>Book {selectedGuide.name}</h2>
            
            {/* Like/Dislike Section */}
            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <LikeDislike
                resourceType="guide"
                resourceId={selectedGuide._id}
                initialLikes={selectedGuide.likesCount || 0}
                initialDislikes={selectedGuide.dislikesCount || 0}
                initialReaction={selectedGuide.userReaction || null}
              />
            </div>

            {/* Comments Section */}
            <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
              <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>Comments</h3>
              <CommentSection resourceType="guide" resourceId={selectedGuide._id} />
            </div>
            
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={!!user}
            />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            
            {/* Calculate and display cost */}
            {startTime && endTime && selectedGuide.hourlyRate && (() => {
              const start = new Date(`2000-01-01T${startTime}`);
              const end = new Date(`2000-01-01T${endTime}`);
              const hours = Math.abs(end - start) / (1000 * 60 * 60);
              const { currency, amount } = parseHourlyRate(selectedGuide.hourlyRate);
              const calculatedCost = hours * amount;
              
              return (
                <div style={{
                  margin: "1rem 0",
                  padding: "1rem",
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: "8px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span><strong>Duration:</strong> {hours.toFixed(1)} hours</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span><strong>Rate:</strong> {currency}{amount.toFixed(2)}/hour</span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    paddingTop: "0.5rem",
                    borderTop: "2px solid #0284c7",
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    color: "#0284c7"
                  }}>
                    <span>Total Cost:</span>
                    <span>{currency}{calculatedCost.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
            
            <button onClick={handleBook} disabled={loading}>
              {loading ? "Booking..." : "Book Now"}
            </button>
          </div>
        )}

        {bookingInfo && (
          <div className="booking-summary">
            <h3>Booking Confirmed!</h3>
            <p>Guide: {selectedGuide?.name}</p>
            <p>Date: {date}</p>
            <p>Time: {startTime} - {endTime}</p>
            <p>Traveler: {userName}</p>
          </div>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </>
  );
}
