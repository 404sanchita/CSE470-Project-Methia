import mongoose from 'mongoose';

const HotelBookingSchema = new mongoose.Schema({
  userId: String,
  hotelId: mongoose.Schema.Types.ObjectId,
  hotelName: String,

  checkInDate: Date,
  checkOutDate: Date,

  totalAmount: Number,
  paymentStatus: {
    type: String,
    default: "paid"
  },

  status: {
    type: String,
    enum: ["active", "cancelled", "completed"],
    default: "active"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model("HotelBooking", HotelBookingSchema, "hotelbookings");
