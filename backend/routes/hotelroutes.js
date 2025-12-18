import express from "express";
import Hotel from "../models/hotel.js";

const router = express.Router();

// Get hotels with filters
router.get("/", async (req, res) => {
  const { minPrice, maxPrice, rating, location, amenities } = req.query;

  let filter = {};

  if (minPrice && maxPrice) {
    filter.price = { $gte: minPrice, $lte: maxPrice };
  }

  if (rating) {
    filter.rating = { $gte: rating };
  }

  if (location) {
    filter.location = location;
  }

  if (amenities) {
    filter.amenities = { $all: amenities.split(",") };
  }

  const hotels = await Hotel.find(filter);
  res.json(hotels);
});

// Get all hotels
router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single hotel by ID
router.get("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
