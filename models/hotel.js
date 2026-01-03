import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  price: { type: Number, default: 0 },
  pricePerNight: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  amenities: { type: [String], default: [] },
  totalRooms: { type: Number, default: 10, required: true },
  availableRooms: { type: Number, default: 10, required: true },
  roomTypes: {
    single: { type: Number, default: 3 },
    double: { type: Number, default: 4 },
    suite: { type: Number, default: 3 }
  },
  bookedDates: [
    {
      checkInDate: { type: Date, required: true },
      checkOutDate: { type: Date, required: true },
      roomsBooked: { type: Number, default: 1 }
    }
  ]
}, { timestamps: true });

// Virtual to normalize price field - use pricePerNight if price is 0 or undefined
hotelSchema.virtual('normalizedPrice').get(function() {
  return this.price || this.pricePerNight || 0;
});

// Transform to include normalized price in JSON output
hotelSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    // Ensure price field has the correct value
    if (!ret.price || ret.price === 0) {
      ret.price = ret.pricePerNight || 0;
    }
    return ret;
  }
});

export default mongoose.model("Hotel", hotelSchema);
