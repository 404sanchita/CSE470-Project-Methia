import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../App/api";

const GuidePayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/guidebookings/my`);
        const foundBooking = res.data.find(b => b._id === bookingId);
        if (foundBooking) {
          setBooking(foundBooking);
        } else {
          setError("Booking not found");
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Failed to load booking details");
      }
    };
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  // Luhn algorithm for card validation
  const luhnCheck = (num) => {
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  // Detect card type
  const getCardType = (number) => {
    if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(number)) return "Visa";
    if (/^5[1-5][0-9]{14}$/.test(number)) return "Mastercard";
    if (/^3[47][0-9]{13}$/.test(number)) return "American Express";
    if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(number)) return "Discover";
    return "Unknown";
  };

  const validateCard = () => {
    const cardNumber = card.replace(/\s/g, "");
    
    if (!cardNumber) {
      setError("Card number is required");
      return false;
    }

    const detectedCardType = getCardType(cardNumber);
    if (detectedCardType === "Unknown") {
      setError("Invalid card type. Please use Visa, Mastercard, American Express, or Discover.");
      return false;
    }

    // Validate length based on card type
    const validLengths = {
      "Visa": [13, 16],
      "Mastercard": [16],
      "Discover": [16],
      "American Express": [15]
    };

    if (!validLengths[detectedCardType].includes(cardNumber.length)) {
      setError(`Invalid card number length for ${detectedCardType}`);
      return false;
    }

    if (!luhnCheck(cardNumber)) {
      setError("Invalid card number");
      return false;
    }

    if (!cardName.trim()) {
      setError("Cardholder name is required");
      return false;
    }

    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setError("Please enter a valid expiry date (MM/YY)");
      return false;
    }

    const expectedCvvLength = detectedCardType === "American Express" ? 4 : 3;
    if (!cvv || cvv.length !== expectedCvvLength || !/^\d+$/.test(cvv)) {
      setError(`${detectedCardType} requires ${expectedCvvLength}-digit CVV`);
      return false;
    }

    return true;
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateCard() || !booking) return;

    setLoading(true);
    try {
      const cardNumber = card.replace(/\s/g, "");
      const res = await api.post(`/guidebookings/${bookingId}/pay`, {
        cardNumber,
        cardholderName: cardName,
        expiryDate,
        cvv
      });

      if (res.data.success) {
        alert("Payment successful! Your booking has been paid.");
        navigate("/my-bookings");
      } else {
        setError(res.data.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment processing failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  // Extract numeric value for payment processing (backend expects number)
  const totalCostAmount = booking?.totalCost ? parseFloat(booking.totalCost.replace(/[^0-9.]/g, '')) : 0;

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>💳 Payment for Guide Booking</h1>

      {booking && (
        <div style={{
          background: "#f9fafb",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{ marginTop: 0 }}>Booking Details</h3>
          <p><strong>Destination:</strong> {booking.destination}</p>
          {booking.hours && <p><strong>Hours:</strong> {booking.hours}</p>}
          <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
          <div style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "2px solid #0284c7",
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "#0284c7"
          }}>
            <span>Total Amount: </span>
            <span>{booking.totalCost || `$${totalCostAmount.toFixed(2)}`}</span>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          background: "rgba(220, 38, 38, 0.1)",
          color: "#dc2626",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          border: "1px solid rgba(220, 38, 38, 0.3)"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePay} style={{ background: "white", padding: "2rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Card Number
          </label>
          <input
            type="text"
            value={card}
            onChange={(e) => setCard(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength="19"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "1rem"
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="John Doe"
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "1rem"
            }}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Expiry Date (MM/YY)
            </label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder="12/25"
              maxLength="5"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem"
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              maxLength="4"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "1rem"
              }}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: loading ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Processing Payment..." : `Pay ${booking?.totalCost || `$${totalCostAmount.toFixed(2)}`}`}
        </button>

        <button
          type="button"
          onClick={() => navigate("/my-bookings")}
          style={{
            width: "100%",
            marginTop: "0.5rem",
            padding: "0.75rem",
            background: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default GuidePayment;

