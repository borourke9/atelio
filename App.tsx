/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateCompositeImage } from './services/geminiService';
import { Product, SavedDesign } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ObjectCard from './components/ObjectCard';
import Spinner from './components/Spinner';
import DebugModal from './components/DebugModal';
import TouchGhost from './components/TouchGhost';
import SavedDesigns from './components/SavedDesigns';
import UndoRedoControls from './components/UndoRedoControls';

// Pre-load a transparent image to use for hiding the default drag ghost.
// This prevents a race condition on the first drag.
const transparentDragImage = new Image();
transparentDragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Helper to convert a data URL string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

// Helper to convert File to a data URL string
const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const loadingMessages = [
    "Analyzing your product...",
    "Surveying the scene...",
    "Describing placement location with AI...",
    "Crafting the perfect composition prompt...",
    "Generating photorealistic options...",
    "Assembling the final scene..."
];


const App: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [persistedOrbPosition, setPersistedOrbPosition] = useState<{x: number, y: number} | null>(null);
  const [debugImageUrl, setDebugImageUrl] = useState<string | null>(null);
  const [debugPrompt, setDebugPrompt] = useState<string | null>(null);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [sceneScaleMode, setSceneScaleMode] = useState<'contain' | 'cover'>('contain');

  // State for undo/redo history
  const [history, setHistory] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const sceneImage = history[currentIndex] || null;

  // State for touch drag & drop
  const [isTouchDragging, setIsTouchDragging] = useState<boolean>(false);
  const [touchGhostPosition, setTouchGhostPosition] = useState<{x: number, y: number} | null>(null);
  const [isHoveringDropZone, setIsHoveringDropZone] = useState<boolean>(false);
  const [touchOrbPosition, setTouchOrbPosition] = useState<{x: number, y: number} | null>(null);
  const sceneImgRef = useRef<HTMLImageElement>(null);
  
  const sceneImageUrl = sceneImage ? URL.createObjectURL(sceneImage) : null;
  const productImageUrl = selectedProduct ? selectedProduct.imageUrl : null;
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  useEffect(() => {
    try {
        const storedDesigns = localStorage.getItem('homeCanvasDesigns');
        if (storedDesigns) {
            setSavedDesigns(JSON.parse(storedDesigns));
        }
    } catch (error) {
        console.error("Failed to load designs from localStorage", error);
    }
  }, []);

  const updateSceneHistory = useCallback((file: File) => {
      // Branch from the current history point, discarding any "redo" states
      const newHistory = history.slice(0, currentIndex + 1);
      setHistory([...newHistory, file]);
      setCurrentIndex(newHistory.length);
      
      // Reset state related to the previous scene
      setDebugImageUrl(null);
      setDebugPrompt(null);
      setPersistedOrbPosition(null);
  }, [history, currentIndex]);

  const handleProductImageUpload = useCallback((file: File) => {
    // useEffect will handle cleaning up the previous blob URL
    setError(null);
    try {
        const imageUrl = URL.createObjectURL(file);
        const product: Product = {
            id: Date.now(),
            name: file.name,
            imageUrl: imageUrl,
        };
        setProductImageFile(file);
        setSelectedProduct(product);
    } catch(err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Could not load the product image. Details: ${errorMessage}`);
      console.error(err);
    }
  }, []);

  const handleInstantStart = useCallback(async () => {
    setError(null);
    try {
      // Fetch the default images
      const [objectResponse, sceneResponse] = await Promise.all([
        fetch('/assets/object.jpeg'),
        fetch('/assets/scene.jpeg')
      ]);

      if (!objectResponse.ok || !sceneResponse.ok) {
        throw new Error('Failed to load default images');
      }

      // Convert to blobs then to File objects
      const [objectBlob, sceneBlob] = await Promise.all([
        objectResponse.blob(),
        sceneResponse.blob()
      ]);

      const objectFile = new File([objectBlob], 'object.jpeg', { type: 'image/jpeg' });
      const sceneFile = new File([sceneBlob], 'scene.jpeg', { type: 'image/jpeg' });

      // Update state with the new files
      updateSceneHistory(sceneFile);
      handleProductImageUpload(objectFile);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Could not load default images. Details: ${errorMessage}`);
      console.error(err);
    }
  }, [handleProductImageUpload, updateSceneHistory]);

  const handleProductDrop = useCallback(async (position: {x: number, y: number}, relativePosition: { xPercent: number; yPercent: number; }) => {
    if (!productImageFile || !sceneImage || !selectedProduct) {
      setError('An unexpected error occurred. Please try again.');
      return;
    }
    setPersistedOrbPosition(position);
    setIsLoading(true);
    setError(null);
    try {
      const { finalImageUrl, debugImageUrl, finalPrompt } = await generateCompositeImage(
        productImageFile, 
        selectedProduct.name,
        sceneImage,
        sceneImage.name,
        relativePosition
      );
      setDebugImageUrl(debugImageUrl);
      setDebugPrompt(finalPrompt);
      const newSceneFile = dataURLtoFile(finalImageUrl, `generated-scene-${Date.now()}.jpeg`);
      updateSceneHistory(newSceneFile);

    } catch (err)
 {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate the image. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
      setPersistedOrbPosition(null);
    }
  }, [productImageFile, sceneImage, selectedProduct, updateSceneHistory]);


  const handleReset = useCallback(() => {
    // Let useEffect handle URL revocation
    setSelectedProduct(null);
    setProductImageFile(null);
    setHistory([]);
    setCurrentIndex(-1);
    setError(null);
    setIsLoading(false);
    setPersistedOrbPosition(null);
    setDebugImageUrl(null);
    setDebugPrompt(null);
    setSceneScaleMode('contain');
  }, []);

  const handleChangeProduct = useCallback(() => {
    // Let useEffect handle URL revocation
    setSelectedProduct(null);
    setProductImageFile(null);
    setPersistedOrbPosition(null);
    setDebugImageUrl(null);
    setDebugPrompt(null);
  }, []);
  
  const handleChangeScene = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    setPersistedOrbPosition(null);
    setDebugImageUrl(null);
    setDebugPrompt(null);
    setSceneScaleMode('contain');
  }, []);

  const handleSaveDesign = async () => {
    if (!productImageFile || !sceneImage || !selectedProduct) return;
    
    try {
        const [productImageDataUrl, sceneImageDataUrl] = await Promise.all([
            fileToDataUrl(productImageFile),
            fileToDataUrl(sceneImage),
        ]);

        const newDesign: SavedDesign = {
            id: Date.now(),
            productImage: productImageDataUrl,
            productName: selectedProduct.name,
            sceneImage: sceneImageDataUrl,
            createdAt: new Date().toISOString(),
        };
        
        // Sort by newest first when adding
        const updatedDesigns = [newDesign, ...savedDesigns];
        setSavedDesigns(updatedDesigns);
        localStorage.setItem('homeCanvasDesigns', JSON.stringify(updatedDesigns));
        setSaveSuccessMessage("Design saved successfully!");
        setTimeout(() => setSaveSuccessMessage(null), 3000);

    } catch (error) {
        console.error("Failed to save design:", error);
        setError("Could not save the design. Please try again.");
    }
  };

  const handleLoadDesign = (id: number) => {
      const design = savedDesigns.find(d => d.id === id);
      if (!design) return;

      try {
          const productFile = dataURLtoFile(design.productImage, design.productName);
          const sceneFile = dataURLtoFile(design.sceneImage, `scene-${design.id}.jpeg`);

          // Start a fresh history with the loaded design
          setHistory([sceneFile]);
          setCurrentIndex(0);

          handleProductImageUpload(productFile);

          setError(null);
          setPersistedOrbPosition(null);
          setDebugImageUrl(null);
          setDebugPrompt(null);

      } catch (error) {
          console.error("Failed to load design:", error);
          setError("Could not load the design. Please check the data and try again.");
      }
  };

  const handleDeleteDesign = (id: number) => {
      const updatedDesigns = savedDesigns.filter(d => d.id !== id);
      setSavedDesigns(updatedDesigns);
      localStorage.setItem('homeCanvasDesigns', JSON.stringify(updatedDesigns));
  };

  const handleUndo = useCallback(() => {
    if (canUndo) {
        setCurrentIndex(currentIndex - 1);
    }
  }, [canUndo, currentIndex]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
        setCurrentIndex(currentIndex + 1);
    }
  }, [canRedo, currentIndex]);


  useEffect(() => {
    // Clean up the scene's object URL when the component unmounts or the URL changes
    return () => {
        if (sceneImageUrl) URL.revokeObjectURL(sceneImageUrl);
    };
  }, [sceneImageUrl]);
  
  useEffect(() => {
    // Clean up the product's object URL when the component unmounts or the URL changes
    return () => {
        if (productImageUrl && productImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(productImageUrl);
        }
    };
  }, [productImageUrl]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
        setLoadingMessageIndex(0); // Reset on start
        interval = setInterval(() => {
            setLoadingMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 3000);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!selectedProduct) return;
    // Prevent page scroll
    e.preventDefault();
    setIsTouchDragging(true);
    const touch = e.touches[0];
    setTouchGhostPosition({ x: touch.clientX, y: touch.clientY });
  };

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isTouchDragging) return;
      const touch = e.touches[0];
      setTouchGhostPosition({ x: touch.clientX, y: touch.clientY });
      
      const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropZone = elementUnderTouch?.closest<HTMLDivElement>('[data-dropzone-id="scene-uploader"]');

      if (dropZone) {
          const rect = dropZone.getBoundingClientRect();
          setTouchOrbPosition({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
          setIsHoveringDropZone(true);
      } else {
          setIsHoveringDropZone(false);
          setTouchOrbPosition(null);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTouchDragging) return;
      
      const touch = e.changedTouches[0];
      const elementUnderTouch = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropZone = elementUnderTouch?.closest<HTMLDivElement>('[data-dropzone-id="scene-uploader"]');

      if (dropZone && sceneImgRef.current) {
          const img = sceneImgRef.current;
          const containerRect = dropZone.getBoundingClientRect();
          const { naturalWidth, naturalHeight } = img;
          const { width: containerWidth, height: containerHeight } = containerRect;

          const imageAspectRatio = naturalWidth / naturalHeight;
          const containerAspectRatio = containerWidth / containerHeight;

          let renderedWidth, renderedHeight;
          if (sceneScaleMode === 'cover') {
              if (imageAspectRatio > containerAspectRatio) {
                  renderedHeight = containerHeight;
                  renderedWidth = containerHeight * imageAspectRatio;
              } else {
                  renderedWidth = containerWidth;
                  renderedHeight = containerWidth / imageAspectRatio;
              }
          } else { // 'contain'
              if (imageAspectRatio > containerAspectRatio) {
                  renderedWidth = containerWidth;
                  renderedHeight = containerWidth / imageAspectRatio;
              } else {
                  renderedHeight = containerHeight;
                  renderedWidth = containerHeight * imageAspectRatio;
              }
          }
          
          const offsetX = (containerWidth - renderedWidth) / 2;
          const offsetY = (containerHeight - renderedHeight) / 2;

          const dropX = touch.clientX - containerRect.left;
          const dropY = touch.clientY - containerRect.top;

          const imageX = dropX - offsetX;
          const imageY = dropY - offsetY;
          
          if (!(imageX < 0 || imageX > renderedWidth || imageY < 0 || imageY > renderedHeight)) {
            const xPercent = (imageX / renderedWidth) * 100;
            const yPercent = (imageY / renderedHeight) * 100;
            
            handleProductDrop({ x: dropX, y: dropY }, { xPercent, yPercent });
          }
      }

      setIsTouchDragging(false);
      setTouchGhostPosition(null);
      setIsHoveringDropZone(false);
      setTouchOrbPosition(null);
    };

    if (isTouchDragging) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTouchDragging, handleProductDrop, sceneScaleMode]);

  const renderContent = () => {
    if (error) {
       return (
           <div className="text-center animate-fade-in bg-red-50 border border-red-200 p-8 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-4 text-red-800">An Error Occurred</h2>
            <p className="text-lg text-red-700 mb-6">{error}</p>
            <button
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Try Again
            </button>
          </div>
        );
    }
    
    if (!productImageFile || !sceneImage) {
      return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in flex flex-col gap-12">
          {savedDesigns.length > 0 && (
            <SavedDesigns
              designs={savedDesigns}
              onLoad={handleLoadDesign}
              onDelete={handleDeleteDesign}
            />
          )}

          <div>
             {savedDesigns.length > 0 && (
                <div className="relative text-center mb-10">
                    <hr className="border-zinc-200" />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-zinc-500 uppercase">Or Start New</span>
                </div>
              )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col">
                <h2 className="text-2xl font-extrabold text-center mb-5 text-zinc-800">Upload Product</h2>
                <ImageUploader 
                  id="product-uploader"
                  onFileSelect={handleProductImageUpload}
                  imageUrl={productImageUrl}
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-extrabold text-center mb-5 text-zinc-800">Upload Scene</h2>
                <ImageUploader 
                  id="scene-uploader"
                  onFileSelect={updateSceneHistory}
                  imageUrl={sceneImageUrl}
                />
              </div>
            </div>
            <div className="text-center mt-10 min-h-[4rem] flex flex-col justify-center items-center">
              <p className="text-zinc-500 animate-fade-in">
                Upload a product image and a scene image to begin.
              </p>
              <p className="text-zinc-500 animate-fade-in mt-2">
                Or click{' '}
                <button
                  onClick={handleInstantStart}
                  className="font-bold text-blue-600 hover:text-blue-800 underline transition-colors"
                >
                  here
                </button>
                {' '}for an instant start.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-7xl mx-auto animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Product Column */}
          <div className="md:col-span-1 flex flex-col">
            <h2 className="text-2xl font-extrabold text-center mb-5 text-zinc-800">Product</h2>
            <div className="flex-grow flex items-center justify-center">
              <div 
                  draggable="true" 
                  onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setDragImage(transparentDragImage, 0, 0);
                  }}
                  onTouchStart={handleTouchStart}
                  className="cursor-move w-full max-w-xs"
              >
                  <ObjectCard product={selectedProduct!} isSelected={true} />
              </div>
            </div>
            <div className="text-center mt-4">
               <div className="h-5 flex items-center justify-center">
                <button
                    onClick={handleChangeProduct}
                    className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                    Change Product
                </button>
               </div>
            </div>
          </div>
          {/* Scene Column */}
          <div className="md:col-span-2 flex flex-col">
            <h2 className="text-2xl font-extrabold text-center mb-5 text-zinc-800">Scene</h2>
            <div className="flex-grow flex items-center justify-center">
              <ImageUploader 
                  ref={sceneImgRef}
                  id="scene-uploader" 
                  onFileSelect={updateSceneHistory}
                  imageUrl={sceneImageUrl}
                  isDropZone={!!sceneImage && !isLoading}
                  onProductDrop={handleProductDrop}
                  persistedOrbPosition={persistedOrbPosition}
                  showDebugButton={!!debugImageUrl && !isLoading}
                  onDebugClick={() => setIsDebugModalOpen(true)}
                  isTouchHovering={isHoveringDropZone}
                  touchOrbPosition={touchOrbPosition}
                  scaleMode={sceneScaleMode}
                  onScaleModeChange={setSceneScaleMode}
              />
            </div>
            <div className="text-center mt-4">
              <div className="h-10 flex items-center justify-center gap-4">
                {(canUndo || canRedo) && !isLoading && (
                    <UndoRedoControls
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                    />
                )}
                {sceneImage && !isLoading && (
                  <button
                      onClick={handleChangeScene}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                  >
                      Change Scene
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-10 min-h-[8rem] flex flex-col justify-center items-center">
           {isLoading ? (
             <div className="animate-fade-in">
                <Spinner />
                <p className="text-xl mt-4 text-zinc-600 transition-opacity duration-500">{loadingMessages[loadingMessageIndex]}</p>
             </div>
           ) : (
            <div className="animate-fade-in flex flex-col items-center gap-4">
                <p className="text-zinc-500">
                    Drag the product onto a location in the scene, or simply click where you want it.
                </p>
                {saveSuccessMessage ? (
                    <p className="text-green-600 font-semibold h-10 flex items-center">{saveSuccessMessage}</p>
                ) : (
                    <button
                        onClick={handleSaveDesign}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-md transition-colors shadow-sm h-10"
                    >
                        Save Current Design
                    </button>
                )}
            </div>
           )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-white text-zinc-800 flex items-center justify-center p-4 md:p-8">
      <TouchGhost 
        imageUrl={isTouchDragging ? productImageUrl : null} 
        position={touchGhostPosition}
      />
      <div className="flex flex-col items-center gap-8 w-full">
        <Header />
        <main className="w-full">
          {renderContent()}
        </main>
      </div>
      <DebugModal 
        isOpen={isDebugModalOpen} 
        onClose={() => setIsDebugModalOpen(false)}
        imageUrl={debugImageUrl}
        prompt={debugPrompt}
      />
    </div>
  );
};

export default App;