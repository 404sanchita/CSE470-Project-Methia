

import express from "express";
import Destination from "../models/destination.js";

const router = express.Router();

// ✅ Get all destinations
router.get("/", async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch destinations" });
  }
});

// ✅ Get a single destination by ID (for detail page)
router.get("/:id", async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.json(destination);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch destination" });
  }
});

// ✅ Add new destination
router.post("/", async (req, res) => {
  try {
    const dest = new Destination(req.body);
    const saved = await dest.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Error saving destination" });
  }
});

export default router;
