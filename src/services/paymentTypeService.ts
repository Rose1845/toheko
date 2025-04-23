
import apiClient from './api';
import { 
  PaymentType,
  PaymentTypeRequest,
  AcknowledgementResponse 
} from '../types/api';
export type paymentTypeFormSchemaTYpe = {
  name: string;
  paymentDescription: string;
  paymentShortDesc: string;
 
};
export const paymentTypeService = {
  getAllPaymentTypes: async (): Promise<PaymentType[]> => {
    const response = await apiClient.get('/api/v1/paymentTypes/findAll');
    return response.data;
  },

  getPaymentTypeById: async (id: number): Promise<PaymentType> => {
    const response = await apiClient.get(`/api/v1/paymentTypes/${id}`);
    return response.data;
  },

  updatePaymentType: async (paymentType: PaymentTypeRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put('/api/v1/paymentTypes/update', paymentType);
    return response.data;
  },

  createPaymentTYpe: async (paymentType: paymentTypeFormSchemaTYpe): Promise<AcknowledgementResponse> => {
    const response = await apiClient.post('/api/v1/paymentTypes/create',paymentType);
    return response.data;
  }
};
