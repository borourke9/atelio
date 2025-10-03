#!/usr/bin/env node

// Script to update Open Graph image in index.html
// Usage: node update-og-image.js <image-filename>

import fs from 'fs';
import path from 'path';

const imageFilename = process.argv[2];

if (!imageFilename) {
  console.log('❌ Please provide an image filename');
  console.log('Usage: node update-og-image.js <image-filename>');
  console.log('Example: node update-og-image.js my-og-image.png');
  process.exit(1);
}

const indexPath = './index.html';
const imagePath = `./public/images/${imageFilename}`;

// Check if image file exists
if (!fs.existsSync(imagePath)) {
  console.log(`❌ Image file not found: ${imagePath}`);
  console.log('Please make sure the image is in the public/images/ folder');
  process.exit(1);
}

// Read the current index.html
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Update the Open Graph image URLs
const newImageUrl = `https://atelio-ai.vercel.app/images/${imageFilename}`;

// Replace og:image URLs
htmlContent = htmlContent.replace(
  /<meta property="og:image" content="[^"]*">/g,
  `<meta property="og:image" content="${newImageUrl}">`
);

// Replace twitter:image URLs
htmlContent = htmlContent.replace(
  /<meta property="twitter:image" content="[^"]*">/g,
  `<meta property="twitter:image" content="${newImageUrl}">`
);

// Write the updated HTML
fs.writeFileSync(indexPath, htmlContent);

console.log('✅ Successfully updated Open Graph image!');
console.log(`📸 New image URL: ${newImageUrl}`);
console.log('🚀 Don\'t forget to commit and push your changes');
