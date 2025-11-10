import express from "express";
import Hotel from "../models/hotel.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const hotels = await Hotel.find().populate("destination", "name country");
  res.json(hotels);
});

router.get("/:destinationId", async (req, res) => {
  const hotels = await Hotel.find({ destination: req.params.destinationId });
  res.json(hotels);
});


router.post("/", protect, adminOnly, async (req, res) => {
  const hotel = new Hotel(req.body);
  const saved = await hotel.save();
  res.status(201).json(saved);
});

export default router;
