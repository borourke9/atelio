import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
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
      <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
        <div className="text-center max-w-md">
          {loading.uploading ? (
            <div className="animate-pulse">
              <div className="mx-auto w-20 h-20 bg-gray-200 rounded-2xl mb-6"></div>
              <div className="h-8 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-12 bg-gray-200 rounded-2xl"></div>
            </div>
          ) : (
            <>
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <ImageIcon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Upload Room Photo
              </h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Drag and drop your room photo here, or click to browse
              </p>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.addEventListener('change', handleFileSelect);
                  input.click();
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Choose room photo"
              >
                <Upload className="w-5 h-5" />
                Choose Photo
              </button>
              <p className="text-sm text-gray-500 mt-4 font-medium">
                Supports JPG, PNG, and other image formats
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
