import { useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { RoomProvider, useRoom } from './context/RoomContext';
import { HomeCanvasHeader } from './components/HomeCanvasHeader';
import { ProductBox } from './components/ProductBox';
import { SceneBox } from './components/SceneBox';
import { StepGuide } from './components/StepGuide';
import { ProductCatalogModal } from './components/ProductCatalogModal';
import { useComposite } from './hooks/useComposite';
import { useHistory } from './hooks/useHistory';
import toast from 'react-hot-toast';
import type { PlacedFurniture, CatalogItem, ReplaceRegion } from './types';

function AppContent() {
  const { state, dispatch, saveDesign } = useRoom();
  const { generateComposite, loading: compositeLoading } = useComposite();
  const { addToHistory, undo, redo, canUndo, canRedo, getCurrentImage } = useHistory();
  
  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null);
  const [replaceRegion, setReplaceRegion] = useState<ReplaceRegion | null>(null);
  const [showProductCatalog, setShowProductCatalog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Handle scene upload
  const handleSceneUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSceneImageUrl(result);
        addToHistory(result);
        setCurrentStep(2);
        toast.success('Scene uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Failed to upload scene image');
    }
  };

  // Handle product selection
  const handleProductSelect = (product: CatalogItem) => {
    console.log('Product selected:', product);
    setSelectedProduct(product);
    setCurrentStep(3);
    toast.success(`Selected ${product.name}`);
  };

  // Handle product drop
  const handleProductDrop = (file: File) => {
    // Create a temporary CatalogItem for the dropped file
    const tempProduct: CatalogItem = {
      id: `uploaded-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      imageUrl: URL.createObjectURL(file),
      category: 'uploaded',
      dimensions: 'Custom',
      replacementHint: 'Custom uploaded product'
    };
    setSelectedProduct(tempProduct);
    setCurrentStep(3);
  };

  // Handle scene click for placement
  const handleSceneClick = (region: ReplaceRegion) => {
    setReplaceRegion(region);
    setCurrentStep(4);
  };

  // Handle composite generation
  const handleGenerateComposite = async () => {
    if (!sceneImageUrl || !selectedProduct || !replaceRegion) {
      toast.error('Please complete all steps first');
      return;
    }

    try {
      const result = await generateComposite({
        sceneUrl: sceneImageUrl,
        productUrl: selectedProduct.imageUrl,
        replaceRegion
      });

      // Update scene with new composite
      setSceneImageUrl(result.imageUrl);
      addToHistory(result.imageUrl);
      toast.success('✨ Room generated successfully! Your new design is ready!');
    } catch (error) {
      console.error('Composite generation failed:', error);
      toast.error('Failed to generate composite image');
    }
  };

  // Handle undo/redo
  const handleUndo = () => {
    const previousImage = undo();
    if (previousImage) {
      setSceneImageUrl(previousImage);
    }
  };

  const handleRedo = () => {
    const nextImage = redo();
    if (nextImage) {
      setSceneImageUrl(nextImage);
    }
  };



  // Save current design
  const handleSaveDesign = () => {
    if (sceneImageUrl) {
      const link = document.createElement('a');
      link.href = sceneImageUrl;
      link.download = 'home-canvas-design.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Design saved!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <HomeCanvasHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-[700px]">
          {/* Product Box */}
          <div className="animate-fade-in-up">
          <ProductBox
            selectedProduct={selectedProduct}
            onChangeProduct={() => {
              console.log('Opening product catalog...');
              setShowProductCatalog(true);
            }}
            onProductDrop={handleProductDrop}
          />
          </div>

          {/* Scene Box */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <SceneBox
              sceneImageUrl={sceneImageUrl}
              onSceneUpload={handleSceneUpload}
              onSceneClick={handleSceneClick}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onGenerateComposite={handleGenerateComposite}
              isGenerating={compositeLoading}
              hasProduct={!!selectedProduct}
            />
          </div>
        </div>

        {/* Save Design Button */}
        {sceneImageUrl && (
          <div className="mt-12 text-center animate-fade-in">
            <button
              onClick={handleSaveDesign}
              className="px-12 py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              <span className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Your Design
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Step Guide */}
      <StepGuide currentStep={currentStep} />

      {/* Product Catalog Modal */}
      <ProductCatalogModal
        isOpen={showProductCatalog}
        onClose={() => setShowProductCatalog(false)}
        onSelectProduct={handleProductSelect}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <RoomProvider>
      <AppContent />
    </RoomProvider>
  );
}

export default App;
