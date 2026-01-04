import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resourceType: {
      type: String,
      required: true,
      enum: ["destination", "restaurant", "hotel", "guide"],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
  },
  { timestamps: true }
);

// One reaction per user per resource
reactionSchema.index(
  { user: 1, resourceType: 1, resourceId: 1 },
  { unique: true }
);

export default mongoose.model("Reaction", reactionSchema);
