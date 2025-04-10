
import apiClient from './api';
import { NextOfKin, NextOfKinRequestDTO, AcknowledgementResponse } from '../types/api';

export const nextOfKinService = {
  getAllNextOfKins: async (): Promise<NextOfKin[]> => {
    const response = await apiClient.get('/api/v1/next-of-kin/getsAll');
    return response.data.content || [];
  },

  getNextOfKinById: async (nextOfKinId: number): Promise<NextOfKin> => {
    const response = await apiClient.get(`/api/v1/next-of-kin/${nextOfKinId}`);
    return response.data;
  },

  createNextOfKin: async (nextOfKin: NextOfKinRequestDTO): Promise<AcknowledgementResponse> => {
    const response = await apiClient.post('/api/v1/next-of-kin', nextOfKin);
    return response.data;
  },

  updateNextOfKin: async (nextOfKinId: number, nextOfKin: NextOfKinRequestDTO): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put(`/api/v1/next-of-kin/${nextOfKinId}`, nextOfKin);
    return response.data;
  },

  deleteNextOfKin: async (nextOfKinId: number): Promise<AcknowledgementResponse> => {
    const response = await apiClient.delete(`/api/v1/next-of-kin/${nextOfKinId}`);
    return response.data;
  }
};
