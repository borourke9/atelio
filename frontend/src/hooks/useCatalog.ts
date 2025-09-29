import { useState, useEffect } from 'react';
import type { CatalogItem } from '../types';

interface UseCatalogReturn {
  items: CatalogItem[];
  loading: boolean;
  error: string | null;
}

export function useCatalog(): UseCatalogReturn {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load catalog items directly from the public images folder
    const catalogItems: CatalogItem[] = [
      {
        id: 'modern-gray-sofa',
        name: 'Modern Gray Sofa',
        imageUrl: '/images/modern-gray-sofa.jpg',
        category: 'sofa',
        dimensions: '84" W x 36" D x 32" H',
        replacementHint: 'Perfect for living rooms and family spaces'
      },
      {
        id: 'modern-floor-sofa-orange',
        name: 'Orange Floor Sofa',
        imageUrl: '/images/modern-floor-sofa-orange.jpg',
        category: 'sofa',
        dimensions: '72" W x 30" D x 18" H',
        replacementHint: 'Low-profile modern seating for contemporary spaces'
      },
      {
        id: 'glass-coffee-table',
        name: 'Glass Coffee Table',
        imageUrl: '/images/glass-coffee-table.jpg',
        category: 'table',
        dimensions: '48" W x 24" D x 18" H',
        replacementHint: 'Elegant centerpiece for your living room'
      },
      {
        id: 'eames-style-chair',
        name: 'Eames Style Chair',
        imageUrl: '/images/eames-style-chair.jpg',
        category: 'chair',
        dimensions: '26" W x 26" D x 32" H',
        replacementHint: 'Classic mid-century modern design'
      }
    ];

    // Simulate loading time
    setTimeout(() => {
      setItems(catalogItems);
      setLoading(false);
    }, 500);
  }, []);

  return { items, loading, error };
}
