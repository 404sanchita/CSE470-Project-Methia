import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingroutes from './routes/bookingroutes.js';
import paymentroutes from './routes/paymentroutes.js';
import hotelroutes from './routes/hotelroutes.js';
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/bookings', bookingroutes);
app.use("/api/payment", paymentroutes);
app.use("/api/hotels", hotelroutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));