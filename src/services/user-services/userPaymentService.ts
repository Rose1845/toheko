import apiClient from '../api';
import { AcknowledgementResponse } from '../../types/api';

// Types for the user payment flow
export interface Account {
  accountId: number;
  accountNumber: string;
  name: string;
  balance: number;
  status: string;
  member: {
    memberId: number;
    firstName: string;
    lastName: string;
  };
}

export interface PaymentType {
  paymentTypeId: number;
  name: string;
  paymentShortDesc: string;
}

export interface PaymentMode {
  modeOfPaymentId: number;
  name: string;
  description: string;
  shortDescription: string;
}

export interface PaymentRequest {
  amount: number;
  accountId: number;
  paymentTypeId: number;
  modeOfPaymentId: number;
  phoneNumber: string;
  remarks?: string;
}

export interface STKPushRequest {
  amount: string;
  phoneNumber: string;
  remarks: string;
  app: string;
  paymentReference: string;
  memberId: number;
}

export interface STKPushResponse {
  responseCode: string;
  message: string;
  timestamp: string;
  checkoutRequestID?: string;
}

export interface PaymentResponse {
  responseCode: string;
  message: string;
  timestamp: string;
  requestID: string;
}

// User payment service for the member dashboard
export const userPaymentService = {
  // Get accounts for the logged-in member
  getMemberAccounts: async (userId: number): Promise<Account[]> => {
    try {
      const response = await apiClient.get(`/api/v1/accounts/member/${userId}`);
      return response.data.content || response.data;
    } catch (error) {
      console.error('Error fetching member accounts:', error);
      throw error;
    }
  },

  // Get all payment types
  getPaymentTypes: async (): Promise<PaymentType[]> => {
    try {
      const response = await apiClient.get('/api/v1/paymentTypes/findAll');
      return response.data.content || response.data;
    } catch (error) {
      console.error('Error fetching payment types:', error);
      throw error;
    }
  },

  // Get all payment modes
  getPaymentModes: async (): Promise<PaymentMode[]> => {
    try {
      const response = await apiClient.get('/api/v1/mode-of-payments/all');
      return response.data.content || response.data;
    } catch (error) {
      console.error('Error fetching payment modes:', error);
      throw error;
    }
  },

  // Create a new payment
  createPayment: async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await apiClient.post('/api/v1/payments', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Initiate STK push for M-PESA payment
  initiateSTKPush: async (stkData: STKPushRequest): Promise<STKPushResponse> => {
    try {
      const response = await apiClient.post('/api/v1/result/request/lipampesa', stkData);
      return response.data;
    } catch (error) {
      console.error('Error initiating STK push:', error);
      throw error;
    }
  }
};
