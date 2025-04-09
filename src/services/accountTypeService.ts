
import apiClient from './api';
import { 
  AccountType, 
  AccountTypeDTO,
  AcknowledgementResponse
} from '../types/api';

export const accountTypeService = {
  getAllAccountTypes: async (): Promise<AccountType[]> => {
    const response = await apiClient.get('/api/v1/account-types');
    return response.data;
  },

  getAccountTypeById: async (id: number): Promise<AccountType> => {
    const response = await apiClient.get(`/api/v1/account-types/${id}`);
    return response.data;
  },

  createAccountType: async (accountType: AccountTypeDTO): Promise<AcknowledgementResponse> => {
    const response = await apiClient.post('/api/v1/account-types', accountType);
    return response.data;
  },

  updateAccountType: async (id: number, accountType: AccountTypeDTO): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put(`/api/v1/account-types/${id}`, accountType);
    return response.data;
  },

  deleteAccountType: async (id: number): Promise<AcknowledgementResponse> => {
    const response = await apiClient.delete(`/api/v1/account-types/${id}`);
    return response.data;
  }
};
