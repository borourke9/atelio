export type GenerateParams = {
  photoBlobOrDataUrl: string;
  category: "sofa" | "chair" | "table";
  replacementImage: string;
  onProgress?: (step: "analyze" | "remove" | "place", pct: number) => void;
  onOverlayPlace?: (imageUrl: string) => void; // used by mock to place overlay
};

export type GenerateResult = {
  updatedPhotoUrl?: string;
};

export async function generateRoom(params: GenerateParams): Promise<GenerateResult> {
  const { category, replacementImage, onProgress, onOverlayPlace } = params;

  try {
    // TODO: Replace with real API call
    // const fd = new FormData();
    // fd.append("photo", photoBlobOrDataUrl);
    // fd.append("category", category);
    // fd.append("replacementImage", replacementImage);
    // const res = await fetch("/api/swap", { method: "POST", body: fd });
    // const { updatedPhoto } = await res.json();
    // return { updatedPhotoUrl: updatedPhoto };

    // Mock implementation with 3 steps
    const steps = [
      { name: "analyze" as const, duration: 800, label: "Analyzing room" },
      { name: "remove" as const, duration: 1000, label: `Removing old ${category}` },
      { name: "place" as const, duration: 800, label: "Placing new furniture" }
    ];

    let totalDuration = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Simulate step progress
      for (let progress = 0; progress <= 100; progress += 10) {
        onProgress?.(step.name, progress);
        await new Promise(resolve => setTimeout(resolve, step.duration / 10));
      }
      
      totalDuration += step.duration;
    }

    // Mock completion - place overlay instead of returning new photo
    if (onOverlayPlace) {
      onOverlayPlace(replacementImage);
    }

    // Return empty result for mock (real API would return updatedPhotoUrl)
    return {};

  } catch (error) {
    console.error('Generation failed:', error);
    throw new Error('Failed to generate room');
  }
}
