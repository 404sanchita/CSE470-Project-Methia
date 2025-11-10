import express from "express";
import Quiz from "../models/quiz.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const quiz = new Quiz({ user: req.user._id, ...req.body });
  const saved = await quiz.save();
  res.status(201).json(saved);
});


router.get("/my", protect, async (req, res) => {
  const results = await Quiz.find({ user: req.user._id })
    .populate("result.recommendedDestination", "name country");
  res.json(results);
});

export default router;
