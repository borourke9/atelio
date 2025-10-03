import { useState, useCallback } from 'react';
import { compositeService } from '../services/compositeService';
import type { CompositeRequest, CompositeResponse, ReplaceRegion } from '../types';

interface UseCompositeReturn {
  generateComposite: (request: CompositeRequest) => Promise<CompositeResponse>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useComposite(): UseCompositeReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateComposite = useCallback(async (request: CompositeRequest): Promise<CompositeResponse> => {
    setLoading(true);
    setError(null);

    try {
      const result = await compositeService.generateComposite(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateComposite,
    loading,
    error,
    clearError
  };
}

