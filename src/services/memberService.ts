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

  suspendMember: async (memberId: number, payload: { reason: string }) => {
    const response = await apiClient.put(`/api/v1/members/suspend/${memberId}`, payload);
    return response.data;
  },

  reactivateMember: async (payload: { memmberId: number; activationReason: string }) => {
    const response = await apiClient.put(`/api/v1/members/reactivate-member`, payload);
    return response.data;
  },

  deleteMember: async (memberId: number): Promise<AcknowledgementResponse> => {
    const response = await apiClient.delete(`/api/v1/members/delete?memberId=${memberId}`);
    return response.data;
  },

  getMemberKpiStats: async (): Promise<any> => {
    const response = await apiClient.get('/api/v1/members/member-registration-kpi-history');
    return response.data;
  },

  getCounties: async (page = 0, size = 100): Promise<any> => {
    const response = await apiClient.get(`/api/v1/location/counties/search?page=${page}&size=${size}`);
    return response.data;
  },

  getLocationCounties: async (opts: { page?: number; size?: number } = { page: 0, size: 100 }): Promise<any> => {
    const page = opts.page ?? 0;
    const size = opts.size ?? 100;
    const response = await apiClient.get(`/api/v1/location/counties/search?page=${page}&size=${size}`);
    return response.data;
  },

  getConstituencies: async (countyCode: string, page = 0, size = 100): Promise<any> => {
    const response = await apiClient.get(`/api/v1/location/constituencies/search?countyCode=${encodeURIComponent(countyCode)}&page=${page}&size=${size}`);
    return response.data;
  },

  getLocationConstituencies: async (countyCode: string, opts: { page?: number; size?: number } = { page: 0, size: 100 }): Promise<any> => {
    const page = opts.page ?? 0;
    const size = opts.size ?? 100;
    const response = await apiClient.get(`/api/v1/location/constituencies/search?countyCode=${encodeURIComponent(countyCode)}&page=${page}&size=${size}`);
    return response.data;
  },

  getWards: async (constituencyCode: string, page = 0, size = 100): Promise<any> => {
    const response = await apiClient.get(`/api/v1/location/wards/search?constituencyCode=${encodeURIComponent(constituencyCode)}&page=${page}&size=${size}`);
    return response.data;
  },

  getLocationWards: async (constituencyCode: string, opts: { page?: number; size?: number } = { page: 0, size: 100 }): Promise<any> => {
    const page = opts.page ?? 0;
    const size = opts.size ?? 100;
    const response = await apiClient.get(`/api/v1/location/wards/search?constituencyCode=${encodeURIComponent(constituencyCode)}&page=${page}&size=${size}`);
    return response.data;
  },
};