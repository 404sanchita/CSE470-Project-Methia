import express from "express";
import Destination from "../models/destination.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const destinations = await Destination.find();
  res.json(destinations);
});

router.post("/", protect, adminOnly, async (req, res) => {
  const dest = new Destination(req.body);
  const saved = await dest.save();
  res.status(201).json(saved);
});

export default router;
