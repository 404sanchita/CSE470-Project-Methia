import express from "express";
import User from "../models/user.js";

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json(user);
});

export default router;
