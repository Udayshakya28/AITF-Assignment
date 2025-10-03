import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://aitf-assignment-4.onrender.com/api';

class ChatService {
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
        console.error('API Error:', error);
        if (error.response?.data?.error) {
          throw new Error(error.response.data.error);
        }
        throw new Error('ネットワークエラーが発生しました');
      }
    );
  }

  async createSession(data) {
    try {
      const response = await this.api.post('/chat/session', data);
      return response.data;
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  async sendMessage(data) {
    try {
      const response = await this.api.post('/chat/message', data);
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async getChatHistory(sessionId, limit = 50, offset = 0) {
    try {
      const response = await this.api.get(`/chat/history/${sessionId}`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Get chat history error:', error);
      throw error;
    }
  }

  async updatePreferences(sessionId, preferences) {
    try {
      const response = await this.api.put(`/chat/preferences/${sessionId}`, {
        preferences
      });
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  }

  async getUserSessions(userId, limit = 10, offset = 0) {
    try {
      const response = await this.api.get(`/chat/sessions/${userId}`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Get user sessions error:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();

