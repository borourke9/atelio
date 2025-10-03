import { useState, useCallback, useRef } from 'react';

interface UseDragAndDropOptions {
  onDrop: (file: File) => void;
  accept?: string[];
  maxSize?: number; // in bytes
}

interface UseDragAndDropReturn {
  isDragOver: boolean;
  dragProps: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

export function useDragAndDrop({ onDrop, accept = ['image/png', 'image/jpeg'], maxSize = 10 * 1024 * 1024 }: UseDragAndDropOptions): UseDragAndDropReturn {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];

    try {
      // Validate file type
      if (!accept.includes(file.type)) {
        throw new Error(`Invalid file type. Please upload a ${accept.join(' or ')} file.`);
      }

      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File too large. Please upload a file smaller than ${Math.round(maxSize / (1024 * 1024))}MB.`);
      }

      onDrop(file);
    } catch (error) {
      // Re-throw the error so components can handle it
      throw error;
    }
  }, [onDrop, accept, maxSize]);

  return {
    isDragOver,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}
