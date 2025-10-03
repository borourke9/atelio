import React, { useCallback, useState } from 'react';
// import { Upload, Image as ImageIcon } from 'lucide-react';
import { useRoom } from '../context/RoomContext';
import { useLoading } from '../hooks/useLoading';

interface UploadAreaProps {
  onUpload: (file: File) => void;
}

export function UploadArea({ onUpload }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { state } = useRoom();
  const { loading } = useLoading();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onUpload(imageFile);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  }, [onUpload]);

  if (state.design.backgroundPhoto) {
    return (
      <div className="relative w-full h-full bg-white rounded-2xl overflow-hidden shadow-lg">
        <img
          src={state.design.backgroundPhoto}
          alt="Room background"
          className="w-full h-full object-contain"
        />
        <div className="absolute top-4 right-4">
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.addEventListener('change', handleFileSelect);
              input.click();
            }}
            className="backdrop-blur-md bg-white/80 hover:bg-white/90 px-4 py-2 rounded-full text-sm font-medium text-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Change room photo"
          >
            Change Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full border-2 border-dashed rounded-2xl transition-all duration-300 ${
        isDragOver
          ? 'border-blue-500 bg-blue-50/50 scale-105'
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="grid place-items-center text-center py-16">
        {loading.uploading ? (
          <div className="animate-pulse">
            <div className="mx-auto w-20 h-20 bg-sand-200 rounded-2xl mb-6"></div>
            <div className="h-8 bg-sand-200 rounded-lg mb-3"></div>
            <div className="h-4 bg-sand-200 rounded-lg mb-6"></div>
            <div className="h-12 bg-sand-200 rounded-2xl"></div>
          </div>
        ) : (
          <>
            <div className="h-14 w-14 rounded-2xl bg-sand-100 grid place-items-center shadow-inset mb-4">🖼️</div>
            <h3 className="font-display text-2xl text-stoneink">Upload Room Photo</h3>
            <p className="text-sand-700 mt-1 max-w-md">Upload a photo, then choose a replacement. Our AI will swap it automatically.</p>
            <button 
              className="btn-primary focus-ring mt-5" 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.addEventListener('change', handleFileSelect);
                input.click();
              }}
            >
              Choose Photo
            </button>
            <div className="text-xs text-sand-700 mt-2">Supports JPG, PNG</div>
          </>
        )}
      </div>
    </div>
  );
}
