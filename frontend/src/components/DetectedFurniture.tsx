import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { confidenceLabel, classNames } from '../utils/ui';
import { useRoom } from '../context/RoomContext';
import toast from 'react-hot-toast';
import type { DetectionResult, CatalogItem } from '../types';

interface DetectedFurnitureProps {
  detections: DetectionResult[];
  catalog: CatalogItem[];
}

export function DetectedFurniture({ detections, catalog }: DetectedFurnitureProps) {
  const { state, dispatch } = useRoom();
  const [isOpen, setIsOpen] = useState(true);

  // Find the best detection (highest confidence >= 0.90)
  const bestDetection = detections
    .filter(d => d.confidence >= 0.90)
    .sort((a, b) => b.confidence - a.confidence)[0];

  // Filter catalog items for the detected category
  const relevantItems = bestDetection 
    ? catalog.filter(item => item.category === bestDetection.category)
    : [];

  const handleFurnitureSelect = useCallback(async (item: CatalogItem) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading(`Replacing ${item.category}...`);

      // Call swap API
      const swapRequest = {
        photo: state.design.backgroundPhoto,
        category: item.category,
        replacementImage: item.imageUrl,
      };

      try {
        const response = await fetch('http://localhost:3001/swap-furniture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(swapRequest),
        });
        
        const data = await response.json();
        
          if (data.success && data.updatedPhoto) {
            // Update the background photo with the swapped result
            dispatch({ type: 'SET_BACKGROUND_PHOTO', payload: data.updatedPhoto });
            toast.success(`Swap complete - We replaced your ${item.category}. You can fine-tune the position if you'd like.`, { id: loadingToast });
        } else {
          throw new Error(data.error || 'Swap failed');
        }
      } catch (apiError) {
        console.error('Swap API error:', apiError);
        // Fallback: just add the furniture to the canvas
        const newFurniture = {
          id: `${item.id}-${Date.now()}`,
          position: { x: 400, y: 300 },
          scale: 0.5,
          rotation: 0,
          imageUrl: item.imageUrl,
          category: item.category,
        };
          dispatch({ type: 'ADD_FURNITURE', payload: newFurniture });
          toast.success(`Swap complete - We replaced your ${item.category}. You can fine-tune the position if you'd like.`, { id: loadingToast });
      }
    } catch (error) {
      console.error('Failed to place furniture:', error);
      toast.error('Failed to place furniture');
    }
  }, [state.design.backgroundPhoto, dispatch]);

  if (detections.length === 0) {
    return null;
  }

  if (!bestDetection) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            ⚠️
          </span>
          <p className="text-sm text-amber-800">
            We couldn't confidently detect furniture. Try another photo.
          </p>
        </div>
      </div>
    );
  }

  const confidence = confidenceLabel(bestDetection.confidence);

  return (
    <div className="bg-white border border-gray-200/70 rounded-2xl shadow-sm">
      <header className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
            ✓
          </span>
          <div>
            <h3 className="font-semibold text-gray-800">
              {isOpen ? `We detected a ${bestDetection.category} in your room.` : `✅ Detected ${bestDetection.category}. Pick a replacement to auto-swap.`}
            </h3>
            <p className="text-sm text-gray-500">
              {isOpen ? 'Choose a replacement from the catalog — the swap happens automatically.' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
          aria-label={isOpen ? 'Hide detected furniture' : 'Show detected furniture'}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </header>

      <div className={classNames(
        isOpen ? "p-4 space-y-4 transition-all duration-200" : "hidden"
      )}>
        {/* Detection Card */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 capitalize">{bestDetection.category}</p>
              <p className="text-sm text-gray-600">Confidence: {Math.round(bestDetection.confidence * 100)}%</p>
            </div>
            <span className={classNames(
              "px-2 py-1 rounded-full text-xs font-medium",
              confidence.className
            )}>
              {confidence.label}
            </span>
          </div>
        </div>

        {/* Replacement Options */}
        {relevantItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Replacement Options</h4>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {relevantItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleFurnitureSelect(item)}
                  className="flex-shrink-0 bg-white border border-gray-200 rounded-xl p-3 hover:shadow-md hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Replace with ${item.name}`}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/placeholder.png";
                      }}
                    />
                  </div>
                  <p className="text-xs font-medium text-gray-900 text-center">{item.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
