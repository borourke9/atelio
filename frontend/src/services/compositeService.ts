import type { CompositeRequest, CompositeResponse } from '../types';

export class CompositeService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://100.69.95.6:3001') {
    this.baseUrl = baseUrl;
  }

  async generateComposite(request: CompositeRequest): Promise<CompositeResponse> {
    const url = `${this.baseUrl}/api/generate-composite`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON response, got ${contentType}. Response: ${text.substring(0, 200)}`);
      }

      let data: any;
      try {
        const text = await response.text();
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON response: ${parseError}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${data.details || 'Unknown error'}`);
      }

      if (!data.imageUrl) {
        throw new Error('No imageUrl in response');
      }

      return { imageUrl: data.imageUrl };
    } catch (error) {
      console.error('Composite generation failed:', error);
      throw error;
    }
  }
}

export const compositeService = new CompositeService();

