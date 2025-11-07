import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: String,
  image: String,
  bestSeason: String,
});

const Destination = mongoose.model("Destination", destinationSchema);

export default Destination;
