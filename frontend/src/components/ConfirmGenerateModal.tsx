import { X } from 'lucide-react';
import type { CatalogItem } from '../types';

interface ConfirmGenerateModalProps {
  open: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  onConfirm: () => void;
}

export function ConfirmGenerateModal({ open, onClose, item, onConfirm }: ConfirmGenerateModalProps) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Generate Photo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Item Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png';
                }}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500 capitalize">{item.category}</p>
            </div>
          </div>
        </div>

        {/* Confirmation Text */}
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Generate photo using <span className="font-semibold">{item.name}</span>?
          </p>
          <p className="text-sm text-gray-600">
            We'll auto-detect and replace the existing {item.category}. No manual selection needed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
