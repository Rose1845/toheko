
import apiClient from './api';
import { 
  LoanType, 
  LoanApplicationRequest, 
  LoanApplication, 
  AcknowledgementResponse, 
  AcknowledgementResponseObject,
  LoanApprovalRequest, 
  Member
} from '../types/api';

export const loanService = {
  // Loan Types
  getAllLoanTypes: async (): Promise<LoanType[]> => {
    const response = await apiClient.get('/api/v1/loan-types');
    console.log({response});
    
    return response.data.content;
  },
  createLoanApplication: async (data): Promise<LoanApplicationRequest>=>{
    const response = await apiClient.post(`/api/v1/loans/apply`, data);
    return response.data;
  },

  getLoanTypeById: async (id: number): Promise<LoanType> => {
    const response = await apiClient.get(`/api/v1/loan-types/${id}`);
    return response.data;
  },

   getLoanMemberById: async (id: number): Promise<Member> => {
      const response = await apiClient.get(`/api/v1/members/${id}`);
    
      return response.data;
    },

  updateLoanType: async (id: number, loanType: LoanType): Promise<AcknowledgementResponseObject> => {
    const response = await apiClient.put(`/api/v1/loan-types/${id}`, loanType);
    return response.data;
  },

  deleteLoanType: async (id: number): Promise<AcknowledgementResponseObject> => {
    const response = await apiClient.delete(`/api/v1/loan-types/${id}`);
    return response.data;
  },

  // Loan Applications
  getAllLoanApplications: async (): Promise<LoanApplication[]> => {
    const response = await apiClient.get('/api/v1/loans/findAll');
    return response.data.content;
  },

  getLoanApplicationById: async (id: number): Promise<LoanApplication> => {
    const response = await apiClient.get(`/api/v1/loans/${id}`);
    return response.data;
  },

  updateLoanApplication: async (application: LoanApplicationRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put('/api/v1/loans/updated', application);
    return response.data;
  },

  // Loan Approvals
  updateLoanApproval: async (approval: LoanApprovalRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put('/api/v1/loan-approvals/updated', approval);
    return response.data;
  }
};
