import apiClient from './api';
import { Role, RoleDTO, AcknowledgementResponse } from '../types/api';

export const roleService = {
  getAllRoles: async (): Promise<Role[]> => {
    try {
      const response = await apiClient.get('/api/v1/roles');
      console.log('Roles API response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  getRoleByCode: async (roleCode: number): Promise<Role> => {
    try {
      const response = await apiClient.get(`/api/v1/roles/${roleCode}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role with code ${roleCode}:`, error);
      throw error;
    }
  },

  createRole: async (role: RoleDTO): Promise<Role> => {
    try {
      const response = await apiClient.post('/api/v1/roles', role);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  updateRole: async (roleCode: number, role: RoleDTO): Promise<Role> => {
    try {
      const response = await apiClient.put(`/api/v1/roles/${roleCode}`, role);
      return response.data;
    } catch (error) {
      console.error(`Error updating role with code ${roleCode}:`, error);
      throw error;
    }
  },

  deleteRole: async (roleCode: number): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/roles/${roleCode}`);
    } catch (error) {
      console.error(`Error deleting role with code ${roleCode}:`, error);
      throw error;
    }
  }
};
