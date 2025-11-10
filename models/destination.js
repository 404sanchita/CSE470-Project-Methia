import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: String,
  image: String,
  topAttractions: [String],
  restaurants: [String],
  transportOptions: [String],
  estimatedBudget: Number,
  bestSeason: String,
  language: String,
  currency: String,
  etiquetteTips: [String],
  packingChecklist: [String],
});

export default mongoose.model("Destination", destinationSchema);
