
import apiClient from './api';
import { 
  ModeOfPayment,
  ModeOfPaymentDto,
  AcknowledgementResponse 
} from '../types/api';

export const modeOfPaymentService = {
  getAllModesOfPayment: async (): Promise<ModeOfPayment[]> => {
    const response = await apiClient.get('/api/v1/mode-of-payments');
    return response.data.content;
  },

  getModeOfPaymentById: async (id: number): Promise<ModeOfPayment> => {
    const response = await apiClient.get(`/api/v1/mode-of-payments/${id}`);
    return response.data;
  },

  updateModeOfPayment: async (id: number, modeOfPayment: ModeOfPaymentDto): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put(`/api/v1/mode-of-payments/update/${id}`, modeOfPayment);
    return response.data;
  }
};
