import mongoose from "mongoose";

const restaurantBookingSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  restaurantName: String,
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: String,
  date: { type: String, required: true },
  time: { type: String, required: true },
  numberOfGuests: { type: Number, required: true },
  specialRequests: String,
  bookingStatus: { type: String, default: "pending", enum: ["pending", "confirmed", "cancelled"] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("RestaurantBooking", restaurantBookingSchema);
