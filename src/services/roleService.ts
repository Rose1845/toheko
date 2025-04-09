
import apiClient from './api';
import { Role, RoleDTO, AcknowledgementResponse } from '../types/api';

export const roleService = {
  getAllRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get('/api/v1/roles');
    return response.data || [];
  },

  getRoleByCode: async (roleCode: number): Promise<Role> => {
    const response = await apiClient.get(`/api/v1/roles/${roleCode}`);
    return response.data;
  },

  createRole: async (role: RoleDTO): Promise<Role> => {
    const response = await apiClient.post('/api/v1/roles', role);
    return response.data;
  },

  updateRole: async (roleCode: number, role: RoleDTO): Promise<Role> => {
    const response = await apiClient.put(`/api/v1/roles/${roleCode}`, role);
    return response.data;
  },

  deleteRole: async (roleCode: number): Promise<void> => {
    await apiClient.delete(`/api/v1/roles/${roleCode}`);
  }
};
