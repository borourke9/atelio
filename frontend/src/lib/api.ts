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

export interface GenerateRequest {
  roomImageUrl: string;
  furnitureImageUrl: string;
  selectedFurnitureName: string;
  mask?: string;
  semanticData?: SemanticData;
}

export interface GenerateResponse {
  imageUrl: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  async generateImage(request: GenerateRequest): Promise<GenerateResponse> {
    const url = `${this.baseUrl}/api/generate`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON response, got ${contentType}. Response: ${text.substring(0, 200)}`);
      }

      // Parse JSON safely
      let data: any;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON response: ${parseError}`);
      }

      if (!response.ok) {
        const errorData = data as ApiError;
        throw new Error(errorData.error || `HTTP ${response.status}: ${errorData.details || 'Unknown error'}`);
      }

      if (!data.imageUrl) {
        throw new Error('No imageUrl in response');
      }

      return { imageUrl: data.imageUrl };
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient('http://localhost:3001');
