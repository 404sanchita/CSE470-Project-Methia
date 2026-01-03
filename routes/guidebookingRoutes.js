import express from "express";
import Booking from "../models/guidebooking.js";
import Guide from "../models/guide.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper functions for payment processing
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

const getCardType = (number) => {
  if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(number)) return "Visa";
  if (/^5[1-5][0-9]{14}$/.test(number)) return "Mastercard";
  if (/^3[47][0-9]{13}$/.test(number)) return "American Express";
  if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(number)) return "Discover";
  return "Unknown";
};

const generateTransactionId = () => {
  return `TXN-GUIDE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Get user's guide bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("guideId", "name hourlyRate location");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
});

// Create a new guide booking
router.post("/", protect, async (req, res) => {
  try {
    const { guideId, destination, userName, date, hours, totalCost } = req.body;
    
    if (!guideId || !destination || !userName || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = new Booking({
      user: req.user._id,
      guideId,
      destination,
      userName,
      date: new Date(date),
      hours: hours || null,
      totalCost: totalCost || null,
      paymentStatus: "pending"
    });
    
    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
});

// Update a guide booking
router.put("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    
    if (booking.user && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your booking" });
    }

    if (booking.paymentStatus === "cancelled") {
      return res.status(400).json({ message: "Cannot update a cancelled booking" });
    }

    const { date, hours } = req.body;

    // Update date if provided
    if (date) {
      booking.date = new Date(date);
    }

    // Update hours and recalculate totalCost if hours is provided
    if (hours !== undefined && hours !== null) {
      booking.hours = hours;
      
      // Recalculate totalCost based on guide's hourlyRate (preserve currency)
      if (booking.guideId) {
        const guide = await Guide.findById(booking.guideId);
        if (guide && guide.hourlyRate) {
          // Extract currency symbol from hourlyRate
          const currencyMatch = guide.hourlyRate.match(/^([€$£¥]|[A-Z]{2,4})\s*/);
          const currency = currencyMatch ? currencyMatch[1] : "$";
          const hourlyRateAmount = parseFloat(guide.hourlyRate.replace(/[^0-9.]/g, '')) || 0;
          const totalCostAmount = hourlyRateAmount * hours;
          booking.totalCost = `${currency}${totalCostAmount.toFixed(2)}`;
        }
      }
    }

    await booking.save();
    res.json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error: error.message });
  }
});

// Confirm a guide booking (update payment status to confirmed)
router.put("/:id/confirm", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    
    if (booking.user && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your booking" });
    }

    if (booking.paymentStatus === "cancelled") {
      return res.status(400).json({ message: "Cannot confirm a cancelled booking" });
    }

    booking.paymentStatus = "confirmed";
    await booking.save();
    res.json({ message: "Booking confirmed successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error confirming booking", error: error.message });
  }
});

// Process payment for guide booking
router.post("/:id/pay", protect, async (req, res) => {
  try {
    const { cardNumber, cardholderName, expiryDate, cvv } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    
    if (booking.user && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not your booking" });
    }

    if (booking.payment && booking.payment.status === "completed") {
      return res.status(400).json({ success: false, message: "Booking already paid" });
    }

    // Validate required fields
    if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment information"
      });
    }

    // Detect and validate card type
    const detectedCardType = getCardType(cardNumber);
    if (detectedCardType === "Unknown") {
      return res.status(400).json({
        success: false,
        message: "Card type not supported. Please use Visa, Mastercard, American Express, or Discover."
      });
    }

    // Validate card format
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
        message: "Invalid expiry date format (use MM/YY)"
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

    // Validate CVV
    const expectedCvvLength = detectedCardType === "American Express" ? 4 : 3;
    if (cvv.length !== expectedCvvLength || !/^\d+$/.test(cvv)) {
      return res.status(400).json({
        success: false,
        message: `Invalid CVV format. ${detectedCardType} requires ${expectedCvvLength} digits.`
      });
    }

    // Calculate amount from totalCost
    const totalCostStr = booking.totalCost || "0";
    const amount = parseFloat(totalCostStr.replace(/[^0-9.]/g, '')) || 0;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount"
      });
    }

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500));

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      return res.status(400).json({
        success: false,
        message: "Payment declined by card issuer. Please verify your card details and try again."
      });
    }

    // Payment successful - update booking
    const transactionId = generateTransactionId();
    booking.payment = {
      status: "completed",
      method: "Credit Card",
      cardType: detectedCardType,
      last4Digits: cardNumber.slice(-4),
      transactionId,
      transactionDate: new Date(),
      amount
    };
    booking.paymentStatus = "paid";
    await booking.save();

    res.json({
      success: true,
      message: "Payment successful",
      transactionId,
      booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Payment processing failed", error: error.message });
  }
});

// Cancel a guide booking
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    
    if (booking.user && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your booking" });
    }

    booking.paymentStatus = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
});

export default router;