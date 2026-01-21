// API service for HotSeat backend communication

// API base URL - change this to your backend URL
// For local development with physical device, use your computer's IP address
// For emulator: Android uses 10.0.2.2, iOS uses localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  count?: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
        };
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ message: string }>> {
    return this.request('/health');
  }

  // Questions
  async getCategories(): Promise<ApiResponse<{ category: string; count: number }[]>> {
    return this.request('/questions/categories');
  }

  async getQuestionsByCategory(
    category: string,
    limit?: number,
    excludeIds?: string[]
  ): Promise<ApiResponse<{ _id: string; text: string; category: string }[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (excludeIds?.length) params.append('excludeIds', excludeIds.join(','));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/questions/${category}${queryString}`);
  }

  // Games
  async createGame(gameData: {
    category: string;
    totalRounds: number;
    players: string[];
  }): Promise<ApiResponse<any>> {
    return this.request('/games', {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
  }

  async getGame(gameId: string): Promise<ApiResponse<any>> {
    return this.request(`/games/${gameId}`);
  }

  async getNextRound(gameId: string): Promise<ApiResponse<any>> {
    return this.request(`/games/${gameId}/next-round`);
  }

  async submitRound(
    gameId: string,
    roundData: {
      playerId: string;
      questionId: string;
      points: number;
    }
  ): Promise<ApiResponse<any>> {
    return this.request(`/games/${gameId}/submit-round`, {
      method: 'POST',
      body: JSON.stringify(roundData),
    });
  }

  async getGameHistory(
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/games/history${queryString}`);
  }

  async getGameDetails(gameId: string): Promise<ApiResponse<any>> {
    return this.request(`/games/${gameId}/details`);
  }
}

// Export a singleton instance
export const api = new ApiService(API_BASE_URL);

// Export the class for testing or custom instances
export { ApiService };
