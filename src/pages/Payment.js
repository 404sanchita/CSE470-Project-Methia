import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [card, setCard] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [cardType, setCardType] = useState("");

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`);
        setBooking(res.data);
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
    if (!card || card.length < 13) {
      setError("Please enter a valid card number");
      return false;
    }

    // Detect card type
    const detectedCardType = getCardType(card);
    if (detectedCardType === "Unknown") {
      setError("Invalid card type. Please use Visa, Mastercard, American Express, or Discover.");
      return false;
    }

    // Validate card length based on card type
    const validLengths = {
      "Visa": [13, 16],
      "Mastercard": [16],
      "Discover": [16],
      "American Express": [15]
    };
    
    if (!validLengths[detectedCardType].includes(card.length)) {
      setError(`Invalid card number length for ${detectedCardType}`);
      return false;
    }

    // Validate Luhn algorithm
    if (!luhnCheck(card)) {
      setError("❌ Invalid card number. Please check and try again.");
      return false;
    }

    if (!cardName || cardName.trim().length < 3) {
      setError("Please enter a valid cardholder name");
      return false;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      setError("Please enter expiry date in MM/YY format");
      return false;
    }
    const [month, year] = expiryDate.split("/");
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10) + 2000;
    const now = new Date();
    if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
      setError("Card has expired");
      return false;
    }

    // Validate CVV based on card type (Amex uses 4 digits, others use 3)
    const expectedCvvLength = detectedCardType === "American Express" ? 4 : 3;
    if (!cvv || cvv.length !== expectedCvvLength) {
      setError(`CVV must be ${expectedCvvLength} digits for ${detectedCardType}`);
      return false;
    }
    return true;
  };

  const handlePay = async () => {
    setError("");
    if (!validateCard() || !booking) return;

    setLoading(true);
    try {
      const detectedCardType = getCardType(card);
      const amount = booking.totalPrice || (booking.hotelPrice * Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)));

      const paymentRes = await axios.post(
        "http://localhost:5000/api/payments/process",
        {
          bookingId,
          cardNumber: card,
          cardholderName: cardName,
          expiryDate,
          cvv,
          amount,
          cardType: detectedCardType
        }
      );

      if (paymentRes.data.success) {
        // Update booking status
        await axios.put(
          `http://localhost:5000/api/bookings/${bookingId}`,
          {
            bookingStatus: "Confirmed",
            "payment.status": "Completed",
            "payment.method": "Credit Card",
            "payment.cardType": detectedCardType,
            "payment.last4Digits": card.slice(-4),
            "payment.transactionId": paymentRes.data.transactionId,
            "payment.transactionDate": new Date(),
            "payment.amount": amount
          }
        );

        navigate("/confirmed");
      } else {
        setError(paymentRes.data.message || "Payment failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment processing failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Complete Your Payment</h2>

        {booking && (
          <div style={{
            background: "var(--light-bg)",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            borderLeft: "4px solid var(--primary-color)"
          }}>
            <p style={{ margin: "0 0 10px 0", fontWeight: "600", color: "var(--text-dark)" }}>
              {booking.hotelName}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "0.9rem" }}>
              <div>
                <span style={{ color: "var(--text-light)" }}>Amount:</span>
                <p style={{ margin: "5px 0 0 0", fontWeight: "700", color: "var(--success-color)", fontSize: "1.2rem" }}>
                  ${booking.totalPrice || (booking.hotelPrice * Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)))}
                </p>
              </div>
              <div>
                <span style={{ color: "var(--text-light)" }}>Booking ID:</span>
                <p style={{ margin: "5px 0 0 0", fontWeight: "600", fontSize: "0.85rem", color: "var(--text-dark)" }}>
                  {booking._id}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="payment-info" style={{ background: "rgba(37, 99, 235, 0.1)", borderLeft: "4px solid var(--primary-color)" }}>
          🔒 Your payment information is encrypted and secure. We accept Visa, Mastercard, American Express, and Discover cards.
        </div>

        {error && (
          <div style={{
            background: "rgba(220, 38, 38, 0.1)",
            color: "var(--danger-color)",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "0.9rem",
            border: "1px solid rgba(220, 38, 38, 0.3)"
          }}>
            ❌ {error}
          </div>
        )}

        <form className="payment-form" onSubmit={(e) => { e.preventDefault(); handlePay(); }}>
          <div className="form-group">
            <label htmlFor="cardName">Cardholder Name</label>
            <input
              id="cardName"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => {
                setCardName(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="card">
              Card Number {cardType && <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>({cardType})</span>}
            </label>
            <input
              id="card"
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              value={card.replace(/(.{4})/g, "$1 ").trim()}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                setCard(cleaned);
                if (cleaned.length >= 13) {
                  setCardType(getCardType(cleaned));
                } else {
                  setCardType("");
                }
                setError("");
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div className="form-group">
              <label htmlFor="expiry">Expiry Date</label>
              <input
                id="expiry"
                placeholder="MM/YY"
                maxLength="5"
                value={expiryDate}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length >= 2) {
                    val = val.slice(0, 2) + "/" + val.slice(2, 4);
                  }
                  setExpiryDate(val);
                  setError("");
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="cvv">CVV {cardType === "American Express" && <span style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>(4 digits)</span>}</label>
              <input
                id="cvv"
                placeholder={cardType === "American Express" ? "1234" : "123"}
                maxLength="4"
                type="password"
                value={cvv}
                onChange={(e) => {
                  setCvv(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
              />
            </div>
          </div>

          <div style={{
            background: "rgba(234, 88, 12, 0.1)",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "0.85rem",
            color: "var(--text-dark)",
            border: "1px solid rgba(234, 88, 12, 0.3)"
          }}>
            <strong>Test Card Numbers:</strong><br />
            Visa: 4532 1488 0343 6467<br />
            Mastercard: 5425 2334 3010 9903
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Processing Payment..." : "Complete Payment"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
            style={{ marginTop: "10px" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
