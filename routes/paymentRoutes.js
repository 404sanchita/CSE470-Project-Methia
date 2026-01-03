import express from "express";
import HotelBooking from "../models/booking.js";

const router = express.Router();

// Helper function: Luhn algorithm for card validation
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

// Helper function: Get card type
const getCardType = (number) => {
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(number)) return "Visa";
  if (/^5[1-5][0-9]{14}$/.test(number)) return "Mastercard";
  if (/^3[47][0-9]{13}$/.test(number)) return "American Express";
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(number)) return "Discover";
  return "Unknown";
};

// Helper function: Generate transaction ID
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Process payment
router.post("/process", async (req, res) => {
  try {
    const { bookingId, cardNumber, cardholderName, expiryDate, cvv, amount, cardType } = req.body;

    // Validate required fields
    if (!bookingId || !cardNumber || !cardholderName || !expiryDate || !cvv || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information"
      });
    }

    // Detect card type first
    const detectedCardType = getCardType(cardNumber);
    if (detectedCardType === "Unknown") {
      return res.status(400).json({
        success: false,
        message: "Card type not supported. Please use Visa, Mastercard, American Express, or Discover."
      });
    }

    // Validate card format - check length based on card type
    const validLengths = {
      "Visa": [13, 16],
      "Mastercard": [16],
      "Discover": [16],
      "American Express": [15]
    };
    
    if (!validLengths[detectedCardType].includes(cardNumber.length) || !/^\d+$/.test(cardNumber)) {
      return res.status(400).json({
        success: false,
        message: `Invalid card number format for ${detectedCardType}`
      });
    }

    // Validate card number with Luhn algorithm
    if (!luhnCheck(cardNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid card number"
      });
    }

    // Validate expiry date
    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry date format"
      });
    }

    const [month, year] = expiryDate.split("/");
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10) + 2000;
    const now = new Date();

    if (expMonth < 1 || expMonth > 12) {
      return res.status(400).json({
        success: false,
        message: "Invalid expiry month"
      });
    }

    if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
      return res.status(400).json({
        success: false,
        message: "Card has expired"
      });
    }

    // Validate CVV based on card type (Amex uses 4 digits, others use 3)
    const expectedCvvLength = detectedCardType === "American Express" ? 4 : 3;
    if (cvv.length !== expectedCvvLength || !/^\d+$/.test(cvv)) {
      return res.status(400).json({
        success: false,
        message: `Invalid CVV format. ${detectedCardType} requires ${expectedCvvLength} digits.`
      });
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount"
      });
    }

    // Verify booking exists
    const booking = await HotelBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Check if already paid
    if (booking.payment && booking.payment.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Booking already paid"
      });
    }

    // Simulate payment processing (In production, integrate with Stripe, Square, etc.)
    // Card type already detected and validated above

    // Simulate processing delay (0-500ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500));

    // Simulate occasional failures (5% chance for demo)
    if (Math.random() < 0.05) {
      return res.status(400).json({
        success: false,
        message: "Payment declined by card issuer. Please verify your card details and try again."
      });
    }

    // Payment successful
    const transactionId = generateTransactionId();

    res.json({
      success: true,
      message: "Payment successful",
      transactionId,
      cardType: detectedCardType,
      amount,
      cardLast4: cardNumber.slice(-4),
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("Payment processing error:", err);
    res.status(500).json({
      success: false,
      message: "Payment processing failed. Please try again later."
    });
  }
});

// Get payment status
router.get("/:bookingId", async (req, res) => {
  try {
    const booking = await HotelBooking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      bookingId: booking._id,
      paymentStatus: booking.payment.status,
      transactionId: booking.payment.transactionId,
      amount: booking.payment.amount,
      cardType: booking.payment.cardType,
      last4Digits: booking.payment.last4Digits,
      transactionDate: booking.payment.transactionDate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
