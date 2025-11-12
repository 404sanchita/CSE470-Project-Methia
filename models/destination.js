import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: String,
  country: String,
  description: String,
  image: [String],
  topAttractions: [String],
  restaurants: [String],
  transportOptions: [String],
  estimatedBudget: String,
  bestSeason: String,
  language: String,
  currency: String,
  etiquetteTips: [String],
  packingChecklist: [String],

  // ✅ New fields:
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
});

const Destination = mongoose.model("Destination", destinationSchema);
export default Destination;
