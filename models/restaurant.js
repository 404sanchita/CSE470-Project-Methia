import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" }, 
  address: String,
  rating: Number,
  cuisine: [String],
  priceRange: String, 
  contactInfo: {
    phone: String,
    website: String,
  },
  bestDishes: [String],
  image: String,
  availableSeats: { type: Number, default: 0 },
});

export default mongoose.model("Restaurant", restaurantSchema);


