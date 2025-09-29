# Furniture Swap MVP

An AI-powered room design application that allows users to upload room photos, detect furniture using AI, and swap furniture with items from a catalog.

## 🔹 Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Canvas**: Fabric.js for drag/resize/rotate functionality
- **Backend**: Node.js + Express
- **AI Integration**: Replicate API (google/nano-banana) for object detection + inpainting
- **Storage**: Local (assets + catalog.json)
- **State**: React Context for live design sessions

## 🔹 Features

1. **Upload Room Photo** - Upload JPG/PNG images with auto-scaling and centering
2. **AI Detection** - Backend calls NanoBanana to detect objects by category (≥90% confidence)
3. **Choose Replacement** - Browse furniture catalog with semantic metadata
4. **AI Swap** - Backend processes furniture replacement with inpainting
5. **Session State** - Save and load room designs with localStorage

## 🔹 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /Users/bryceorourke/Desktop/design1
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables (optional):**
   ```bash
   # Create .env file in backend directory
   echo "REPLICATE_API_TOKEN=your_replicate_token_here" > backend/.env
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Open your browser:**
   Navigate to `http://localhost:5173` to use the application

## 🔹 Usage

1. **Upload Room Photo** - Drag and drop or click to upload a room photo
2. **AI Detects Furniture** - The system automatically detects furniture in your photo
3. **Choose Furniture to Replace** - Browse the catalog and click on furniture items
4. **See Instant Swap** - Watch your room transform with the new furniture

## 🔹 Project Structure

```
design1/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── UploadArea.tsx
│   │   │   ├── CanvasEditor.tsx
│   │   │   ├── CatalogSidebar.tsx
│   │   │   └── FooterSteps.tsx
│   │   ├── context/         # React Context
│   │   │   └── RoomContext.tsx
│   │   ├── types/           # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Node.js + Express backend
│   ├── index.js             # Main server file
│   ├── package.json
│   ├── assets/              # Legacy furniture images
│   └── public/images/       # Furniture images (add your JPGs here)
├── shared/                   # Shared data
│   └── catalog.json         # Furniture catalog
└── README.md
```

## 🔹 API Endpoints

- `GET /health` - Health check
- `POST /detect-furniture` - Detect furniture in uploaded image
- `POST /swap-furniture` - Swap furniture in image
- `GET /catalog` - Get furniture catalog
- `GET /shared/*` - Serve static files

## 🔹 Development

### Frontend Development

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development

```bash
cd backend
npm run dev          # Start with nodemon
npm start            # Start production server
```

## 🔹 Customization

### Adding New Furniture

1. Add your JPG image to `backend/public/images/` folder
2. Add entries to `shared/catalog.json`:
   ```json
   {
     "id": "unique-id",
     "name": "Furniture Name",
     "imageUrl": "/images/your-image.jpg",
     "category": "sofa",
     "replacementHint": "Replace existing sofa in the photo"
   }
   ```

3. Restart the backend server to load new catalog

### Image Requirements

- **Format**: JPG files only
- **Size**: Recommended 300x300 pixels or similar square aspect ratio
- **Location**: Place images in `backend/public/images/` folder
- **Naming**: Use descriptive names matching the catalog entries

### Styling

The app uses TailwindCSS with custom components defined in `frontend/src/index.css`. Modify the CSS classes or add new ones as needed.

## 🔹 Troubleshooting

### Common Issues

1. **CORS errors**: Make sure the backend is running on port 3001
2. **Images not loading**: Check that the backend is serving static files correctly
3. **API errors**: Check the browser console and backend logs for detailed error messages

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## 🔹 Future Enhancements

- Real Replicate API integration for object detection and inpainting
- User authentication and cloud storage
- More furniture categories and items
- Advanced canvas tools (undo/redo, layers)
- Export functionality (PNG, PDF)
- Mobile responsiveness improvements

## 🔹 License

MIT License - feel free to use this project for learning and development purposes.
