const express = require("express");
const { generateComposite } = require("../services/geminiService.js");
const dotenv = require("dotenv");

dotenv.config();
const router = express.Router();

// Check if Google API key is present
if (!process.env.GOOGLE_API_KEY) {
  console.warn("⚠️ GOOGLE_API_KEY not found in environment variables");
  console.warn("   Please set GOOGLE_API_KEY in your .env file");
} else {
  console.log("✅ Google AI Images API key present");
}

// New composite generation endpoint
router.post("/generate-composite", async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const { sceneUrl, productUrl, replaceRegion } = req.body;

    // Validate required fields
    if (!sceneUrl || !productUrl || !replaceRegion) {
      return res.status(400).json({ 
        error: "Missing required fields: sceneUrl, productUrl, and replaceRegion are required.",
        details: "All three fields must be provided for composite generation"
      });
    }

    // Validate replaceRegion structure
    if (typeof replaceRegion.x !== 'number' || typeof replaceRegion.y !== 'number') {
      return res.status(400).json({ 
        error: "Invalid replaceRegion format.",
        details: "replaceRegion must contain x and y properties as numbers (normalized coordinates 0-1)"
      });
    }

    console.log("🎨 Starting composite generation with Google AI...");
    console.log("📸 Scene URL:", sceneUrl);
    console.log("🪑 Product URL:", productUrl);
    console.log("📍 Replace region:", replaceRegion);

    // Generate composite using Google AI
    const result = await generateComposite(sceneUrl, productUrl, replaceRegion);

    console.log("✅ Composite generated successfully:", result);

    // Return success response
    res.json({ 
      imageUrl: result.imageUrl
    });
    
  } catch (error) {
    console.error("❌ Composite generation failed:", error);
    res.status(500).json({ 
      error: "Composite generation failed", 
      details: error.message 
    });
  }
});

module.exports = router;
