import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
  checkInDate: Date,
  checkOutDate: Date,
  guests: Number,
  totalPrice: Number,
  paymentStatus: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Booking ||
  mongoose.model("Booking", bookingSchema);
