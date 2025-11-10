import express from "express";
import Guide from "../models/guide.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", async (req, res) => {
  const guides = await Guide.find().populate("destination", "name");
  res.json(guides);
});


router.get("/:destinationId", async (req, res) => {
  const guides = await Guide.find({ destination: req.params.destinationId });
  res.json(guides);
});


router.post("/", protect, adminOnly, async (req, res) => {
  const guide = new Guide(req.body);
  const saved = await guide.save();
  res.status(201).json(saved);
});

export default router;
