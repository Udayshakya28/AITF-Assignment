import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Handle 401 without forcing navigation; let UI react to auth state
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try { await this.logout(); } catch (_) {}
        }
        return Promise.reject(error);
      }
    );
  }

  // Register new user
  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', userData);
      if (response.data.success) {
        this.setToken(response.data.data.token);
        this.setUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await this.api.post('/auth/login', { email, password });
      if (response.data.success) {
        this.setToken(response.data.data.token);
        this.setUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  // Logout user
  async logout() {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      this.removeToken();
      this.removeUser();
    }
  }

  // Get current user profile
  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile');
      if (response.data.success) {
        this.setUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch profile');
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await this.api.put('/auth/profile', userData);
      if (response.data.success) {
        this.setUser(response.data.data.user);
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to change password');
    }
  }

  // Token management
  setToken(token) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  // User management
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  removeUser() {
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check if token is expired (basic check)
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  }

  // Initialize auth state on app load
  async initializeAuth() {
    const token = this.getToken();
    if (token && !this.isTokenExpired()) {
      try {
        await this.getProfile();
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    } else {
      this.logout();
      return false;
    }
  }
}

export const authService = new AuthService();
