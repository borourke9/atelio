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
    // Use hardcoded catalog data instead of API calls
    const catalogData: CatalogItem[] = [
      {
        id: "modern-gray-sofa",
        name: "Modern Gray Sofa",
        imageUrl: "/images/modern-gray-sofa.jpg",
        category: "sofa",
        dimensions: "84x36",
        replacementHint: "Replace existing sofa in the photo"
      },
      {
        id: "modern-floor-sofa-orange",
        name: "Modern Floor Sofa (Orange)",
        imageUrl: "/images/modern-floor-sofa-orange.jpg",
        category: "sofa",
        dimensions: "12x60",
        replacementHint: "Replace existing sofa in the photo"
      },
      {
        id: "eames-style-chair",
        name: "Eames Style Chair",
        imageUrl: "/images/eames-style-chair.jpg",
        category: "chair",
        dimensions: "24x32",
        replacementHint: "Replace existing chair in the photo"
      },
      {
        id: "glass-coffee-table",
        name: "Glass Coffee Table",
        imageUrl: "/images/glass-coffee-table.jpg",
        category: "table",
        dimensions: "36x24",
        replacementHint: "Replace existing coffee table in the photo"
      }
    ];

    // Simulate loading delay for better UX
    setTimeout(() => {
      setItems(catalogData);
      setLoading(false);
      setError(null);
    }, 500);
  }, []);

  return { items, loading, error };
}
