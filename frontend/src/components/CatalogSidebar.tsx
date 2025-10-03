import { useState, useMemo, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { useRoom } from '../context/RoomContext';
import { debounce } from '../utils/debounce';
import { generateRoom } from '../services/generationService';
import { ConfirmGenerateModal } from './ConfirmGenerateModal';
import { GenerateProgressModal } from './GenerateProgressModal';
import toast from 'react-hot-toast';
import type { CatalogItem } from '../types';

interface CatalogSidebarProps {
  onSelectFurniture?: (item: CatalogItem) => void;
  onFurnitureSelect?: (item: CatalogItem) => void;
  selectedFurniture?: CatalogItem | null;
  canvasRef?: React.RefObject<{ addFurnitureToCanvas: (furniture: any) => void; addOverlayFromUrl: (url: string, opts?: any) => void; setBackgroundFromUrl: (url: string) => void; startRegionSelection: () => void; undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean } | null>;
}

export function CatalogSidebar({ onSelectFurniture, onFurnitureSelect, canvasRef }: CatalogSidebarProps) {
  const { items, loading, error } = useCatalog();
  const { hasPhoto, state, setSelectedItem } = useRoom();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedItem, setSelectedItemLocal] = useState<CatalogItem | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<"analyze" | "remove" | "place">("analyze");

  const debouncedSetSearch = useMemo(
    () => debounce((term: string) => setDebouncedSearchTerm(term), 250),
    []
  );

  // Update debounced search term
  useEffect(() => {
    debouncedSetSearch(searchTerm);
  }, [searchTerm, debouncedSetSearch]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, debouncedSearchTerm, selectedCategory]);

  // Get unique categories (unused but kept for future use)
  // const categories = useMemo(() => {
  //   const categoryMap = items.reduce((acc, item) => {
  //     acc[item.category] = (acc[item.category] || 0) + 1;
  //     return acc;
  //   }, {} as Record<string, number>);
  //   
  //   return Object.entries(categoryMap).map(([category, count]) => ({
  //     name: category,
  //     count
  //   }));
  // }, [items]);


  const handleFurnitureSelect = useCallback((item: CatalogItem) => {
    if (!hasPhoto) {
      toast.error('Upload a room photo first.');
      return;
    }

    // Set selected item and notify parent
    setSelectedItem(item);
    setSelectedItemLocal(item);
    onFurnitureSelect?.(item);
    
    // Call the optional callback
    if (onSelectFurniture) {
      onSelectFurniture(item);
    }
  }, [hasPhoto, setSelectedItem, onFurnitureSelect, onSelectFurniture]);

  const handleConfirmGenerate = useCallback(async () => {
    if (!selectedItem || !state.design.backgroundPhoto) return;

    setShowConfirmModal(false);
    setShowProgressModal(true);
    setProgress(0);
    setCurrentStep("analyze");

    // Note: We'll show loading in the progress modal instead of canvas blur
    console.log('🎨 Starting generation...');

    try {
      // Use the user's uploaded room photo
      const roomImageUrl = state.design.backgroundPhoto;
      
        const result = await generateRoom({
          roomImageUrl: roomImageUrl,
          furnitureImageUrl: selectedItem.imageUrl,
          selectedFurnitureName: selectedItem.name,
          semanticData: selectedItem.semanticData, // Include semantic data
          onProgress: (step, pct) => {
            setCurrentStep(step);
            setProgress(pct);
          },
          onOverlayPlace: (imageUrl) => {
            if (canvasRef?.current) {
              canvasRef.current.addOverlayFromUrl(imageUrl, { scale: 0.6 });
            }
          }
        });

      // Use the generated room image as the new background
      if (result.updatedPhotoUrl && canvasRef?.current) {
        // Set the generated room as the new background
        canvasRef.current.setBackgroundFromUrl(result.updatedPhotoUrl);
        toast.success('Room updated with gray sofa!');
      } else {
        toast.error('Failed to generate updated room image');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      
      // Show specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('sensitive')) {
        toast.error('Image content was flagged as sensitive. Please try with different images.');
      } else if (errorMessage.includes('quota')) {
        toast.error('API quota exceeded. Please try again later.');
      } else if (errorMessage.includes('network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('auth')) {
        toast.error('Authentication error. Please check API configuration.');
      } else {
        toast.error(`Generation failed: ${errorMessage}`);
      }
    } finally {
      setShowProgressModal(false);
    }
  }, [selectedItem, state.design.backgroundPhoto, canvasRef]);

  return (
    <aside className="w-80 px-5 py-6 border-r border-sand-200 bg-white/70 backdrop-blur" data-catalog-sidebar>
      {/* Header */}
      <div className="mb-4">
        <h2 className="font-display text-lg text-stoneink mb-3">Furniture Catalog</h2>
        <p className="text-xs text-sand-700 mb-4">Click furniture to generate new room images</p>
        
        {/* Search */}
        <div className="mb-3">
          <div className="relative">
            <input 
              className="w-full rounded-xl border border-sand-300 bg-white px-4 py-2 text-sm focus-ring" 
              placeholder="Search furniture..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-3 top-2.5 text-sand-600">⌕</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4">
          {["All","Sofas","Chairs","Tables"].map(t => {
            const isActive = (t === "All" && !selectedCategory) || 
                           (t.toLowerCase() === selectedCategory);
            return (
              <button 
                key={t} 
                onClick={() => setSelectedCategory(t === "All" ? null : t.toLowerCase())}
                className={`pill ${isActive ? "bg-accent text-white" : "bg-sand-100 text-sand-700 hover:bg-sand-200"}`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Items */}
      <div className="space-y-4 pr-2 overflow-y-auto h-[calc(100vh-220px)]">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <span className="ml-2 text-sand-700">Loading catalog...</span>
          </div>
        )}
        {!loading && filteredItems.map((item) => {
          const isSelected = state.selectedItem?.id === item.id;
          return (
            <button
              key={item.id}
              data-item-id={item.id}
              onClick={() => handleFurnitureSelect(item)}
              className={`w-full text-left card p-3 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-200 ${
                isSelected ? 'ring-2 ring-accent' : ''
              }`}
            >
              <div className="relative w-full rounded-xl bg-sand-50 overflow-hidden">
                <div className="pt-[66%]"></div>
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="absolute inset-0 h-full w-full object-contain" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/placeholder.png";
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <div className="font-medium text-stoneink">{item.name}</div>
                  <div className="text-xs text-sand-700 capitalize">{item.category}</div>
                </div>
                <span className="pill bg-white border border-sand-200 text-sand-700">{item.dimensions ?? ""}</span>
              </div>
            </button>
          );
        })}
        {!loading && filteredItems.length === 0 && (
          <div className="m-3 p-3 text-sm text-sand-700 rounded-lg border border-sand-200">
            {error ? "Could not load catalog." : "No catalog items found."}
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmGenerateModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        item={selectedItem}
        onConfirm={handleConfirmGenerate}
      />

      <GenerateProgressModal
        open={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        item={selectedItem}
        progress={progress}
        step={currentStep}
      />
    </aside>
  );
}
