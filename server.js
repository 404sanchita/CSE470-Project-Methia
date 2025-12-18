

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "vite";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import guideRoutes from "./routes/guideRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

dotenv.config();
connectDB(); // Connect to DB (non-blocking)

// Serve React frontend using Vite
async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // API routes - must be before Vite middleware
  app.use("/api/users", userRoutes);
  app.use("/api/destinations", destinationRoutes);
  app.use("/api/restaurants", restaurantRoutes);
  app.use("/api/hotels", hotelRoutes);
  app.use("/api/guides", guideRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/quiz", quizRoutes);

  // Error handler
  app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({ message: "Internal Server Error" });
  });

  // Create Vite server
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: process.cwd(),
  });
  
  // Use vite's middleware to serve React app (must be last)
  // This handles all requests including index.html transformation
  app.use(vite.middlewares);

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () =>
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`)
  );
}

startServer();
