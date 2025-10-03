import React, { useState, useMemo, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { debounce } from '../utils/debounce';
import type { CatalogItem } from '../types';

interface ProductCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: CatalogItem) => void;
}

export function ProductCatalogModal({ isOpen, onClose, onSelectProduct }: ProductCatalogModalProps) {
  const { items, loading, error } = useCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const debouncedSetSearch = useMemo(
    () => debounce((term: string) => setDebouncedSearchTerm(term), 250),
    []
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = debouncedSearchTerm === '' || 
        item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = selectedCategory === null || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, debouncedSearchTerm, selectedCategory]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(item => item.category)));
    return cats;
  }, [items]);

  const handleProductSelect = useCallback((product: CatalogItem) => {
    onSelectProduct(product);
    onClose();
  }, [onSelectProduct, onClose]);

  if (!isOpen) return null;

  console.log('ProductCatalogModal rendering:', { isOpen, items: items.length, loading, error });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Choose a Product</h2>
            <p className="text-sm sm:text-base text-gray-600">Select furniture from our catalog</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Search and Filters */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 placeholder-gray-500 text-sm sm:text-base"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategory === null
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-600 text-lg">Failed to load products: {error}</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleProductSelect(item)}
                  className="text-left p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-white group"
                >
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-2 sm:mb-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base group-hover:text-blue-600">{item.name}</h3>
                  {item.dimensions && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">{item.dimensions}</p>
                  )}
                  <span className="inline-block px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
