
import apiClient from './api';
import { AuthenticationRequest, RegisterRequest, AuthenticationResponse } from '../types/api';

export const authService = {
  login: async (request: AuthenticationRequest): Promise<AuthenticationResponse> => {
    const response = await apiClient.post('/api/v1/auth/authenticate', request);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  register: async (request: RegisterRequest): Promise<AuthenticationResponse> => {
    const response = await apiClient.post('/api/v1/auth/register', request);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },

  refreshToken: async (): Promise<void> => {
    const response = await apiClient.post('/api/v1/auth/refresh-token');
    if (response.data && response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
  },

  logout: (): void => {
    localStorage.removeItem('token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};
