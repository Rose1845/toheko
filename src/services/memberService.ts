
import apiClient from './api';
import { AcknowledgementResponse, Member, MemberRequest, SuspensionRequest } from '../types/api';

export const memberService = {
  getAllMembers: async (): Promise<Member[]> => {
    const response = await apiClient.get('/api/v1/members/findAll');
    console.log({response});
    
    return response.data.content;
  },

  getMemberById: async (id: number): Promise<Member> => {
    const response = await apiClient.get(`/api/v1/members/${id}`);
  
    return response.data;
  },

  updateMember: async (member: MemberRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put('/api/v1/members/update', member);
    return response.data;
  },

  suspendMember: async (memberId: number, suspensionRequest: SuspensionRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put(`/api/v1/members/suspend/${memberId}`, suspensionRequest);
    return response.data;
  },

  reactivateMember: async (memberId: number): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put(`/api/v1/members/reactivate-member-suspend/${memberId}`);
    return response.data;
  }
};
