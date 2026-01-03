import express from "express";
import ChatMessage from "../models/chatMessage.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// User sends a message
router.post("/", async (req, res) => {
  try {
    const { userEmail, userName, message } = req.body;

    if (!userEmail || !userName || !message) {
      return res.status(400).json({ 
        message: "Please provide userEmail, userName, and message" 
      });
    }

    const chatMessage = new ChatMessage({
      userEmail,
      userName,
      message,
      status: "pending"
    });

    const savedMessage = await chatMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error: error.message });
  }
});

// Get messages - users see their own, admins see all
router.get("/", protect, async (req, res) => {
  try {
    let query = {};
    
    // If user is not admin, only show their messages
    if (req.user.role !== "admin") {
      query.userEmail = req.user.email;
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});

// Get messages by email (for users not logged in)
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const messages = await ChatMessage.find({ userEmail: email })
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});

// Admin replies to a message
router.put("/:messageId/reply", protect, adminOnly, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reply } = req.body;

    if (!reply || reply.trim() === "") {
      return res.status(400).json({ message: "Reply message is required" });
    }

    const message = await ChatMessage.findByIdAndUpdate(
      messageId,
      {
        reply: reply.trim(),
        status: "answered",
        repliedAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Error replying to message", error: error.message });
  }
});

// Get all pending messages (admin only)
router.get("/pending", protect, adminOnly, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ status: "pending" })
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending messages", error: error.message });
  }
});

export default router;
