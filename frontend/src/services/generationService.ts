import { apiClient, type GenerateRequest } from '../lib/api';

export type SemanticData = {
  style: string;
  color: string;
  material: string;
  shape: string;
  features: string[];
  roomType: string;
  placement: string;
  lighting: string;
  perspective: string;
  background: string;
  aiPrompt: string;
};

export type GenerateParams = {
  roomImageUrl: string;
  furnitureImageUrl: string;
  selectedFurnitureName: string;
  mask?: string;
  semanticData?: SemanticData;
  onProgress?: (step: "analyze" | "remove" | "place", pct: number) => void;
  onOverlayPlace?: (imageUrl: string) => void; // used by mock to place overlay
};

export type GenerateResult = {
  updatedPhotoUrl?: string;
};

export async function generateRoom(params: GenerateParams): Promise<GenerateResult> {
  const { roomImageUrl, furnitureImageUrl, selectedFurnitureName, mask, semanticData, onProgress, onOverlayPlace } = params;

  try {
    console.log("🎨 Starting room generation...");
    onProgress?.("analyze", 10);
    
      const request: GenerateRequest = {
        roomImageUrl,
        furnitureImageUrl,
        selectedFurnitureName,
        mask,
        semanticData
      };

    onProgress?.("analyze", 50);

    const result = await apiClient.generateImage(request);

    onProgress?.("remove", 75);
    onProgress?.("place", 100);

    console.log("✅ Room generated successfully:", result.imageUrl);
    
    return { updatedPhotoUrl: result.imageUrl };

  } catch (error) {
    console.error('❌ Generation failed:', error);
    
    // Show user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Fallback to mock behavior on error
    console.log('🔄 Falling back to mock generation...');
    
    const steps = [
      { name: "analyze" as const, duration: 800, label: "Analyzing room" },
      { name: "remove" as const, duration: 1000, label: `Removing old furniture` },
      { name: "place" as const, duration: 800, label: "Placing new furniture" }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Simulate step progress
      for (let progress = 0; progress <= 100; progress += 10) {
        onProgress?.(step.name, progress);
        await new Promise(resolve => setTimeout(resolve, step.duration / 10));
      }
    }

    // Mock completion - place overlay instead of returning new photo
    if (onOverlayPlace) {
      onOverlayPlace(roomImageUrl); // Use room image as fallback
    }

    // Re-throw the error so the UI can show it
    throw new Error(errorMessage);
  }
}
