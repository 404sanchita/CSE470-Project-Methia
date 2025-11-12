import mongoose from "mongoose";

const guideBookingSchema = new mongoose.Schema({
  guideId: { type: mongoose.Schema.Types.ObjectId, ref: "Guide" },
  destination: String,
  userName: String,
  date: String,
  hours: Number,
  totalCost: String,
});

export default mongoose.model("guideBooking", guideBookingSchema);
