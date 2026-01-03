import Comment from "../models/comment.js";
import Destination from "../models/destination.js";
import Restaurant from "../models/restaurant.js";
import Hotel from "../models/hotel.js";
import Guide from "../models/guide.js";

/**
 * Helper to get the model by resource type
 */
const getModel = (type) => {
  switch (type) {
    case "destination":
      return Destination;
    case "restaurant":
      return Restaurant;
    case "hotel":
      return Hotel;
    case "guide":
      return Guide;
    default:
      return null;
  }
};

// GET comments
export const getComments = async (req, res) => {
  const { resourceType, resourceId } = req.params;
  const Model = getModel(resourceType);

  if (!Model) return res.status(400).json({ message: "Invalid resource type" });

  try {
    // Verify resource exists
    const resource = await Model.findById(resourceId);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    // Get comments from Comment collection
    const comments = await Comment.find({ resourceType, resourceId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

// POST comment
export const addComment = async (req, res) => {
  const { resourceType, resourceId } = req.params;
  const { text } = req.body;
  const userId = req.user._id; // from auth middleware

  if (!text || text.trim() === "")
    return res.status(400).json({ message: "Comment text is required" });

  const Model = getModel(resourceType);
  if (!Model) return res.status(400).json({ message: "Invalid resource type" });

  try {
    // Verify resource exists
    const resource = await Model.findById(resourceId);
    if (!resource) return res.status(404).json({ message: "Resource not found" });

    // Create comment in Comment collection
    const newComment = await Comment.create({
      resourceType,
      resourceId,
      user: userId,
      text: text.trim(),
    });

    // Populate user info
    await newComment.populate("user", "name");

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Comment save error:", err);
    res.status(500).json({ message: "Failed to save comment", error: err.message });
  }
};
