import apiClient from './api';
import { 
  ModeOfPayment,
  ModeOfPaymentDto,
  AcknowledgementResponse 
} from '../types/api';

export interface ModeOfPaymentFormValues {
  name: string;
  description: string;
  shortDescription?: string;
}

export const modeOfPaymentService = {
  getAllModesOfPayment: async (): Promise<ModeOfPayment[]> => {
    const response = await apiClient.get('/api/v1/mode-of-payments/all');
    return response.data;
  },

  getModeOfPaymentById: async (id: number): Promise<ModeOfPayment> => {
    const response = await apiClient.get(`/api/v1/mode-of-payments/get/${id}`);
    return response.data;
  },

  createModeOfPayment: async (modeOfPayment: ModeOfPaymentFormValues): Promise<AcknowledgementResponse> => {
    const response = await apiClient.post('/api/v1/mode-of-payments/create', modeOfPayment);
    return response.data;
  },

  updateModeOfPayment: async (id: number, modeOfPayment: ModeOfPaymentFormValues): Promise<AcknowledgementResponse> => {
    // Using the correct endpoint format as shown in the API documentation
    const response = await apiClient.put(`/api/v1/mode-of-payments/update/${id}`, modeOfPayment);
    return response.data;
  },

  deleteModeOfPayment: async (id: number): Promise<AcknowledgementResponse> => {
    // Using the correct endpoint format as shown in the API documentation
    const response = await apiClient.delete(`/api/v1/mode-of-payments/delete/${id}`);
    return response.data;
  }
};
