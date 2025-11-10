import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answers: [String],
  recommendedDestination: { type: mongoose.Schema.Types.ObjectId, ref: "Destination" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("QuizResult", quizResultSchema);
