import Reaction from "../models/reaction.js";

/**
 * Toggle like/dislike
 * POST /api/reactions
 * body: { resourceType, resourceId, reaction } // reaction: "like" | "dislike"
 */
export const toggleReaction = async (req, res) => {
  const { resourceType, resourceId, reaction, type } = req.body;
  // Support both "reaction" and "type" field names for compatibility
  const reactionType = reaction || type;
  const userId = req.user._id;

  if (!["like", "dislike"].includes(reactionType))
    return res.status(400).json({ message: "Invalid reaction type" });

  try {
    // Find existing reaction
    let existing = await Reaction.findOne({ user: userId, resourceType, resourceId });

    if (existing) {
      if (existing.type === reactionType) {
        // Same reaction → remove it
        await Reaction.deleteOne({ _id: existing._id });
      } else {
        // Switch reaction
        existing.type = reactionType;
        await existing.save();
      }
    } else {
      // Create new reaction
      await Reaction.create({ user: userId, resourceType, resourceId, type: reactionType });
    }

    // Count likes/dislikes
    const likesCount = await Reaction.countDocuments({ resourceType, resourceId, type: "like" });
    const dislikesCount = await Reaction.countDocuments({ resourceType, resourceId, type: "dislike" });

    const userReaction = await Reaction.findOne({ user: userId, resourceType, resourceId });

    res.json({
      likes: likesCount,
      dislikes: dislikesCount,
      userReaction: userReaction ? userReaction.type : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle reaction" });
  }
};
