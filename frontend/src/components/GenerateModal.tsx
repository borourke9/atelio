import { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import type { CatalogItem } from '../types';

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: CatalogItem | null;
  onComplete: () => void;
  hasBackgroundPhoto?: boolean;
}

interface GenerationStep {
  id: number;
  label: string;
  duration: number;
}

const getSteps = (hasBackgroundPhoto: boolean): GenerationStep[] => {
  if (hasBackgroundPhoto) {
    return [
      { id: 1, label: 'Analyzing room…', duration: 800 },
      { id: 2, label: 'Removing old furniture…', duration: 1000 },
      { id: 3, label: 'Placing new furniture…', duration: 800 },
    ];
  } else {
    return [
      { id: 1, label: 'Creating room layout…', duration: 800 },
      { id: 2, label: 'Setting up lighting…', duration: 1000 },
      { id: 3, label: 'Adding furniture…', duration: 800 },
    ];
  }
};

export function GenerateModal({ isOpen, onClose, selectedItem, onComplete, hasBackgroundPhoto = false }: GenerateModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isOpen && selectedItem) {
      startGeneration();
    }
  }, [isOpen, selectedItem]);

  const startGeneration = async () => {
    setIsGenerating(true);
    setIsComplete(false);
    setCurrentStep(0);

    const steps = getSteps(hasBackgroundPhoto);

    // Simulate the generation process
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
    }

    // Complete the generation
    setIsGenerating(false);
    setIsComplete(true);
    
    // Call onComplete after a brief delay
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleClose = () => {
    if (!isGenerating) {
      setIsComplete(false);
      setCurrentStep(0);
      onClose();
    }
  };

  const steps = getSteps(hasBackgroundPhoto);
  const progress = isComplete ? 100 : ((currentStep + 1) / steps.length) * 100;

  if (!isOpen || !selectedItem) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isComplete ? 'Generation Complete!' : (hasBackgroundPhoto ? 'Replacing Furniture' : 'Generating New Room')}
          </h2>
          {!isGenerating && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Selected Item Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png';
                }}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedItem.name}</p>
              <p className="text-sm text-gray-500 capitalize">{selectedItem.category}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {steps.map((step, index) => {
            const isActive = index === currentStep && isGenerating;
            const isCompleted = index < currentStep || isComplete;
            // const isPending = index > currentStep && !isComplete;

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 border border-blue-200'
                    : isCompleted
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-medium">{step.id}</span>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive
                      ? 'text-blue-900'
                      : isCompleted
                      ? 'text-green-900'
                      : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {isComplete ? (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              View New Room
            </button>
          ) : (
            <button
              onClick={handleClose}
              disabled={isGenerating}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
