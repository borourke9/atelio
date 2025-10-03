import { useState, useCallback } from 'react';

interface HistoryItem {
  id: string;
  imageUrl: string;
  timestamp: number;
}

interface UseHistoryReturn {
  history: HistoryItem[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  addToHistory: (imageUrl: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  clearHistory: () => void;
  getCurrentImage: () => string | null;
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const addToHistory = useCallback((imageUrl: string) => {
    const newItem: HistoryItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      imageUrl,
      timestamp: Date.now()
    };

    setHistory(prev => {
      // Remove any items after current index (when adding new item after undo)
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newItem);
      return newHistory;
    });
    
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback((): string | null => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      return history[newIndex]?.imageUrl || null;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback((): string | null => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      return history[newIndex]?.imageUrl || null;
    }
    return null;
  }, [currentIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const getCurrentImage = useCallback((): string | null => {
    return history[currentIndex]?.imageUrl || null;
  }, [history, currentIndex]);

  return {
    history,
    currentIndex,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    addToHistory,
    undo,
    redo,
    clearHistory,
    getCurrentImage
  };
}

