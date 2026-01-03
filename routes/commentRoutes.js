import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addComment, getComments } from "../controllers/commentController.js";

const router = Router();

/**
 * Get all comments for a resource
 * Example: GET /api/comments/destination/:resourceId
 */
router.get("/:resourceType/:resourceId", getComments);

/**
 * Add a new comment (logged-in users only)
 * Example: POST /api/comments/destination/:resourceId
 */
router.post("/:resourceType/:resourceId", protect, addComment);

export default router;
