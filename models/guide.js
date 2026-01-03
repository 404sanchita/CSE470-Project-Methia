import mongoose from "mongoose";

const guideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  language: [String],
  hourlyRate: { type: String },
  experience: { type: String },
  location: String,
  specialties: [String],
  availableDates: [Date],
});

export default mongoose.model("Guide", guideSchema);
