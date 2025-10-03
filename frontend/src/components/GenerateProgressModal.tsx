import { CheckCircle, Loader2 } from 'lucide-react';
import type { CatalogItem } from '../types';

interface GenerateProgressModalProps {
  open: boolean;
  onClose: () => void;
  item: CatalogItem | null;
  progress: number;
  step: "analyze" | "remove" | "place";
}

const steps = [
  { id: "analyze" as const, label: "Preparing", description: "Getting your room ready" },
  { id: "remove" as const, label: "Adding furniture", description: "Placing your selected sofa in the room" },
  { id: "place" as const, label: "Complete", description: "Your sofa is ready to customize" }
];

export function GenerateProgressModal({ open, onClose, item, progress, step }: GenerateProgressModalProps) {
  if (!open || !item) return null;

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const isComplete = progress >= 100;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isComplete ? 'Generation Complete!' : 'Generating Room'}
          </h2>
          {isComplete && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>

        {/* Selected Item Preview */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
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

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {steps.map((stepItem, index) => {
            const isActive = index === currentStepIndex && !isComplete;
            const isCompleted = index < currentStepIndex || isComplete;
            // const isPending = index > currentStepIndex && !isComplete;

            return (
              <div
                key={stepItem.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-green-50 border border-green-200'
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
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <span
                    className={`text-sm font-medium ${
                      isActive
                        ? 'text-green-900'
                        : isCompleted
                        ? 'text-green-900'
                        : 'text-gray-600'
                    }`}
                  >
                    {stepItem.label}
                  </span>
                  {stepItem.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stepItem.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          {isComplete ? (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              View Result
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled
              className="px-6 py-2 bg-gray-100 text-gray-400 font-medium rounded-lg cursor-not-allowed"
            >
              Generating...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
