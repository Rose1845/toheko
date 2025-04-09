
import apiClient from './api';
import { 
  Permission,
  PermissionDTO,
  AcknowledgementResponse 
} from '../types/api';

export const permissionService = {
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await apiClient.get('/api/v1/permissions');
    return response.data;
  },

  getPermissionById: async (id: number): Promise<Permission> => {
    const response = await apiClient.get(`/api/v1/permissions/${id}`);
    return response.data;
  },

  updatePermission: async (id: number, permission: PermissionDTO): Promise<Permission> => {
    const response = await apiClient.put(`/api/v1/permissions/${id}`, permission);
    return response.data;
  },

  deletePermission: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/permissions/${id}`);
  }
};
