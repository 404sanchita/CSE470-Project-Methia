import express from "express";
import Guide from "../models/guide.js";
import Reaction from "../models/reaction.js";

const router = express.Router();

// GET all guides
router.get("/", async (req, res) => {
  try {
    const guides = await Guide.find();
    res.json(guides);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch guides" });
  }
});

// GET guides by location
router.get("/by-location/:location", async (req, res) => {
  try {
    // Decode URL-encoded location (e.g., "New%20York" -> "New York")
    let location = decodeURIComponent(req.params.location);
    
    // Escape special regex characters
    const escapedLocation = location.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    // Use case-insensitive regex that matches location containing the search term
    // This handles both exact matches and partial matches (e.g., "Paris" matches "Paris, France")
    const guides = await Guide.find({
      location: { $regex: new RegExp(escapedLocation, "i") }
    });
    
    console.log(`Searching for guides in location: "${location}", found ${guides.length} guides`);
    
    res.json(guides);
  } catch (err) {
    console.error("Error fetching guides by location:", err);
    res.status(500).json({ message: "Failed to fetch guides by location" });
  }
});

// POST create a new guide
router.post("/", async (req, res) => {
  try {
    const guide = new Guide(req.body);
    const saved = await guide.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating guide:", err);
    res.status(500).json({ message: "Failed to create guide", error: err.message });
  }
});

// POST seed sample guides (for development/testing)
router.post("/seed", async (req, res) => {
  try {
    const sampleGuides = [
      {
        name: "Marie Dubois",
        location: "Paris",
        language: ["French", "English"],
        hourlyRate: "€50",
        experience: "5 years",
        specialties: ["History", "Art", "Architecture"]
      },
      {
        name: "Jean-Pierre Martin",
        location: "Paris",
        language: ["French", "English", "Spanish"],
        hourlyRate: "€45",
        experience: "3 years",
        specialties: ["Food", "Culture", "Nightlife"]
      },
      {
        name: "Yuki Tanaka",
        location: "Kyoto",
        language: ["Japanese", "English"],
        hourlyRate: "¥5000",
        experience: "7 years",
        specialties: ["Temples", "Traditional Culture", "Zen"]
      },
      {
        name: "Hiroshi Yamamoto",
        location: "Kyoto",
        language: ["Japanese", "English", "Chinese"],
        hourlyRate: "¥4500",
        experience: "4 years",
        specialties: ["History", "Tea Ceremony", "Gardens"]
      },
      {
        name: "Made Surya",
        location: "Bali",
        language: ["Indonesian", "English"],
        hourlyRate: "$30",
        experience: "6 years",
        specialties: ["Beaches", "Temples", "Adventure"]
      },
      {
        name: "Ketut Wijaya",
        location: "Bali",
        language: ["Indonesian", "English", "Dutch"],
        hourlyRate: "$35",
        experience: "8 years",
        specialties: ["Culture", "Spiritual", "Nature"]
      },
      {
        name: "Sarah Johnson",
        location: "New York",
        language: ["English", "Spanish"],
        hourlyRate: "$60",
        experience: "5 years",
        specialties: ["City Tours", "Food", "Entertainment"]
      },
      {
        name: "Michael Chen",
        location: "New York",
        language: ["English", "Mandarin", "Cantonese"],
        hourlyRate: "$55",
        experience: "4 years",
        specialties: ["History", "Architecture", "Shopping"]
      },
      {
        name: "Marco Rossi",
        location: "Rome",
        language: ["Italian", "English"],
        hourlyRate: "€55",
        experience: "6 years",
        specialties: ["History", "Art", "Food"]
      },
      {
        name: "Giulia Bianchi",
        location: "Rome",
        language: ["Italian", "English", "French"],
        hourlyRate: "€50",
        experience: "5 years",
        specialties: ["Vatican", "Archaeology", "Culture"]
      },
      {
        name: "James Thompson",
        location: "London",
        language: ["English"],
        hourlyRate: "£45",
        experience: "7 years",
        specialties: ["History", "Royalty", "Museums"]
      },
      {
        name: "Emma Wilson",
        location: "London",
        language: ["English", "French", "German"],
        hourlyRate: "£50",
        experience: "4 years",
        specialties: ["Food", "Theater", "Shopping"]
      },
      {
        name: "Ahmed Al-Mansoori",
        location: "Dubai",
        language: ["Arabic", "English"],
        hourlyRate: "AED 200",
        experience: "5 years",
        specialties: ["Modern City", "Desert", "Shopping"]
      },
      {
        name: "Fatima Al-Zahra",
        location: "Dubai",
        language: ["Arabic", "English", "Hindi"],
        hourlyRate: "AED 180",
        experience: "6 years",
        specialties: ["Culture", "Food", "Entertainment"]
      }
    ];

    // Clear existing guides (optional - remove if you want to keep existing data)
    await Guide.deleteMany({});
    
    // Insert sample guides
    const createdGuides = await Guide.insertMany(sampleGuides);
    res.status(201).json({ message: `Created ${createdGuides.length} guides`, guides: createdGuides });
  } catch (err) {
    console.error("Error seeding guides:", err);
    res.status(500).json({ message: "Failed to seed guides", error: err.message });
  }
});

// GET single guide by ID
router.get("/:id", async (req, res) => {
  try {
    const guide = await Guide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }
    
    // Get reaction counts
    const likesCount = await Reaction.countDocuments({ 
      resourceType: "guide", 
      resourceId: guide._id, 
      type: "like" 
    });
    const dislikesCount = await Reaction.countDocuments({ 
      resourceType: "guide", 
      resourceId: guide._id, 
      type: "dislike" 
    });
    
    const guideObj = guide.toObject();
    guideObj.likesCount = likesCount;
    guideObj.dislikesCount = dislikesCount;
    guideObj.userReaction = null; // Will be set by LikeDislike component based on current user
    
    res.json(guideObj);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch guide" });
  }
});

export default router;
