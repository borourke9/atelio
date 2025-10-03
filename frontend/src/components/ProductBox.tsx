import { useState } from 'react';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import toast from 'react-hot-toast';
import type { CatalogItem } from '../types';

interface ProductBoxProps {
  selectedProduct: CatalogItem | null;
  onChangeProduct: () => void;
  onProductDrop?: (file: File) => void;
}

export function ProductBox({ selectedProduct, onChangeProduct, onProductDrop }: ProductBoxProps) {
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDrop = (file: File) => {
    try {
      setDroppedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onProductDrop?.(file);
      toast.success(`Product image uploaded: ${file.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload product image');
    }
  };

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
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-2xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-blue-600">Drop product here</p>
            <p className="text-sm text-blue-500">PNG or JPG files only</p>
          </div>
        </div>
      )}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">Product</h3>
          <p className="text-sm text-slate-600 font-medium">Choose your furniture piece</p>
        </div>
        <button
          onClick={onChangeProduct}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Browse Catalog
        </button>
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {selectedProduct || previewUrl ? (
          <>
            <div className="relative w-full max-w-sm mb-8 group">
              <div className="aspect-[4/3] bg-gradient-to-br from-white/50 to-white/30 rounded-2xl overflow-hidden shadow-2xl border border-white/30 backdrop-blur-sm">
                <img
                  src={previewUrl || selectedProduct?.imageUrl}
                  alt={droppedFile?.name || selectedProduct?.name}
                  className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-800 mb-3 text-xl">
                {droppedFile?.name || selectedProduct?.name}
              </h4>
              {selectedProduct?.dimensions && (
                <p className="text-sm text-slate-600 mb-2 font-medium">{selectedProduct.dimensions}</p>
              )}
              {droppedFile && (
                <p className="text-sm text-slate-600 mb-3 font-medium">
                  {(droppedFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              )}
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-semibold rounded-full capitalize border border-blue-200">
                {selectedProduct?.category || 'uploaded'}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-600">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center shadow-xl border border-white/50">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h4 className="text-xl font-semibold text-slate-700 mb-3">No Product Selected</h4>
            <p className="text-slate-500 mb-4 max-w-xs mx-auto leading-relaxed">
              Choose from our catalog or drag & drop your own furniture image
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span>PNG or JPG files only</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
