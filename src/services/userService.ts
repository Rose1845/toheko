import apiClient from './api';
import { User, UserDTO, AcknowledgementResponse } from '../types/api';

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get('/api/v1/users');
      console.log('Users API response:', response.data);
      return response.data?.content || []; // Assuming paginated response with content array
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await apiClient.get(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },

  createUser: async (user: UserDTO): Promise<User> => {
    try {
      const response = await apiClient.post('/api/v1/users', user);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id: number, user: UserDTO): Promise<User> => {
    try {
      const response = await apiClient.put(`/api/v1/users/${id}`, user);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/users/${id}`);
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  },

  // Additional user-specific methods if needed
  searchUsers: async (query: string): Promise<User[]> => {
    try {
      const response = await apiClient.get('/api/v1/users/search', {
        params: { query }
      });
      return response.data?.content || [];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  changeUserStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<User> => {
    try {
      const response = await apiClient.patch(`/api/v1/users/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error changing status for user ${id}:`, error);
      throw error;
    }
  }
};