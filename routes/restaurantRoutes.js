import express from "express";
import Restaurant from "../models/restaurant.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:destinationId", async (req, res) => {
  const restaurants = await Restaurant.find({ destination: req.params.destinationId });
  res.json(restaurants);
});

router.post("/", protect, adminOnly, async (req, res) => {
  const restaurant = new Restaurant(req.body);
  const saved = await restaurant.save();
  res.status(201).json(saved);
});

export default router;
