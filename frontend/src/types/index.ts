export interface Position {
  x: number;
  y: number;
}

export interface PlacedFurniture {
  id: string;
  position: Position;
  scale: number;
  rotation: number;
  imageUrl: string;
  category: string;
}

export interface RoomDesign {
  backgroundPhoto: string;
  placedFurniture: PlacedFurniture[];
}

export interface SemanticData {
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
}

export interface CatalogItem {
  id: string;
  name: string;
  imageUrl: string;
  category: "sofa" | "chair" | "table";
  dimensions?: string;
  replacementHint?: string;
  semanticData?: SemanticData;
}

export interface DetectionResult {
  category: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface SwapRequest {
  photo: string;
  category: string;
  replacementImage: string;
}

export interface SwapResponse {
  success: boolean;
  updatedPhoto?: string;
  error?: string;
}

export interface ReplaceRegion {
  x: number;
  y: number;
}

export interface CompositeRequest {
  sceneUrl: string;
  productUrl: string;
  replaceRegion: ReplaceRegion;
}

export interface CompositeResponse {
  imageUrl: string;
}

