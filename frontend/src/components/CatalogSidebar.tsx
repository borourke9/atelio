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
  const { hasPhoto, state, setSelectedItem } = useRoom();
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


  const handleFurnitureSelect = useCallback((item: CatalogItem) => {
    if (!hasPhoto) {
      toast.error('Please upload a room photo first');
      return;
    }

    // Select the item
    setSelectedItem(item);
    
    // Call the optional callback
    if (onSelectFurniture) {
      onSelectFurniture(item);
    }
  }, [hasPhoto, setSelectedItem, onSelectFurniture]);

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
          <div className="overflow-y-auto h-[calc(100vh-160px)] pr-2">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading catalog...</span>
            </div>
          )}
            {!loading && filteredItems.map((item) => {
              const isSelected = state.selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleFurnitureSelect(item)}
                  className={`w-full text-left border rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition p-3 mb-3 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
              <div className="relative w-full pt-[66%] mb-2">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="absolute inset-0 w-full h-full object-contain rounded-lg bg-gray-50" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/placeholder.png";
                  }}
                />
              </div>
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{item.category}</div>
                </button>
              );
            })}
            {!loading && filteredItems.length === 0 && (
              <div className="m-3 p-3 text-sm text-gray-600 rounded-lg border">
                {error ? "Could not load catalog." : "No catalog items found."}
              </div>
            )}
        </div>
      </div>
    </aside>
  );
}
