import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  message: { type: String, required: true },
  reply: { type: String, default: "" },
  status: { 
    type: String, 
    enum: ["pending", "answered"], 
    default: "pending" 
  },
  repliedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChatMessage", chatMessageSchema);