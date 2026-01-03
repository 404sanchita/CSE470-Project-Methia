import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { toggleReaction } from "../controllers/reactionController.js";

const router = Router();

/**
 * Protected route for toggling like/dislike
 * POST /api/reactions
 * body: { resourceType, resourceId, reaction } // reaction: "like" | "dislike"
 */
router.post("/", protect, toggleReaction);

export default router;
