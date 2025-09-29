import { useState, useCallback } from 'react';

type LoadingFlags = {
  uploading?: boolean;
  detecting?: boolean;
  swapping?: boolean;
  initializing?: boolean;
  [key: string]: boolean | undefined;
};

export function useLoading() {
  const [loading, setLoadingState] = useState<LoadingFlags>({});

  const setLoading = useCallback((flag: keyof LoadingFlags, value: boolean) => {
    setLoadingState(prev => ({ ...prev, [flag]: value }));
  }, []);

  const clearLoading = useCallback(() => {
    setLoadingState({});
  }, []);

  return { loading, setLoading, clearLoading };
}
