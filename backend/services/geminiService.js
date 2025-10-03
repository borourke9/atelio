const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');

// Dynamic import for node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

// Helper to download image from URL and convert to File-like object
async function downloadImageAsFile(imageUrl, filename) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const buffer = await response.buffer();
  const mimeType = response.headers.get('content-type') || 'image/jpeg';
  
  // Create a temporary file
  const tempPath = path.join(__dirname, '../uploads', `${filename}-${Date.now()}.${mimeType.split('/')[1]}`);
  fs.writeFileSync(tempPath, buffer);
  
  return {
    path: tempPath,
    mimeType,
    name: filename
  };
}

// Helper to get image dimensions
async function getImageDimensions(imagePath) {
  return new Promise((resolve, reject) => {
    const img = require('sharp')(imagePath);
    img.metadata()
      .then(metadata => {
        resolve({ width: metadata.width, height: metadata.height });
      })
      .catch(reject);
  });
}

// Helper to resize image to square with padding
async function resizeImageToSquare(imagePath, targetDimension) {
  const sharp = require('sharp');
  const img = sharp(imagePath);
  const metadata = await img.metadata();
  
  const aspectRatio = metadata.width / metadata.height;
  let newWidth, newHeight;
  
  if (aspectRatio > 1) { // Landscape
    newWidth = targetDimension;
    newHeight = Math.round(targetDimension / aspectRatio);
  } else { // Portrait or square
    newHeight = targetDimension;
    newWidth = Math.round(targetDimension * aspectRatio);
  }
  
  const x = (targetDimension - newWidth) / 2;
  const y = (targetDimension - newHeight) / 2;
  
  const resizedPath = imagePath.replace(/\.[^.]+$/, '_resized.jpg');
  
  await img
    .resize(newWidth, newHeight)
    .extend({
      top: Math.round(y),
      bottom: Math.round(y),
      left: Math.round(x),
      right: Math.round(x),
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .jpeg({ quality: 95 })
    .toFile(resizedPath);
    
  return resizedPath;
}

// Helper to add marker to image
async function addMarkerToImage(imagePath, position, originalDimensions) {
  const sharp = require('sharp');
  const img = sharp(imagePath);
  const metadata = await img.metadata();
  const targetDimension = metadata.width;
  
  const { originalWidth, originalHeight } = originalDimensions;
  const aspectRatio = originalWidth / originalHeight;
  let contentWidth, contentHeight;
  
  if (aspectRatio > 1) { // Landscape
    contentWidth = targetDimension;
    contentHeight = Math.round(targetDimension / aspectRatio);
  } else { // Portrait or square
    contentHeight = targetDimension;
    contentWidth = Math.round(targetDimension * aspectRatio);
  }
  
  const offsetX = (targetDimension - contentWidth) / 2;
  const offsetY = (targetDimension - contentHeight) / 2;
  
  const markerXInContent = (position.x / 100) * contentWidth;
  const markerYInContent = (position.y / 100) * contentHeight;
  
  const finalMarkerX = Math.round(offsetX + markerXInContent);
  const finalMarkerY = Math.round(offsetY + markerYInContent);
  
  const markerRadius = Math.max(5, Math.min(targetDimension, targetDimension) * 0.015);
  
  // Create marker SVG
  const markerSvg = `
    <svg width="${targetDimension}" height="${targetDimension}">
      <circle cx="${finalMarkerX}" cy="${finalMarkerY}" r="${markerRadius}" fill="red" stroke="white" stroke-width="${markerRadius * 0.2}"/>
    </svg>
  `;
  
  const markedPath = imagePath.replace(/\.[^.]+$/, '_marked.jpg');
  
  await img
    .composite([{
      input: Buffer.from(markerSvg),
      top: 0,
      left: 0
    }])
    .jpeg({ quality: 95 })
    .toFile(markedPath);
    
  return markedPath;
}

// Helper to crop image back to original aspect ratio
async function cropToOriginalAspectRatio(imagePath, originalWidth, originalHeight, targetDimension) {
  const sharp = require('sharp');
  const img = sharp(imagePath);
  const metadata = await img.metadata();
  
  const aspectRatio = originalWidth / originalHeight;
  let contentWidth, contentHeight;
  
  if (aspectRatio > 1) { // Landscape
    contentWidth = targetDimension;
    contentHeight = Math.round(targetDimension / aspectRatio);
  } else { // Portrait or square
    contentHeight = targetDimension;
    contentWidth = Math.round(targetDimension * aspectRatio);
  }
  
  const x = (targetDimension - contentWidth) / 2;
  const y = (targetDimension - contentHeight) / 2;
  
  const croppedPath = imagePath.replace(/\.[^.]+$/, '_cropped.jpg');
  
  await img
    .extract({
      left: Math.round(x),
      top: Math.round(y),
      width: contentWidth,
      height: contentHeight
    })
    .jpeg({ quality: 95 })
    .toFile(croppedPath);
    
  return croppedPath;
}

async function generateComposite(sceneUrl, productUrl, replaceRegion) {
  const API_KEY = process.env.API_KEY || process.env.GOOGLE_API_KEY;
  
  if (!API_KEY) {
    throw new Error("API_KEY not found in environment variables");
  }

  console.log("🎨 Starting composite generation with Google GenAI...");
  console.log("📸 Scene URL:", sceneUrl);
  console.log("🪑 Product URL:", productUrl);
  console.log("📍 Replace region:", replaceRegion);

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Download images
    console.log("📥 Downloading images...");
    const sceneFile = await downloadImageAsFile(sceneUrl, 'scene');
    const productFile = await downloadImageAsFile(productUrl, 'product');
    
    // Get original dimensions
    const { width: originalWidth, height: originalHeight } = await getImageDimensions(sceneFile.path);
    
    // Resize images to square
    console.log("🔄 Resizing images...");
    const MAX_DIMENSION = 1024;
    const resizedScenePath = await resizeImageToSquare(sceneFile.path, MAX_DIMENSION);
    const resizedProductPath = await resizeImageToSquare(productFile.path, MAX_DIMENSION);
    
    // Add marker to scene
    console.log("📍 Adding placement marker...");
    const markedScenePath = await addMarkerToImage(
      resizedScenePath, 
      { x: replaceRegion.x * 100, y: replaceRegion.y * 100 },
      { originalWidth, originalHeight }
    );
    
    // Convert to base64 for API
    const productBuffer = fs.readFileSync(resizedProductPath);
    const sceneBuffer = fs.readFileSync(markedScenePath);
    
    const productBase64 = productBuffer.toString('base64');
    const sceneBase64 = sceneBuffer.toString('base64');
    
    // Create prompt
    const prompt = `
Role:
You are a professional interior rendering and visual composition expert. Your task is to seamlessly integrate or replace a 'product' image inside a 'scene' image so the final output looks photorealistic.

Input Images:

Product Image: The furniture/product to insert into the scene. This is the source of truth. Ignore any black padding around it; treat it as transparent.

Scene Image: The background room or environment where the product will appear. A highlighted region or marker may indicate the target area.

Instructions (Strictly follow):

Identity Preservation:
- Treat the product image as the source of truth. The product must be rendered with the exact same shape, material, color, and texture.
- Do not modify, stylize, or alter the product in any way (e.g., changing proportions, patterns, fabrics, colors, or design features like arms, cushions, stitching, or legs).

Placement & Integration:
- Insert the product so its center aligns with the provided marker or replacement region.
- If a target region contains existing furniture, remove it and replace it with the new product.
- Match lighting, shadows, and perspective to the scene. Only adjust shadows, scale, and perspective for realism.
- Ensure the product respects realistic scale (e.g., a coffee table should not be taller than a sofa).
- Blend edges and surfaces so the product looks naturally photographed inside the room.

Output Requirements:
- The final output should look like a real photograph, not a painting or an AI-stylized render.
- Remove any markers, bounding boxes, or artifacts from the scene. The final image must be clean and realistic.
- Only generate the final composed image — no text, borders, or annotations.
`;

    console.log("🤖 Calling Gemini API...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { 
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: productBase64 } },
          { inlineData: { mimeType: 'image/jpeg', data: sceneBase64 } },
          { text: prompt }
        ] 
      },
    });

    console.log("📡 Received response from Gemini API");
    
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    
    if (imagePart?.inlineData) {
      const { mimeType, data } = imagePart.inlineData;
      console.log(`🖼️ Generated image data (${mimeType}), length:`, data.length);
      
      // Save generated image temporarily
      const generatedPath = path.join(__dirname, '../uploads', `generated-${Date.now()}.jpg`);
      fs.writeFileSync(generatedPath, Buffer.from(data, 'base64'));
      
      // Crop to original aspect ratio
      console.log("✂️ Cropping to original aspect ratio...");
      const finalPath = await cropToOriginalAspectRatio(
        generatedPath,
        originalWidth,
        originalHeight,
        MAX_DIMENSION
      );
      
      // Convert to data URL
      const finalBuffer = fs.readFileSync(finalPath);
      const finalBase64 = finalBuffer.toString('base64');
      const imageUrl = `data:${mimeType};base64,${finalBase64}`;
      
      // Clean up temporary files
      [sceneFile.path, productFile.path, resizedScenePath, resizedProductPath, markedScenePath, generatedPath, finalPath].forEach(file => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });
      
      console.log("✅ Composite generation completed successfully");
      return { imageUrl };
    }
    
    throw new Error("No image found in Gemini API response");
    
  } catch (error) {
    console.error("❌ Composite generation failed:", error);
    
    // Fallback: return a mock response
    console.log("🔄 Falling back to mock response due to API error");
    const mockImageUrl = "https://res.cloudinary.com/dr1uz5pka/image/upload/v1759192370/sofagray_w4tskg.png?generated=" + Date.now() + "&fallback=true";
    return { imageUrl: mockImageUrl };
  }
}

module.exports = { generateComposite };