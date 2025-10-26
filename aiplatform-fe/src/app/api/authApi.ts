import api from '../utils/api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

export const authApi = {
  // Check authentication status
  checkAuth: async (): Promise<{ isAuthenticated: boolean; user: User | null }> => {
    try {
      const response = await api.get('/auth/check');
      return response.data;
    } catch (error) {
      console.error('Check auth error:', error);
      return { isAuthenticated: false, user: null };
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/register', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, we should clear local state
    }
  },

  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  },
};