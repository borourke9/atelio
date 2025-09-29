import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { useRoom } from '../context/RoomContext';
import { debounce } from '../utils/debounce';
import toast from 'react-hot-toast';
import type { CatalogItem } from '../types';

interface CatalogSidebarProps {
  onSelectFurniture?: (item: CatalogItem) => void;
}

export function CatalogSidebar({ onSelectFurniture }: CatalogSidebarProps) {
  const { items, loading, error } = useCatalog();
  const { hasPhoto, state, dispatch } = useRoom();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

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

  // Get unique categories
  const categories = useMemo(() => {
    const categoryMap = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryMap).map(([category, count]) => ({
      name: category,
      count
    }));
  }, [items]);

  const detectedCategory = state.detectedObjects[0]?.category;

  const handleFurnitureSelect = useCallback(async (item: CatalogItem) => {
    if (!hasPhoto) {
      toast.error('Please upload a room photo first');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading(`Replacing ${item.category}...`);

      // Check if we have a detection for this category
      const hasMatchingDetection = detectedCategory === item.category;
      
      if (hasMatchingDetection) {
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
            toast.success(`Placed ${item.name}`, { id: loadingToast });
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
          toast.success(`Placed ${item.name}`, { id: loadingToast });
        }
      } else {
        // No matching detection, add as overlay
        const newFurniture = {
          id: `${item.id}-${Date.now()}`,
          position: { x: 400, y: 300 },
          scale: 0.5,
          rotation: 0,
          imageUrl: item.imageUrl,
          category: item.category,
        };
        dispatch({ type: 'ADD_FURNITURE', payload: newFurniture });
        toast.success(`Placed ${item.name}`, { id: loadingToast });
      }

      // Call the optional callback
      if (onSelectFurniture) {
        onSelectFurniture(item);
      }
    } catch (error) {
      console.error('Failed to place furniture:', error);
      toast.error('Failed to place furniture');
    }
  }, [hasPhoto, detectedCategory, state.design.backgroundPhoto, dispatch, onSelectFurniture]);

  return (
    <aside className="w-72 shrink-0 border-r bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Furniture Catalog</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search furniture…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white transition-all duration-200"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
              !selectedCategory
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 capitalize ${
                selectedCategory === category.name
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}s ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Items */}
      <div className="relative">
        {!hasPhoto && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm pointer-events-none rounded-lg" />
        )}
        <div className="overflow-y-auto h-[calc(100vh-160px)] pr-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading catalog...</span>
            </div>
          )}
          {!loading && filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => hasPhoto && handleFurnitureSelect(item)}
              className="w-full text-left bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition p-3 mb-3"
            >
              <div className="relative w-full pt-[66%] mb-2">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="absolute inset-0 w-full h-full object-contain rounded-lg bg-gray-50" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
              <div className="font-medium text-gray-800">{item.name}</div>
              <div className="text-xs text-gray-500 capitalize">{item.category}</div>
            </button>
          ))}
          {!loading && filteredItems.length === 0 && (
            <div className="m-3 p-3 text-sm text-gray-600 rounded-lg border">
              {error ? "Could not load catalog. Check /api/catalog or /shared/catalog.json." : "No catalog items found."}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
