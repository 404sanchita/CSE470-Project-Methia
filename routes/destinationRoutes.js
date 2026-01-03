

import express from "express";
import Destination from "../models/destination.js";
import Reaction from "../models/reaction.js";

const router = express.Router();

// GET all destinations
router.get("/", async (req, res) => {
  try {
    const destinations = await Destination.find({}, "name country");
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch destinations" });
  }
});


// GET single destination by ID
router.get("/:id", async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    
    // Get reaction counts
    const likesCount = await Reaction.countDocuments({ 
      resourceType: "destination", 
      resourceId: destination._id, 
      type: "like" 
    });
    const dislikesCount = await Reaction.countDocuments({ 
      resourceType: "destination", 
      resourceId: destination._id, 
      type: "dislike" 
    });
    
    const destinationObj = destination.toObject();
    destinationObj.likesCount = likesCount;
    destinationObj.dislikesCount = dislikesCount;
    destinationObj.userReaction = null; // Will be set by LikeDislike component based on current user
    
    res.json(destinationObj);
  } catch (err) {
    console.error("Error fetching destination:", err);
    res.status(500).json({ message: "Failed to fetch destination" });
  }
});



// GET comments for a destination
router.get("/:id/comments", async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id, "comments");
    if (!destination)
      return res.status(404).json({ message: "Destination not found" });

    res.json(destination.comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
});

// POST a new comment
router.post("/:id/comments", async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Comment text is required" });
  }

  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination)
      return res.status(404).json({ message: "Destination not found" });

    const newComment = {
      text: text.trim(),
      createdAt: new Date(),
    };

    destination.comments.push(newComment);
    await destination.save();

    res.status(201).json(
      destination.comments[destination.comments.length - 1]
    );
  } catch (err) {
    res.status(500).json({ message: "Failed to save comment" });
  }
});

export default router;
