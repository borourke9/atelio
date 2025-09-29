const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Replicate = require('replicate');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/shared', express.static(path.join(__dirname, '../shared')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/frontend-images', express.static(path.join(__dirname, '../frontend/public/images')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Initialize Replicate (you'll need to set REPLICATE_API_TOKEN in your .env file)
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Mock detection function (replace with actual Replicate API call)
async function detectFurniture(imagePath) {
  try {
    // For demo purposes, return mock detection results
    // In production, you would call the actual Replicate API here
    const mockDetections = [
      {
        category: 'sofa',
        confidence: 0.95,
        boundingBox: {
          x: 100,
          y: 150,
          width: 300,
          height: 200
        }
      },
      {
        category: 'table',
        confidence: 0.87,
        boundingBox: {
          x: 200,
          y: 400,
          width: 150,
          height: 100
        }
      }
    ];

    // Filter for high confidence detections (≥90%)
    return mockDetections.filter(detection => detection.confidence >= 0.9);
  } catch (error) {
    console.error('Error detecting furniture:', error);
    throw new Error('Failed to detect furniture in image');
  }
}

// Mock furniture swap function (replace with actual Replicate API call)
async function swapFurniture(imagePath, category, replacementImageUrl) {
  try {
    // For demo purposes, return the original image
    // In production, you would:
    // 1. Detect the object of the specified category
    // 2. Generate a mask for that object
    // 3. Run inpainting to remove the object
    // 4. Composite the new replacement image
    // 5. Return the updated image
    
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error('Error swapping furniture:', error);
    throw new Error('Failed to swap furniture');
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Detect furniture in uploaded image
app.post('/detect-furniture', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const detections = await detectFurniture(req.file.path);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({
      success: true,
      detections,
      message: `Found ${detections.length} furniture items`
    });
  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Swap furniture in image
app.post('/swap-furniture', async (req, res) => {
  try {
    const { photo, category, replacementImage } = req.body;
    
    if (!photo || !category || !replacementImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: photo, category, replacementImage'
      });
    }

    // Convert base64 photo to temporary file
    const base64Data = photo.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const tempImagePath = path.join(__dirname, 'uploads', `temp-${Date.now()}.jpg`);
    
    fs.writeFileSync(tempImagePath, imageBuffer);
    
    try {
      const updatedPhoto = await swapFurniture(tempImagePath, category, replacementImage);
      
      // Clean up temporary file
      fs.unlinkSync(tempImagePath);
      
      res.json({
        success: true,
        updatedPhoto,
        message: 'Furniture swapped successfully'
      });
    } catch (swapError) {
      // Clean up temporary file
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
      throw swapError;
    }
  } catch (error) {
    console.error('Swap error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get catalog
app.get('/catalog', (req, res) => {
  try {
    const catalogPath = path.join(__dirname, '../shared/catalog.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    res.json(catalog);
  } catch (error) {
    console.error('Catalog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load catalog'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from /shared and /assets`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
