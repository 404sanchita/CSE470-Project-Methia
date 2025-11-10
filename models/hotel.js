import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
  location: String,
  pricePerNight: Number,
  rating: Number,
  amenities: [String],
  available: { type: Boolean, default: true },
});

export default mongoose.model("Hotel", hotelSchema);

