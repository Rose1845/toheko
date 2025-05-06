import apiClient from './api';
import { 
  PaymentType,
  PaymentTypeRequest,
  AcknowledgementResponse 
} from '../types/api';

export type PaymentTypeFormValues = {
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
    
    console.log("Updating payment type with data:", paymentType);
    
    
    const payload = {
      ...paymentType,
      paymentTypeId: Number(paymentType.paymentTypeId)
    };
    
    
    const response = await apiClient.put('/api/v1/paymentTypes/update', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  createPaymentType: async (paymentType: PaymentTypeFormValues): Promise<AcknowledgementResponse> => {
    const response = await apiClient.post('/api/v1/paymentTypes/create', paymentType);
    return response.data;
  },
  
  deletePaymentType: async (id: number): Promise<AcknowledgementResponse> => {
    const response = await apiClient.delete(`/api/v1/paymentTypes/delete?paymentTypeId=${id}`);
    return response.data;
  }
};
