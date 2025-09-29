import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { fabric } from 'fabric';
import { useRoom } from '../context/RoomContext';
import { useLoading } from '../hooks/useLoading';
import type { PlacedFurniture } from '../types';

interface CanvasEditorProps {
  onObjectModified?: (furniture: PlacedFurniture) => void;
}

export interface CanvasEditorRef {
  addFurnitureToCanvas: (furniture: PlacedFurniture) => void;
}

export const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>(({ onObjectModified }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const { state } = useRoom();
  const { loading, setLoading } = useLoading();
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    setLoading('initializing', true);

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f8f9fa',
    });

    fabricCanvasRef.current = canvas;
    setIsCanvasReady(true);
    setLoading('initializing', false);

    // Handle object modifications
    canvas.on('object:modified', () => {
      const activeObject = canvas.getActiveObject();
      if (activeObject && activeObject.data?.furnitureId) {
        const furniture: PlacedFurniture = {
          id: activeObject.data.furnitureId,
          position: {
            x: activeObject.left || 0,
            y: activeObject.top || 0,
          },
          scale: activeObject.scaleX || 1,
          rotation: activeObject.angle || 0,
          imageUrl: activeObject.data.imageUrl,
          category: activeObject.data.category,
        };
        onObjectModified?.(furniture);
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [onObjectModified]);

  // Load background photo
  useEffect(() => {
    if (!fabricCanvasRef.current || !state.design.backgroundPhoto) return;

    fabric.Image.fromURL(state.design.backgroundPhoto, (img: any) => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;
      
      // Clear existing background
      canvas.getObjects().forEach((obj: any) => {
        if (obj.data?.isBackground) {
          canvas.remove(obj);
        }
      });

      // Scale image to fit canvas while maintaining aspect ratio
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const imgAspect = img.width! / img.height!;
      const canvasAspect = canvasWidth / canvasHeight;

      let scale = 1;
      if (imgAspect > canvasAspect) {
        scale = canvasWidth / img.width!;
      } else {
        scale = canvasHeight / img.height!;
      }

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: canvasWidth / 2,
        top: canvasHeight / 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        data: { isBackground: true },
      });

      canvas.add(img);
      canvas.sendToBack(img);
      canvas.renderAll();
    });
  }, [state.design.backgroundPhoto]);

  // Load placed furniture
  useEffect(() => {
    if (!fabricCanvasRef.current || !isCanvasReady) return;

    const canvas = fabricCanvasRef.current;
    
    // Remove existing furniture objects
    canvas.getObjects().forEach((obj: any) => {
      if (obj.data?.furnitureId) {
        canvas.remove(obj);
      }
    });

    // Add furniture objects
    state.design.placedFurniture.forEach((furniture) => {
      fabric.Image.fromURL(furniture.imageUrl, (img: any) => {
        if (!fabricCanvasRef.current) return;

        img.set({
          left: furniture.position.x,
          top: furniture.position.y,
          scaleX: furniture.scale,
          scaleY: furniture.scale,
          angle: furniture.rotation,
          data: {
            furnitureId: furniture.id,
            imageUrl: furniture.imageUrl,
            category: furniture.category,
          },
        });

        canvas.add(img);
        canvas.renderAll();
      });
    });
  }, [state.design.placedFurniture, isCanvasReady]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (!fabricCanvasRef.current) return;
      
      const container = canvasRef.current?.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      fabricCanvasRef.current.setDimensions({
        width: rect.width,
        height: rect.height,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addFurnitureToCanvas = (furniture: PlacedFurniture) => {
    if (!fabricCanvasRef.current) return;

    fabric.Image.fromURL(furniture.imageUrl, (img: any) => {
      if (!fabricCanvasRef.current) return;

      const canvas = fabricCanvasRef.current;
      const centerX = canvas.getWidth() / 2;
      const centerY = canvas.getHeight() / 2;

      img.set({
        left: centerX,
        top: centerY,
        scaleX: 0.5,
        scaleY: 0.5,
        originX: 'center',
        originY: 'center',
        data: {
          furnitureId: furniture.id,
          imageUrl: furniture.imageUrl,
          category: furniture.category,
        },
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  // Expose addFurnitureToCanvas to parent components
  useImperativeHandle(ref, () => ({
    addFurnitureToCanvas,
  }));

  return (
    <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-white/20 relative">
      {loading.initializing && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Initializing canvas...</p>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
});
