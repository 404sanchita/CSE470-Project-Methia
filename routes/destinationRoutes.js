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

// ✅ Get single destination
router.get("/:id", async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: "Not found" });
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

// ✅ Like a destination
router.put("/:id/like", async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: "Not found" });

    destination.likes = (destination.likes || 0) + 1;
    await destination.save();

    res.json({ likes: destination.likes, dislikes: destination.dislikes });
  } catch (err) {
    res.status(500).json({ message: "Failed to like destination" });
  }
});

// ✅ Dislike a destination
router.put("/:id/dislike", async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) return res.status(404).json({ message: "Not found" });

    destination.dislikes = (destination.dislikes || 0) + 1;
    await destination.save();

    res.json({ likes: destination.likes, dislikes: destination.dislikes });
  } catch (err) {
    res.status(500).json({ message: "Failed to dislike destination" });
  }
});

export default router;


