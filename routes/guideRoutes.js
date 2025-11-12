import express from "express";
import Guide from "../models/guide.js";
import Booking from "../models/guideBooking.js";

const router = express.Router();

// Get guides by destination
router.get("/:destination", async (req, res) => {
  try {
    const destination = req.params.destination.toLowerCase();
    const guides = await Guide.find({
      location: { $regex: destination, $options: "i" },
    });
    res.json(guides);
  } catch (err) {
    res.status(500).json({ message: "Error fetching guides" });
  }
});

// Book a guide
router.post("/book", async (req, res) => {
  try {
    const { guideId, destination, userName, date, hours } = req.body;
    const guide = await Guide.findById(guideId);

    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    // Check guide availability
    if (guide.unavailableDates.includes(date)) {
      return res.status(400).json({ message: "Guide not available on this date" });
    }

    // Extract numeric rate (removes currency symbols)
    const numericRate = parseInt(guide.hourlyRate.replace(/[^\d]/g, ""));
    const totalCost = isNaN(numericRate)
      ? "N/A"
      : `${numericRate * hours} ${guide.hourlyRate.replace(/\d+/g, "").trim()}`;

    const booking = new Booking({
      guideId,
      destination,
      userName,
      date,
      hours,
      totalCost,
    });

    await booking.save();

    // Update guide availability
    guide.unavailableDates.push(date);
    await guide.save();

    // ✅ Return booking + guide details
    res.json({
      message: "Booking successful!",
      booking: {
        _id: booking._id,
        destination,
        userName,
        date,
        hours,
        totalCost,
        guide: {
          name: guide.name,
          hourlyRate: guide.hourlyRate,
          experience: guide.experience,
          language: guide.language,
          specialties: guide.specialties,
        },
      },
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Error booking guide" });
  }
});
// ✅ Update booking
router.put("/book/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, hours } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const guide = await Guide.findById(booking.guideId);
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }

    // If date changed, check if guide is available
    if (date && date !== booking.date && guide.unavailableDates.includes(date)) {
      return res.status(400).json({ message: "Guide not available on this date" });
    }

    // If date changed, remove old unavailable date and add new one
    if (date && date !== booking.date) {
      guide.unavailableDates = guide.unavailableDates.filter(d => d !== booking.date);
      guide.unavailableDates.push(date);
      await guide.save();
      booking.date = date;
    }

    // Recalculate total cost if hours changed
    if (hours) {
      const numericRate = parseInt(guide.hourlyRate.replace(/[^\d]/g, ""));
      booking.hours = hours;
      booking.totalCost = `${numericRate * hours} ${guide.hourlyRate.replace(/\d+/g, "").trim()}`;
    }

    await booking.save();

    res.json({ message: "Booking updated successfully!", booking });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating booking" });
  }
});

// ✅ Delete booking
router.delete("/book/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const guide = await Guide.findById(booking.guideId);
    if (guide) {
      // Make the guide available again
      guide.unavailableDates = guide.unavailableDates.filter(d => d !== booking.date);
      await guide.save();
    }

    await Booking.findByIdAndDelete(id);

    res.json({ message: "Booking deleted successfully!" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Error deleting booking" });
  }
});

export default router;
