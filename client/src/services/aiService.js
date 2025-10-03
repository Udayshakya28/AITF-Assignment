import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://aitf-assignment-4.onrender.com/api';

class AIService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('AI API Error:', error);
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('AI処理でエラーが発生しました');
      }
    );
  }

  async generateSuggestions(location, preferences = {}) {
    try {
      const response = await this.api.post('/ai/suggestions', {
        location,
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('Generate suggestions error:', error);
      throw error;
    }
  }

  async generateSuggestionsByCoordinates(lat, lon, preferences = {}) {
    try {
      const response = await this.api.post('/ai/suggestions/coordinates', {
        lat,
        lon,
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('Generate suggestions by coordinates error:', error);
      throw error;
    }
  }

  async processVoiceInput(transcription, context = {}) {
    try {
      const response = await this.api.post('/ai/voice', {
        transcription,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Process voice input error:', error);
      throw error;
    }
  }

  async generateChatResponse(message, context = {}) {
    try {
      const response = await this.api.post('/ai/chat', {
        message,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Generate chat response error:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();

