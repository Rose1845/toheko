import apiClient from './api';
import { AcknowledgementResponse, Member, MemberRequest, SuspensionRequest } from '../types/api';

export const memberService = {
  getAllMembers: async (): Promise<Member[]> => {
    const response = await apiClient.get('/api/v1/members/findAll');
    return response.data.content;
  },

  getMemberById: async (id: number): Promise<Member> => {
    const response = await apiClient.get(`/api/v1/members/findByMemberId?memberId=${id}`);
    return response.data;
  },

  createMember: async (member: MemberRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.post('/api/v1/members/create', member);
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
  },

  deleteMember: async (memberId: number): Promise<AcknowledgementResponse> => {
    const response = await apiClient.delete(`/api/v1/members/delete?memberId=${memberId}`);
    return response.data;
  }
};