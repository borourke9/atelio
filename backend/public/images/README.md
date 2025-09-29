# Furniture Images Folder

This folder is where you can add your JPG images for the furniture catalog.

## Expected Images

Based on the catalog configuration, you should add these images:

### Sofas
- `modern-gray-sofa.jpg` - Modern Gray Sofa
- `leather-brown-sofa.jpg` - Leather Brown Sofa  
- `white-modern-sofa.jpg` - White Modern Sofa

### Tables
- `wooden-dining-table.jpg` - Wooden Dining Table
- `glass-coffee-table.jpg` - Glass Coffee Table

### Chairs
- `modern-dining-chairs.jpg` - Modern Dining Chairs
- `accent-armchair.jpg` - Accent Armchair

### Storage
- `bookshelf-unit.jpg` - Bookshelf Unit

## Image Requirements

- **Format**: JPG files only
- **Size**: Recommended 300x300 pixels or similar square aspect ratio
- **Quality**: High quality images work best
- **Content**: Clear, well-lit images of furniture items

## How to Add Images

1. Copy your JPG files into this folder
2. Name them exactly as listed above (case-sensitive)
3. Restart the backend server if it's running
4. The images will be automatically served at `http://localhost:3001/images/filename.jpg`

## Adding New Furniture

To add new furniture items:

1. Add your JPG image to this folder
2. Update `/shared/catalog.json` with the new item:
   ```json
   {
     "id": "your-furniture-id",
     "name": "Your Furniture Name",
     "imageUrl": "/images/your-image.jpg",
     "category": "sofa",
     "replacementHint": "Replace existing furniture in the photo"
   }
   ```
3. Restart the backend server

The application will automatically pick up the new images and display them in the catalog sidebar.

