import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
});

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

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [commentSchema],
});

export default mongoose.model("Destination", destinationSchema);
