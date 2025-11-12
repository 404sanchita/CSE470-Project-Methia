
// Import required packages (ESM syntax)
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import destinationRoutes from "./routes/destinationRoutes.js";

import profileRoutes from "./routes/profileRoutes.js";






// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/destinations", destinationRoutes);
app.use("/api/user", profileRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected (if URI provided)'))
.catch(err => console.log('❌ MongoDB connection failed:', err.message));

// Simple route
app.get('/', (req, res) => {
  res.send('Hello from Express backend!');
});

// Choose a port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
