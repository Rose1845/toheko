
import apiClient from './api';
import { 
  Account, 
  AccountUpdateDTO, 
  AccountSuspensionRequest, 
  AcknowledgementResponse 
} from '../types/api';

// Interface for creating a new account
export interface CreateAccountRequest {
  memberId: number;
  accountTypeId: number;
  name: string;
  shortDescription: string;
  initialBalance: number;
}

export const accountService = {
  createAccount: async (accountData: CreateAccountRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.post('/api/v1/accounts', accountData);
    return response.data;
  },

  getAllAccounts: async (): Promise<Account[]> => {
    const response = await apiClient.get('/api/v1/accounts');
    return response.data.content;
  },

  getAccountById: async (id: number): Promise<Account> => {
    const response = await apiClient.get(`/api/v1/accounts/${id}`);
    return response.data;
  },

  updateAccount: async (id: number, account: AccountUpdateDTO): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put(`/api/v1/accounts/${id}`, account);
    return response.data;
  },

  deleteAccount: async (id: number): Promise<AcknowledgementResponse> => {
    const response = await apiClient.delete(`/api/v1/accounts/${id}`);
    return response.data;
  },

  suspendAccount: async (accountId: number, suspensionRequest: AccountSuspensionRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put(`/api/v1/accounts/${accountId}/suspend`, suspensionRequest);
    return response.data;
  },

  activateSuspendedAccount: async (accountId: number): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put(`/api/v1/accounts/${accountId}/activate-suspend`);
    return response.data;
  },

  // Get accounts for a specific member
  getMemberAccounts: async (memberId: number): Promise<Account[]> => {
    const response = await apiClient.get(`/api/v1/accounts/member/${memberId}`);
    return response.data.content || response.data;
  }
};
