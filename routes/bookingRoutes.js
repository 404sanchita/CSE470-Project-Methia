import express from "express";
import Booking from "../models/booking.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/my", protect, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("hotel guide destination");
  res.json(bookings);
});

router.post("/", protect, async (req, res) => {
  const booking = new Booking({ ...req.body, user: req.user._id });
  const saved = await booking.save();
  res.status(201).json(saved);
});


router.put("/:id/cancel", protect, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not your booking" });

  booking.paymentStatus = "cancelled";
  await booking.save();
  res.json(booking);
});

export default router;
