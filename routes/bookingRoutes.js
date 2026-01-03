import express from 'express';
import HotelBooking from '../models/booking.js';
import Hotel from '../models/hotel.js';

const router = express.Router();

// Helper function to check availability
const checkRoomAvailability = async (hotelId, checkInDate, checkOutDate, roomsNeeded = 1) => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) return { available: false, message: "Hotel not found" };

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  let bookedRooms = 0;
  if (hotel.bookedDates && hotel.bookedDates.length > 0) {
    hotel.bookedDates.forEach((booking) => {
      const bookingCheckIn = new Date(booking.checkInDate);
      const bookingCheckOut = new Date(booking.checkOutDate);

      // Check if dates overlap
      if (checkIn < bookingCheckOut && checkOut > bookingCheckIn) {
        bookedRooms += booking.roomsBooked;
      }
    });
  }

  const availableRooms = hotel.totalRooms - bookedRooms;
  const isAvailable = availableRooms >= roomsNeeded;

  return {
    available: isAvailable,
    availableRooms,
    totalRooms: hotel.totalRooms,
    message: isAvailable 
      ? `${availableRooms} room(s) available` 
      : `Not enough rooms. Only ${availableRooms} available.`
  };
};

// Create a booking
router.post('/', async (req, res) => {
  try {
    const { userId, hotelId, checkInDate, checkOutDate, guests = 1, paymentMethod } = req.body;
    if (!userId || !hotelId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

    // Check availability
    const availability = await checkRoomAvailability(hotelId, checkInDate, checkOutDate, guests);
    if (!availability.available) {
      return res.status(400).json({ 
        error: availability.message,
        availableRooms: availability.availableRooms
      });
    }

    // Calculate total price - use pricePerNight if price is 0 or undefined
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const pricePerNight = hotel.price || hotel.pricePerNight || 0;
    const totalPrice = pricePerNight * nights;

    const booking = new HotelBooking({
      userId,
      hotelId,
      hotelName: hotel.name,
      hotelLocation: hotel.location,
      hotelPrice: pricePerNight,
      hotelRating: hotel.rating,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      guests,
      totalPrice,
      bookingStatus: 'Confirmed',
      payment: { method: paymentMethod, status: 'Pending' }
    });

    await booking.save();

    // Update hotel's booked dates
    hotel.bookedDates.push({
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      roomsBooked: guests
    });
    hotel.availableRooms = availability.availableRooms - guests;
    await hotel.save();

    res.status(201).json(booking);
  } catch (err) {
    console.error('Booking create error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await HotelBooking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookings for a specific user (must come before /:id to avoid conflicts)
router.get('/my/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await HotelBooking.find({ userId });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single booking by ID (must come after /my/:userId)
router.get('/:id', async (req, res) => {
  try {
    const booking = await HotelBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking (partial) e.g., change status
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const booking = await HotelBooking.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Modify booking dates and guests with availability check
router.post('/modify/:id', async (req, res) => {
  try {
    const { checkInDate, checkOutDate, guests } = req.body;
    
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: 'Check-in and check-out dates are required' });
    }

    const booking = await HotelBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot modify a cancelled booking' });
    }

    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const newCheckIn = new Date(checkInDate);
    const newCheckOut = new Date(checkOutDate);
    const guestsNeeded = guests || booking.guests;

    // Check for date conflicts, excluding current booking
    let bookedRooms = 0;
    if (hotel.bookedDates && hotel.bookedDates.length > 0) {
      hotel.bookedDates.forEach((bd) => {
        const bdCheckIn = new Date(bd.checkInDate);
        const bdCheckOut = new Date(bd.checkOutDate);

        // Skip the current booking
        if (
          new Date(bd.checkInDate).getTime() === new Date(booking.checkInDate).getTime() &&
          new Date(bd.checkOutDate).getTime() === new Date(booking.checkOutDate).getTime()
        ) {
          return;
        }

        // Check if dates overlap
        if (newCheckIn < bdCheckOut && newCheckOut > bdCheckIn) {
          bookedRooms += bd.roomsBooked;
        }
      });
    }

    const availableRooms = hotel.totalRooms - bookedRooms;
    if (availableRooms < guestsNeeded) {
      return res.status(400).json({
        message: `Not enough rooms available. Only ${availableRooms} room(s) available for the selected dates.`,
        availableRooms,
        totalRooms: hotel.totalRooms
      });
    }

    // Calculate new price - use pricePerNight if price is 0 or undefined
    const nights = Math.ceil((newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24));
    const pricePerNight = hotel.price || hotel.pricePerNight || 0;
    const totalPrice = pricePerNight * nights;

    // Update hotel's booked dates (remove old, add new)
    hotel.bookedDates = hotel.bookedDates.filter(
      (bd) => !(
        new Date(bd.checkInDate).getTime() === new Date(booking.checkInDate).getTime() &&
        new Date(bd.checkOutDate).getTime() === new Date(booking.checkOutDate).getTime()
      )
    );

    hotel.bookedDates.push({
      checkInDate: newCheckIn,
      checkOutDate: newCheckOut,
      roomsBooked: guestsNeeded
    });

    hotel.availableRooms = hotel.totalRooms - 
      hotel.bookedDates.reduce((sum, d) => sum + d.roomsBooked, 0);
    await hotel.save();

    // Update booking
    booking.checkInDate = newCheckIn;
    booking.checkOutDate = newCheckOut;
    booking.guests = guestsNeeded;
    booking.totalPrice = totalPrice;
    await booking.save();

    res.json({
      message: 'Booking modified successfully',
      booking,
      totalPrice,
      nights
    });
  } catch (err) {
    console.error('Modify booking error:', err);
    res.status(500).json({ message: 'Failed to modify booking', error: err.message });
  }
});

// Cancel booking
router.put('/cancel/:id', async (req, res) => {
  try {
    const booking = await HotelBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Free up the booked rooms
    const hotel = await Hotel.findById(booking.hotelId);
    if (hotel) {
      hotel.bookedDates = hotel.bookedDates.filter(
        (date) => !(
          new Date(date.checkInDate).getTime() === new Date(booking.checkInDate).getTime() &&
          new Date(date.checkOutDate).getTime() === new Date(booking.checkOutDate).getTime()
        )
      );
      hotel.availableRooms = hotel.totalRooms - 
        hotel.bookedDates.reduce((sum, d) => sum + d.roomsBooked, 0);
      await hotel.save();
    }

    booking.bookingStatus = 'Cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Cancel failed', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await HotelBooking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
