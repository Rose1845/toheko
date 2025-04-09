
import apiClient from './api';
import { 
  Payment, 
  PaymentUpdateDTO,
  AcknowledgementResponse 
} from '../types/api';

export const paymentService = {
  getAllPayments: async (): Promise<Payment[]> => {
    const response = await apiClient.get('/api/v1/payments');
    return response.data.content;
  },

  getPaymentById: async (paymentId: number): Promise<Payment> => {
    const response = await apiClient.get(`/api/v1/payments/${paymentId}`);
    return response.data;
  },

  updatePayment: async (paymentId: number, payment: PaymentUpdateDTO): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put(`/api/v1/payments/${paymentId}`, payment);
    return response.data;
  },

  // Add additional payment-related methods as needed
};
