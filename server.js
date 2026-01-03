// Import required packages (ESM syntax)
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import destinationRoutes from "./routes/destinationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // ✅ Auth route
import reactionRoutes from "./routes/reactionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import guideRoutes from "./routes/guideRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import guidebookingRoutes from "./routes/guidebookingRoutes.js"; 

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/destinations", destinationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/user", userRoutes); // ✅ Login endpoint
app.use("/api/reactions", reactionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/guidebookings", guidebookingRoutes);

// Simple test route
app.get("/", (req, res) => {
  res.send("Hello from Express backend!");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected (if URI provided)"))
  .catch((err) =>
    console.log("❌ MongoDB connection failed:", err.message)
  );

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
