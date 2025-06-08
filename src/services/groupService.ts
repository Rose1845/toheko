import apiClient from './api';
import { Group, GroupRequest, GroupSuspensionRequest, GroupOfficial, PaginatedResponse, GroupOfficialRequest } from '../types/api';

export const groupService = {
  getAllGroups: async (): Promise<PaginatedResponse<Group>> => {
    const response = await apiClient.get('/api/v1/groups/all-groups');
    return response.data; // Returns the full paginated response
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
    try {
      console.log(`🔄 Attempting to update group ${groupId} using the correct API endpoint`);
      
      // Using the exact API endpoint from the documentation:
      // PUT /api/v1/groups/update-group/{groupId}
      
      // Prepare the payload according to the API docs
      const payload = {
        groupName: groupData.groupName,
        groupType: groupData.groupType,
        registrationNumber: groupData.registrationNumber,
        email: groupData.email,
        phoneNumber: groupData.phoneNumber,
        physicalAddress: groupData.physicalAddress
      };
      
      console.log('📦 Update payload:', payload);
      console.log(`🛠 Using documented API endpoint: /api/v1/groups/update-group/${groupId}`);
      
      const response = await apiClient.put(
        `/api/v1/groups/update-group/${groupId}`,
        payload
      );
      
      console.log('✅ Update successful!');
      console.log('📄 Response data:', response.data);
      return response.data;
    } 
    catch (error) {
      console.error(`❌ Error in updateGroup for groupId ${groupId}:`, error);
      
      if (error.response) {
        console.error('⚠️ Error response data:', error.response.data);
        console.error('⚠️ Error status:', error.response.status);
      }
      
      throw error;
    }
  },

  deleteGroup: async (groupId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/groups/${groupId}`);
  },

  suspendGroup: async (groupId: number, suspensionData: GroupSuspensionRequest): Promise<void> => {
    try {
      // Make sure reason is a non-empty string
      if (!suspensionData.reason || typeof suspensionData.reason !== 'string') {
        throw new Error('Suspension reason is required and must be a string');
      }
      
      // According to the error, the API expects 'reason' as a request parameter, not in the body
      // So we'll use URL params instead of sending a JSON body
      const params = { reason: suspensionData.reason };
      
      console.log(`Suspending group ${groupId} with reason parameter:`, params.reason);
      
      // Send the request with the reason as a request parameter
      const response = await apiClient.patch(
        `/api/v1/groups/${groupId}/suspend`,
        null, // No request body
        { params } // The reason goes as a query parameter
      );
      
      console.log('Suspension response:', response.data);
    } catch (error) {
      console.error(`Error in suspendGroup for groupId ${groupId}:`, error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  },

  // Unsuspend a group
  unsuspendGroup: async (groupId: number): Promise<void> => {
    await apiClient.patch(`/api/v1/groups/${groupId}/unsuspend`);
  },

  approveGroup: async (groupId: number): Promise<void> => {
    await apiClient.patch(`/api/v1/groups/${groupId}/approve`);
  },

  // Group officials related services
  getGroupOfficials: async (groupId: number): Promise<PaginatedResponse<GroupOfficial>> => {
    const response = await apiClient.get(`/api/v1/group-officials/group/${groupId}`);
    return response.data; // Returns the full paginated response
  },

  getAllGroupOfficials: async (): Promise<PaginatedResponse<GroupOfficial>> => {
    const response = await apiClient.get('/api/v1/group-officials/getAll-groupsOfficials');
    return response.data; // Returns the full paginated response
  },
  
  getGroupOfficialById: async (officialId: number): Promise<GroupOfficial> => {
    const response = await apiClient.get(`/api/v1/group-officials/${officialId}`);
    return response.data;
  },
  
  createGroupOfficial: async (officialData: GroupOfficialRequest): Promise<GroupOfficial> => {
    const response = await apiClient.post('/api/v1/group-officials/create', officialData);
    return response.data;
  },
  
  updateGroupOfficial: async (officialId: number, officialData: GroupOfficialRequest): Promise<GroupOfficial> => {
    const response = await apiClient.put(`/api/v1/group-officials/update/${officialId}`, officialData);
    return response.data;
  },
  
  deleteGroupOfficial: async (officialId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/group-officials/${officialId}`);
  }
};
