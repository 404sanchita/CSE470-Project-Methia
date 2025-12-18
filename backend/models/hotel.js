import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: String,
  location: String,
  price: Number,
  rating: Number,
  amenities: [String]
});

export default mongoose.model("Hotel", hotelSchema);
