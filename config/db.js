// config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' MongoDB Connected');
  } catch (error) {
    console.error(' MongoDB Connection Failed:', error.message);
    console.error(' Server will continue running but database features may not work');
    // Don't exit - let server run even if DB connection fails
  }
};

export default connectDB;
