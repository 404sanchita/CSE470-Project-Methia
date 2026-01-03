import express from "express";
import Hotel from "../models/hotel.js";
import Reaction from "../models/reaction.js";

const router = express.Router();

// Get hotels with optional filters
router.get("/", async (req, res) => {
  try {
    const { minPrice, maxPrice, rating, location, amenities } = req.query;

    let filter = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    if (location) {
      // case-insensitive partial match
      filter.location = { $regex: location, $options: "i" };
    }

    if (amenities) {
      filter.amenities = { $all: amenities.split(",").map((a) => a.trim()) };
    }

    const hotels = await Hotel.find(filter);
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check availability for specific dates (must come before /:id route)
router.post("/availability/check", async (req, res) => {
  try {
    const { hotelId, checkInDate, checkOutDate, roomsNeeded = 1 } = req.body;

    if (!hotelId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ 
        message: "hotelId, checkInDate, and checkOutDate are required" 
      });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Check for conflicts with booked dates
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

    res.json({
      hotelId,
      checkInDate,
      checkOutDate,
      totalRooms: hotel.totalRooms,
      bookedRooms,
      availableRooms,
      roomsNeeded,
      isAvailable,
      message: isAvailable 
        ? `${availableRooms} room(s) available` 
        : `Not enough rooms. Only ${availableRooms} available.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single hotel by ID (must come after specific routes like /availability/check)
router.get("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });
    
    // Get reaction counts
    const likesCount = await Reaction.countDocuments({ 
      resourceType: "hotel", 
      resourceId: hotel._id, 
      type: "like" 
    });
    const dislikesCount = await Reaction.countDocuments({ 
      resourceType: "hotel", 
      resourceId: hotel._id, 
      type: "dislike" 
    });
    
    const hotelObj = hotel.toObject();
    hotelObj.likesCount = likesCount;
    hotelObj.dislikesCount = dislikesCount;
    hotelObj.userReaction = null; // Will be set by LikeDislike component based on current user
    
    res.json(hotelObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
