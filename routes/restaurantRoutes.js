import express from "express";
import mongoose from "mongoose";
import Restaurant from "../models/restaurant.js";
import Destination from "../models/destination.js";
import RestaurantBooking from "../models/restaurantBooking.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Check MongoDB connection
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Get all restaurants with search and filter
router.get("/", async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!isMongoConnected()) {
      return res.status(503).json({ 
        message: "Database connection not available. Please ensure MongoDB is running.",
        restaurants: []
      });
    }

    const { search, place, priceRange, cuisine } = req.query;
    let query = {};

    // Search by restaurant name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Search by place (destination name or address)
    if (place) {
      // First, find destinations matching the place name
      const destinations = await Destination.find({
        $or: [
          { name: { $regex: place, $options: "i" } },
          { country: { $regex: place, $options: "i" } }
        ]
      }).select("_id");

      const destinationIds = destinations.map(d => d._id);
      
      query.$or = [
        { destination: { $in: destinationIds } },
        { address: { $regex: place, $options: "i" } }
      ];
    }

    // Filter by price range
    if (priceRange) {
      // Price ranges: $, $$, $$$, $$$$
      // Map to actual price ranges for filtering
      const priceMap = {
        "$": { min: 0, max: 20 },
        "$$": { min: 20, max: 50 },
        "$$$": { min: 50, max: 100 },
        "$$$$": { min: 100, max: Infinity }
      };

      if (priceMap[priceRange]) {
        // Since we store priceRange as string, we'll filter by the string value
        // But we can also add a numeric price field if needed
        query.priceRange = priceRange;
      }
    }

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = { $in: [new RegExp(cuisine, "i")] };
    }

    const restaurants = await Restaurant.find(query)
      .populate("destination", "name country")
      .sort({ rating: -1 }); // Sort by rating descending

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants", error: error.message });
  }
});

// Get recommended restaurants based on price filter
router.get("/recommendations/price", async (req, res) => {
  try {
    const { priceRange, limit = 10 } = req.query;
    
    if (!priceRange) {
      return res.status(400).json({ message: "Price range is required" });
    }

    const restaurants = await Restaurant.find({ priceRange })
      .populate("destination", "name country")
      .sort({ rating: -1 })
      .limit(parseInt(limit));

    res.json({
      priceRange,
      count: restaurants.length,
      restaurants
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching recommendations", error: error.message });
  }
});

// Get user's restaurant bookings (by email) - MUST be before /:restaurantId routes
router.get("/bookings/my", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const bookings = await RestaurantBooking.find({ userEmail: email })
      .populate("restaurantId", "name address image")
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
});

// Book a table at a restaurant
router.post("/:restaurantId/book", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { userName, userEmail, userPhone, date, time, numberOfGuests, specialRequests } = req.body;

    // Validate required fields
    if (!userName || !userEmail || !date || !time || !numberOfGuests) {
      return res.status(400).json({ 
        message: "Please provide all required fields: userName, userEmail, date, time, and numberOfGuests" 
      });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check available seats
    if (restaurant.availableSeats < numberOfGuests) {
      return res.status(400).json({ 
        message: `Not enough available seats. Only ${restaurant.availableSeats} seats available.` 
      });
    }

    // Create booking
    const booking = new RestaurantBooking({
      restaurantId,
      restaurantName: restaurant.name,
      userName,
      userEmail,
      userPhone,
      date,
      time,
      numberOfGuests,
      specialRequests: specialRequests || "",
      bookingStatus: "pending"
    });

    const savedBooking = await booking.save();

    // Update available seats after booking
    await Restaurant.findByIdAndUpdate(restaurantId, {
      $inc: { availableSeats: -numberOfGuests }
    });

    // Get updated restaurant data
    const updatedRestaurant = await Restaurant.findById(restaurantId);

    res.status(201).json({
      message: "Table booking request submitted successfully",
      booking: savedBooking,
      updatedAvailableSeats: updatedRestaurant.availableSeats
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
});

// Get all bookings for a restaurant (admin only)
router.get("/:restaurantId/bookings", protect, adminOnly, async (req, res) => {
  try {
    const bookings = await RestaurantBooking.find({ restaurantId: req.params.restaurantId })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
});

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const restaurant = new Restaurant(req.body);
    const saved = await restaurant.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Error creating restaurant", error: error.message });
  }
});

// Get restaurants by destination ID (backward compatibility) - must be last to avoid route conflicts
router.get("/:destinationId", async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ destination: req.params.destinationId })
      .populate("destination", "name country");
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants", error: error.message });
  }
});

export default router;
