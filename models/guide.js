import mongoose from "mongoose";

const guideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  language: [String],
  hourlyRate: String,
  experience: String,
  location: String,
  specialties: [String],
  unavailableDates: [Date],
});

export default mongoose.model("Guide", guideSchema);


