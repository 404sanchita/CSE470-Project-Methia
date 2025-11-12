

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import destinationRoutes from "./routes/destinationRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import guideRoutes from "./routes/guideRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Methia is running successfully!");
});


app.use("/api/users", userRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/quiz", quizRoutes);


app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`)
);
