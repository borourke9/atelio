# Images Folder

This folder contains images used throughout the ATELIO.AI application.

## iMessage Preview Image

To use your custom image for iMessage photo previews:

1. Add your image file to this folder (e.g., `og-image.png`, `og-image.jpg`, etc.)
2. Update the meta tags in `index.html` to point to your image:
   ```html
   <meta property="og:image" content="https://atelio-ai.vercel.app/images/your-image-name.png">
   <meta property="twitter:image" content="https://atelio-ai.vercel.app/images/your-image-name.png">
   ```

## Recommended Image Specifications

For best results with iMessage and social media previews:
- **Dimensions**: 1200x630 pixels (1.91:1 aspect ratio)
- **Format**: PNG or JPG
- **File size**: Under 5MB
- **Content**: Should include ATELIO.AI branding and be visually appealing

## Current Images

- `og-image.svg` - Current SVG-based Open Graph image
- `og-image.png` - Placeholder PNG image
- `og-image.html` - HTML version for testing

