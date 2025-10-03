import { useState } from 'react';
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
import type { CatalogItem, ReplaceRegion } from './types';

function AppContent() {
  const { } = useRoom();
  const { generateComposite, loading: compositeLoading } = useComposite();
  const { addToHistory, undo, redo, canUndo, canRedo } = useHistory();
  
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
      category: 'sofa',
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 min-h-[500px] lg:h-[700px]">
          {/* Product Box */}
          <div className="animate-fade-in-up order-1 lg:order-1">
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
          <div className="animate-fade-in-up order-2 lg:order-2" style={{ animationDelay: '0.1s' }}>
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
          <div className="mt-8 sm:mt-12 text-center animate-fade-in px-4">
            <button
              onClick={handleSaveDesign}
              className="px-6 sm:px-12 py-3 sm:py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold text-base sm:text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span className="hidden sm:inline">Save Your Design</span>
                <span className="sm:hidden">Save Design</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Step Guide */}
      <StepGuide currentStep={currentStep} />

      {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-light tracking-wide mb-2">ATELIO.AI</h3>
                <p className="text-slate-400 font-light">AI-Powered Interior Design</p>
              </div>
              
              {/* Custom Branding & Product Catalog Section */}
              <div className="mb-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <h4 className="text-xl font-light tracking-wide mb-4 text-slate-200">
                  Custom Solutions for Your Business
                </h4>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3">
                    <h5 className="text-lg font-light text-slate-300 mb-2">🎨 Custom Branding</h5>
                    <p className="text-slate-400 text-sm font-light leading-relaxed">
                      Transform ATELIO.AI to match your brand identity. We can customize colors, logos, 
                      typography, and overall design to create a seamless experience that represents 
                      your business perfectly.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h5 className="text-lg font-light text-slate-300 mb-2">🪑 Custom Product Catalog</h5>
                    <p className="text-slate-400 text-sm font-light leading-relaxed">
                      Integrate your complete furniture inventory. Upload your product images, 
                      specifications, and pricing to create a personalized catalog that showcases 
                      exactly what you offer to your customers.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-slate-300 text-sm font-light">
                    Ready to make ATELIO.AI your own? 
                    <span className="text-blue-400 ml-1">Contact us for custom implementation</span>
                  </p>
                </div>
              </div>
              
              <div className="border-t border-slate-800 pt-8">
                <p className="text-slate-500 text-sm font-light tracking-wide">
                  © 2025 NEXGEN Technologies. All rights reserved.
                </p>
                <p className="text-slate-600 text-xs mt-2 font-light">
                  This software and its contents are proprietary and confidential. 
                  Unauthorized reproduction, distribution, or modification is strictly prohibited.
                </p>
                <div className="mt-4 flex justify-center space-x-6 text-xs text-slate-500">
                  <span>Privacy Policy</span>
                  <span>•</span>
                  <span>Terms of Service</span>
                  <span>•</span>
                  <span>Legal Rights Reserved</span>
                </div>
              </div>
            </div>
          </div>
        </footer>

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
