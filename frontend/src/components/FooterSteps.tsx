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
    <footer className="sticky bottom-0 z-20 bg-white/80 backdrop-blur border-t border-sand-200">
      <div className="mx-auto max-w-7xl px-6 py-4 grid grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const isActive = designState === 'idle' && step.id === 1 ||
                          designState === 'photoUploaded' && step.id === 2 ||
                          designState === 'detected' && step.id === 3 ||
                          designState === 'furniturePlaced' && step.id === 4;
          const isCompleted = (designState === 'photoUploaded' && step.id < 2) ||
                             (designState === 'detected' && step.id < 3) ||
                             (designState === 'furniturePlaced' && step.id < 4);

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-full grid place-items-center shadow-soft ${
                isActive || isCompleted ? "bg-accent text-white" : "bg-sand-100 text-sand-700"
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-stoneink">{step.title}</div>
                <div className="text-xs text-sand-700">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </footer>
  );
}
