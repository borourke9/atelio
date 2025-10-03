const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

// Import routes
const compositeRoute = require('./routes/composite.js');

// Routes
app.use('/api', compositeRoute);

// Check if API key is present
if (!process.env.API_KEY && !process.env.GOOGLE_API_KEY) {
  console.warn("⚠️ API_KEY not found in environment variables");
  console.warn("   Please set API_KEY in your .env file");
} else {
  console.log("✅ Google AI API key present");
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Google AI Images API'
  });
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving static files from /shared and /assets`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Mobile access: http://100.69.95.6:${PORT}/health`);
  console.log(`🤖 Using Google AI Images API for composite generation`);
});

module.exports = app;