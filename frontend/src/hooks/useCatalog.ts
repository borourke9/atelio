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
    (async () => {
      setLoading(true);
      setError(null);

      async function load(url: string) {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`${url} ${r.status}`);
        return r.json();
      }

      try {
        let data = await load('/api/catalog').catch(() => load('/shared/catalog.json'));
        data = (data || []).map((it: any) => ({
          ...it,
          imageUrl: it.imageUrl?.startsWith('/') ? it.imageUrl : `/images/${it.imageUrl || ''}`
        }));
        setItems(data);
      } catch (e: any) {
        console.error('Catalog load error:', e);
        setError(e.message || 'catalog load failed');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { items, loading, error };
}
