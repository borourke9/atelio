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
    // Use hardcoded catalog data with semantic metadata
    const catalogData: CatalogItem[] = [
      {
        id: "modern-gray-sofa",
        name: "Modern Gray Sofa",
        imageUrl: "https://res.cloudinary.com/dr1uz5pka/image/upload/v1759192370/sofagray_w4tskg.png",
        category: "sofa",
        dimensions: "84x36",
        replacementHint: "Replace existing sofa in the photo",
        semanticData: {
          style: "modern",
          color: "gray",
          material: "fabric",
          shape: "rectangular",
          features: ["armrests", "cushions", "upholstered"],
          roomType: "living room",
          placement: "against wall",
          lighting: "natural",
          perspective: "front view",
          background: "neutral",
          aiPrompt: "A modern gray fabric sofa with clean lines, soft cushions, and armrests. The sofa has a contemporary design with neutral gray upholstery. It should be placed naturally in a living room setting with proper lighting and perspective."
        }
      },
      {
        id: "contemporary-chair",
        name: "Contemporary Accent Chair",
        imageUrl: "https://res.cloudinary.com/dr1uz5pka/image/upload/v1759192370/sofagray_w4tskg.png",
        category: "chair",
        dimensions: "32x32",
        replacementHint: "Replace existing chair in the photo"
      },
      {
        id: "coffee-table",
        name: "Glass Coffee Table",
        imageUrl: "https://res.cloudinary.com/dr1uz5pka/image/upload/v1759192370/sofagray_w4tskg.png",
        category: "table",
        dimensions: "48x24",
        replacementHint: "Replace existing coffee table in the photo"
      },
      {
        id: "dining-table",
        name: "Modern Dining Table",
        imageUrl: "https://res.cloudinary.com/dr1uz5pka/image/upload/v1759192370/sofagray_w4tskg.png",
        category: "table",
        dimensions: "72x36",
        replacementHint: "Replace existing dining table in the photo"
      },
      {
        id: "bookshelf",
        name: "Wooden Bookshelf",
        imageUrl: "https://res.cloudinary.com/dr1uz5pka/image/upload/v1759192370/sofagray_w4tskg.png",
        category: "storage",
        dimensions: "36x12",
        replacementHint: "Replace existing bookshelf in the photo"
      },
      {
        id: "lamp",
        name: "Modern Floor Lamp",
        imageUrl: "https://res.cloudinary.com/dr1uz5pka/image/upload/v1759192370/sofagray_w4tskg.png",
        category: "lighting",
        dimensions: "60x12",
        replacementHint: "Replace existing lamp in the photo"
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
