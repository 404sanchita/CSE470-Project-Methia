import express from 'express';
import HotelBooking from '../models/booking.js';

const router = express.Router();
router.post("/", async (req, res) => {
  console.log("Booking request received");
  console.log("Body:", req.body);
  try {
    const newBooking = new HotelBooking(req.body);
    await newBooking.save();
    console.log("Booking saved:", newBooking);

    res.status(201).json(newBooking);
  } catch (err) {
    console.error("Save error:", err);
    res.status(400).json({ error: err.message });
  }
});


// Get MY bookings only
router.get("/my/:userId", async (req, res) => {
  const bookings = await HotelBooking.find({ userId: req.params.userId });
  res.json(bookings);
});

router.get('/', async (req, res) => {
  try {
    const bookings = await HotelBooking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/bookings/cancel/:id
router.put("/cancel/:id", async (req, res) => {
  try {
    const booking = await HotelBooking.findById(req.params.id);

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "active")
      return res.status(400).json({ message: "Cannot cancel this booking" });

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed" });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    await HotelBooking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
