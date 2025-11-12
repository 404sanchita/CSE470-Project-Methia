import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending'
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

