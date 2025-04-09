
import apiClient from './api';
import { Saving, SavingRequest, AcknowledgementResponse } from '../types/api';

export const savingService = {
  getAllSavings: async (): Promise<Saving[]> => {
    const response = await apiClient.get('/api/v1/saving/findAll');
    return response.data.content;
  },

  getSavingById: async (id: number): Promise<Saving> => {
    const response = await apiClient.get(`/api/v1/saving/findBySavingId/${id}`);
    return response.data;
  },

  createSaving: async (saving: SavingRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.post('/api/v1/saving/create', saving);
    return response.data;
  },

  updateSaving: async (saving: SavingRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put('/api/v1/saving/update', saving);
    return response.data;
  },

  deleteSaving: async (id: number): Promise<AcknowledgementResponse> => {
    const response = await apiClient.delete(`/api/v1/saving/deleteBySavingId/${id}`);
    return response.data;
  }
};
