import { useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { RoomProvider, useRoom } from './context/RoomContext';
import { Toolbar } from './components/Toolbar';
import { UploadArea } from './components/UploadArea';
import { CanvasEditor } from './components/CanvasEditor';
import { CatalogSidebar } from './components/CatalogSidebar';
import { FooterSteps } from './components/FooterSteps';
import { GenerateModal } from './components/GenerateModal';
import { useLoading } from './hooks/useLoading';
import toast from 'react-hot-toast';
import type { PlacedFurniture } from './types';

function AppContent() {
  const { state, dispatch, saveDesign } = useRoom();
  const { setLoading } = useLoading();
  const canvasRef = useRef<{ addFurnitureToCanvas: (furniture: PlacedFurniture) => void; addOverlayFromUrl: (url: string, opts?: { x?: number; y?: number; scale?: number; rotation?: number }) => void }>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Check for saved session on load
  useEffect(() => {
    const savedSession = localStorage.getItem('furniture-swap.session:v1');
    if (savedSession && !state.design.backgroundPhoto) {
      setShowRestoreBanner(true);
    }
  }, [state.design.backgroundPhoto]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setLoading('uploading', true);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        dispatch({ type: 'SET_BACKGROUND_PHOTO', payload: result });
        toast.success('Room photo uploaded successfully!');
        setLoading('uploading', false);
        dispatch({ type: 'SET_LOADING', payload: false });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to upload image' });
      toast.error('Failed to upload image');
      setLoading('uploading', false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };


  // Handle furniture updates from canvas
  const handleFurnitureUpdate = (furniture: PlacedFurniture) => {
    dispatch({ type: 'UPDATE_FURNITURE', payload: { id: furniture.id, updates: furniture } });
  };

  // Handle save design
  useEffect(() => {
    const handleSaveDesign = () => {
      saveDesign();
    };

    window.addEventListener('saveDesign', handleSaveDesign);
    return () => window.removeEventListener('saveDesign', handleSaveDesign);
  }, [saveDesign]);


  const handleRestoreSession = () => {
    const savedSession = localStorage.getItem('furniture-swap.session:v1');
    if (savedSession) {
      try {
        const design = JSON.parse(savedSession);
        dispatch({ type: 'SET_BACKGROUND_PHOTO', payload: design.backgroundPhoto });
        dispatch({ type: 'ADD_FURNITURE', payload: design.placedFurniture });
        setShowRestoreBanner(false);
        toast.success('Session restored!');
      } catch (error) {
        console.error('Failed to restore session:', error);
        toast.error('Failed to restore session');
      }
    }
  };

  const handleGeneratePhoto = () => {
    if (state.selectedItem) {
      setIsGenerateModalOpen(true);
    }
  };

  const handleGenerationComplete = () => {
    if (state.selectedItem) {
      if (state.design.backgroundPhoto && canvasRef.current) {
        // If there's a background photo, add furniture as overlay
        canvasRef.current.addOverlayFromUrl(state.selectedItem.imageUrl, { scale: 0.6 });
        toast.success(`Added ${state.selectedItem.name} to your room!`);
      } else {
        // If no background photo, set the furniture as the background
        dispatch({ type: 'SET_BACKGROUND_PHOTO', payload: state.selectedItem.imageUrl });
        toast.success(`Generated new room with ${state.selectedItem.name}!`);
      }
    }
    setIsGenerateModalOpen(false);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Restore Session Banner */}
      {showRestoreBanner && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-blue-800">
              Restore your last design?
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRestoreSession}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Restore
              </button>
              <button
                onClick={() => setShowRestoreBanner(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar 
        onToggleCatalog={() => setIsCatalogOpen(!isCatalogOpen)}
        onGeneratePhoto={handleGeneratePhoto}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${isCatalogOpen ? 'block' : 'hidden'} md:block`}>
          <CatalogSidebar />
        </div>

          {/* Canvas Area */}
          <div className="flex-1 p-8">
            <div className="h-full">
              {/* Canvas */}
              {state.design.backgroundPhoto ? (
                <CanvasEditor
                  ref={canvasRef}
                  onObjectModified={handleFurnitureUpdate}
                />
              ) : (
                <UploadArea onUpload={handleFileUpload} />
              )}
            </div>
          </div>
      </div>

      {/* Footer Steps */}
      <FooterSteps />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 flex items-center space-x-4 shadow-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-gray-900 font-semibold">
                {state.currentStep === 2 ? 'Detecting furniture...' : 'Processing...'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Please wait a moment</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="fixed top-6 right-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg z-50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-medium">{state.error}</span>
            <button
              onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
              className="text-red-500 hover:text-red-700 ml-2 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        selectedItem={state.selectedItem}
        onComplete={handleGenerationComplete}
        hasBackgroundPhoto={!!state.design.backgroundPhoto}
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
