import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: "Guide", required: true },
  destination: { type: String, required: true },
  userName: { type: String, required: true },
  date: { type: Date, required: true },
  hours: Number,
  totalCost: { type: String },
  paymentStatus: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled", "paid"] },
  payment: {
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    method: { type: String, enum: ["Credit Card", "Debit Card"] },
    cardType: String,
    last4Digits: String,
    transactionId: String,
    transactionDate: Date,
    amount: Number
  }
}, { timestamps: true });

export default mongoose.model("GuideBooking", bookingSchema, "guidebookings");
