import apiClient from './api';
import { Group, GroupRequest, GroupSuspensionRequest, GroupOfficial } from '../types/api';

export const groupService = {
  getAllGroups: async (): Promise<Group[]> => {
    const response = await apiClient.get('/api/v1/groups/all-groups');
    return response.data.content || [];
  },

  getGroupById: async (groupId: number): Promise<Group> => {
    const response = await apiClient.get(`/api/v1/groups/${groupId}`);
    return response.data;
  },

  createGroup: async (groupData: GroupRequest): Promise<Group> => {
    const response = await apiClient.post('/api/v1/groups/register', groupData);
    return response.data;
  },

  updateGroup: async (groupId: number, groupData: GroupRequest): Promise<Group> => {
    const response = await apiClient.put(`/api/v1/groups/update-group/${groupId}`, groupData);
    return response.data;
  },

  deleteGroup: async (groupId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/groups/${groupId}`);
  },

  suspendGroup: async (groupId: number, suspensionData: GroupSuspensionRequest): Promise<void> => {
    await apiClient.patch(`/api/v1/groups/${groupId}/suspend`, suspensionData);
  },

  approveGroup: async (groupId: number): Promise<void> => {
    await apiClient.patch(`/api/v1/groups/${groupId}/approve`);
  },

  // Group officials related services
  getGroupOfficials: async (groupId: number): Promise<any> => {
    const response = await apiClient.get(`/api/v1/group-officials/group/${groupId}`);
    return response.data;
  },

  getAllGroupOfficials: async (): Promise<GroupOfficial[]> => {
    const response = await apiClient.get('/api/v1/group-officials/getAll-groupsOfficials');
    return response.data.content || [];
  },
  
  getGroupOfficialById: async (officialId: number): Promise<GroupOfficial> => {
    const response = await apiClient.get(`/api/v1/group-officials/${officialId}`);
    return response.data;
  },
  
  createGroupOfficial: async (officialData: any): Promise<GroupOfficial> => {
    const response = await apiClient.post('/api/v1/group-officials/create', officialData);
    return response.data;
  },
  
  updateGroupOfficial: async (officialId: number, officialData: any): Promise<GroupOfficial> => {
    const response = await apiClient.put(`/api/v1/group-officials/update/${officialId}`, officialData);
    return response.data;
  },
  
  deleteGroupOfficial: async (officialId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/group-officials/${officialId}`);
  }
};
