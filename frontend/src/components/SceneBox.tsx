import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import toast from 'react-hot-toast';
import type { ReplaceRegion } from '../types';

interface SceneBoxProps {
  sceneImageUrl: string | null;
  onSceneUpload: (file: File) => void;
  onSceneClick: (region: ReplaceRegion) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onGenerateComposite: () => void;
  isGenerating: boolean;
  hasProduct: boolean;
}

export function SceneBox({
  sceneImageUrl,
  onSceneUpload,
  onSceneClick,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onGenerateComposite,
  isGenerating,
  hasProduct
}: SceneBoxProps) {
  const [clickMarker, setClickMarker] = useState<{ x: number; y: number } | null>(null);
  const [replaceRegion, setReplaceRegion] = useState<ReplaceRegion | null>(null);
  const [imageKey, setImageKey] = useState(0);
  const [isImageUpdating, setIsImageUpdating] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update image key when sceneImageUrl changes to force refresh
  useEffect(() => {
    if (sceneImageUrl) {
      setIsImageUpdating(true);
      setImageKey(prev => prev + 1);
      // Reset updating state after a brief delay
      setTimeout(() => setIsImageUpdating(false), 1000);
    }
  }, [sceneImageUrl]);

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate relative position within the image
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Set marker position for visual feedback
    setClickMarker({ x, y });
    
    // Calculate normalized coordinates (0-1 range)
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;
    
    // Create replace region with normalized coordinates
    const region: ReplaceRegion = {
      x: normalizedX,
      y: normalizedY
    };
    
    setReplaceRegion(region);
    onSceneClick(region);
  }, [onSceneClick]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSceneUpload(file);
      setClickMarker(null);
      setReplaceRegion(null);
    }
  }, [onSceneUpload]);

  const handleDrop = useCallback((file: File) => {
    try {
      onSceneUpload(file);
      setClickMarker(null);
      setReplaceRegion(null);
      toast.success(`Scene uploaded: ${file.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload scene image');
    }
  }, [onSceneUpload]);

  const { isDragOver, dragProps } = useDragAndDrop({
    onDrop: handleDrop,
    accept: ['image/png', 'image/jpeg'],
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div 
      className={`bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 h-full transition-all duration-500 relative overflow-hidden group ${
        isDragOver 
          ? 'border-blue-400 border-dashed bg-blue-50/80 shadow-3xl scale-105' 
          : 'hover:shadow-3xl hover:scale-105 hover:bg-white/80'
      }`}
      {...dragProps}
    >
      {/* Frosted Glass Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-6 left-6 w-28 h-28 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-6 right-6 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-2xl flex items-center justify-center z-20">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xl font-light text-blue-600 tracking-wide">Drop room photo here</p>
            <p className="text-sm text-blue-500 font-light tracking-wide">PNG or JPG files only</p>
          </div>
        </div>
      )}
      <div className="relative z-10 text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-light text-slate-800 mb-2 tracking-wide">Your Scene</h3>
        <p className="text-sm sm:text-base text-slate-600 font-light tracking-wide mb-4">Upload your room photo and click to place furniture</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 backdrop-blur-sm border border-white/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 backdrop-blur-sm border border-white/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {sceneImageUrl ? (
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div 
              ref={containerRef}
              className="relative max-w-full max-h-full group"
            >
                <img
                  ref={imageRef}
                  src={sceneImageUrl}
                  alt="Room scene"
                  className={`max-w-full max-h-full object-contain rounded-2xl border border-white/30 cursor-crosshair shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 select-none ${
                    isImageUpdating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                  }`}
                  onClick={handleImageClick}
                  key={imageKey} // Force re-render when image changes
                />
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              {/* Click instruction overlay */}
              {!clickMarker && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                    Click to place furniture
                  </div>
                </div>
              )}
              
              {/* Glowing placement marker */}
              {clickMarker && (
                <div
                  className="absolute w-10 h-10 bg-blue-400 bg-opacity-50 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-all duration-300 animate-pulse"
                  style={{
                    left: clickMarker.x,
                    top: clickMarker.y,
                  }}
                />
              )}
              
              {/* Generated indicator - show when image is not the original upload */}
              {sceneImageUrl && !sceneImageUrl.includes('data:image') && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-fade-in">
                  ✨ AI Generated
                </div>
              )}
              
              {/* Fallback indicator */}
              {sceneImageUrl && sceneImageUrl.includes('fallback=true') && (
                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-fade-in">
                  ⚠️ Fallback Mode
                </div>
              )}
              
              {/* Image updating indicator */}
              {isImageUpdating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm font-medium text-slate-700">Updating image...</p>
                  </div>
                </div>
              )}
              
              {/* Premium loading overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 mx-auto mb-6"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                    <p className="text-xl font-bold text-slate-800 mb-2">Working on your room...</p>
                    <p className="text-slate-600">AI is creating your perfect design</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center shadow-xl border border-white/50 group hover:scale-110 transition-transform duration-500">
                <svg className="w-14 h-14 text-slate-400 group-hover:text-slate-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-2xl font-light text-slate-800 mb-3 tracking-wide">Upload Your Room</h4>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto leading-relaxed font-light tracking-wide">
                Choose a clear photo of your room to get started with AI-powered furniture placement
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-8 font-light tracking-wide">
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <span>Click the button below or drag & drop an image</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              </div>
              <label className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-light rounded-full shadow-xl hover:shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 tracking-wide">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Choose Scene Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
        
        
        {/* Generate button */}
        {sceneImageUrl && replaceRegion && hasProduct && (
          <div className="relative z-10 mt-8 pt-8 border-t border-white/20">
            <button
              onClick={onGenerateComposite}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-light py-5 px-8 rounded-full transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 tracking-wide"
            >
              <span className="flex items-center justify-center gap-3">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Creating Your Room...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    ✨ Create My Room
                  </>
                )}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
