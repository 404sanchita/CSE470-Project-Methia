import mongoose from "mongoose";

const guideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  language: [String],
  hourlyRate: Number,
  experience: Number,
  location: String,
  specialties: [String],
  availableDates: [Date],
});

export default mongoose.model("Guide", guideSchema);

