import mongoose from "mongoose";

const hotelBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
  hotelName: { type: String, required: true },
  hotelLocation: String,
  hotelPrice: Number,
  hotelRating: Number,
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guests: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  bookingStatus: { type: String, default: "Pending" },
  payment: {
    status: { type: String, default: "Pending" },
    method: { type: String, enum: ["Credit Card", "Debit Card"], default: "Credit Card" },
    cardType: String,
    last4Digits: String,
    transactionId: String,
    transactionDate: Date,
    amount: Number
  },
}, { timestamps: true });

const HotelBooking = mongoose.model("HotelBooking", hotelBookingSchema, "hotelbookings");
export default HotelBooking;
