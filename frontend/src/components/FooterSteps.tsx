import { } from 'react';
import { Upload, Search, MousePointer, CheckCircle } from 'lucide-react';
import { useRoom } from '../context/RoomContext';

const steps = [
  {
    id: 1,
    title: 'Upload Room Photo',
    description: 'Start with a clear photo of your room.',
    icon: Upload,
  },
  {
    id: 2,
    title: 'AI Detects Furniture',
    description: 'We automatically identify sofas, chairs, tables, etc.',
    icon: Search,
  },
  {
    id: 3,
    title: 'Choose Replacement',
    description: 'Pick a new item from the catalog that matches.',
    icon: MousePointer,
  },
  {
    id: 4,
    title: 'Instant Auto-Swap',
    description: 'We replace it automatically. (Optional) Fine-tune after.',
    icon: CheckCircle,
  },
];

type DesignState = 'idle' | 'photoUploaded' | 'detected' | 'furniturePlaced';

function getDesignState(state: any): DesignState {
  if (!state.design.backgroundPhoto) return 'idle';
  if (state.detectedObjects.length === 0) return 'photoUploaded';
  if (state.design.placedFurniture.length === 0) return 'detected';
  return 'furniturePlaced';
}

export function FooterSteps() {
  const { state } = useRoom();
  const designState = getDesignState(state);

  return (
    <div className="backdrop-blur-md bg-white/70 border-t border-white/20 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Steps */}
          <div className="flex items-center space-x-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
                const isActive = designState === 'idle' && step.id === 1 ||
                                designState === 'photoUploaded' && step.id === 2 ||
                                designState === 'detected' && step.id === 3 ||
                                designState === 'furniturePlaced' && step.id === 4;
                const isCompleted = (designState === 'photoUploaded' && step.id < 2) ||
                                   (designState === 'detected' && step.id < 3) ||
                                   (designState === 'furniturePlaced' && step.id < 4);
              const isLast = index === steps.length - 1;

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                        isCompleted
                          ? 'bg-green-500 text-white scale-110'
                          : isActive
                          ? 'bg-blue-500 text-white scale-110'
                          : 'bg-white/50 text-gray-400 hover:bg-white/70'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="mt-3 text-center">
                      <p
                        className={`text-sm font-semibold ${
                          isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isActive || isCompleted ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {!isLast && (
                    <div
                      className={`w-12 h-1 mx-6 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-400' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="flex items-center space-x-4">
            {state.design.backgroundPhoto && (
              <button
                onClick={() => {
                  // This will be handled by the parent component
                  const event = new CustomEvent('saveDesign');
                  window.dispatchEvent(event);
                }}
                className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Save my room design"
              >
                <CheckCircle className="w-5 h-5" />
                Save My Room
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
