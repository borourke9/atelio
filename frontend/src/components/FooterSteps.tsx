import { } from 'react';
import { Upload, Search, MousePointer, CheckCircle } from 'lucide-react';
import { useRoom } from '../context/RoomContext';

const steps = [
  {
    id: 1,
    title: 'Choose Furniture',
    description: 'Select furniture from our catalog',
    icon: MousePointer,
  },
  {
    id: 2,
    title: 'Create Room',
    description: 'Click to generate a room with your furniture',
    icon: Upload,
  },
  {
    id: 3,
    title: 'Add More Items',
    description: 'Add additional furniture to your room',
    icon: Search,
  },
  {
    id: 4,
    title: 'Customize & Save',
    description: 'Drag, resize, and save your design',
    icon: CheckCircle,
  },
];

type DesignState = 'idle' | 'roomCreated' | 'furnitureAdded' | 'customized';

function getDesignState(state: any): DesignState {
  if (!state.design.backgroundPhoto) return 'idle';
  if (state.design.placedFurniture.length === 0) return 'roomCreated';
  if (state.design.placedFurniture.length === 1) return 'furnitureAdded';
  return 'customized';
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
                                designState === 'roomCreated' && step.id === 2 ||
                                designState === 'furnitureAdded' && step.id === 3 ||
                                designState === 'customized' && step.id === 4;
                const isCompleted = (designState === 'roomCreated' && step.id < 2) ||
                                   (designState === 'furnitureAdded' && step.id < 3) ||
                                   (designState === 'customized' && step.id < 4);
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
