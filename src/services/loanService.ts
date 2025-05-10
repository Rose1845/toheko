/* eslint-disable @typescript-eslint/no-explicit-any */

import apiClient from './api';
import { 
  LoanType, 
  LoanApplicationRequest, 
  LoanApplication, 
  AcknowledgementResponse, 
  AcknowledgementResponseObject,
  LoanApprovalRequest, 
  Member,
  LoanNextOfKin,
  LoanGuarantor,
  LoanCollateralItem,
  LoanProduct,
  LoanPenalty
} from '../types/api';

export const loanService = {
  // Loan Types
  getAllLoanTypes: async (): Promise<LoanProduct[]> => {
    const response = await apiClient.get('/api/v1/loan-products/getAll');
    console.log({response});
    
    return response.data.data.content;
  },

  getAllLoanNextOfKin: async (): Promise<LoanNextOfKin[]> => {
    const response = await apiClient.get('/api/v1/loan-next-of-kin');
    console.log({response});
    
    return response.data.content;
  },
  getAllLoanGUarantors: async (): Promise<LoanGuarantor[]> => {
    const response = await apiClient.get('/api/v1/loan-guarantors/getAll');
    console.log({response});
    
    return response.data.content;
  },

  getAllLoanCollaterals: async (): Promise<LoanCollateralItem[]> => {
    const response = await apiClient.get('/api/v1/loan-collaterals');
    console.log({response});
    
    return response.data.content;
  },

  createLoanApplication: async (data): Promise<LoanApplicationRequest>=>{
    const response = await apiClient.post(`/api/v1/loan-applications`, data);
    return response.data;
  },
  createLoanGuarantor: async (data): Promise<LoanGuarantor>=>{
    const response = await apiClient.post(`/api/v1/loan-guarantors/create`, data);
    return response.data;
  },
  createLoanCollateral: async (data): Promise<LoanCollateralItem>=>{
    const response = await apiClient.post(`/api/v1/loan-collaterals?page=0&size=1&sort=`, data);
    return response.data;
  },
  // updateLoanProduct: async (data): Promise<LoanProduct>=>{
  //   const response = await apiClient.post(`/api/v1/loan-products/update`, data);
  //   return response.data;
  // },
  createLoanProduct: async (data): Promise<LoanProduct>=>{
    const response = await apiClient.post(`/api/v1/loan-products/create`, data);
    return response.data;
  },


  createLoanPenanlty: async (data): Promise<LoanPenalty>=>{
    const response = await apiClient.post(`/api/v1/loan-products/create`, data);
    return response.data;
  },
  approveLoan: async (data): Promise<LoanApplicationRequest>=>{
    const response = await apiClient.post(`/api/v1/loans-approvals/approved`, data);
    return response.data;
  },
  generateRepaymentSchedule: async (data:any): Promise<any>=>{
    const response = await apiClient.post(`/api/v1/repayment-schedules/generate?data`);
    return response.data;
  },

  getLoanTypeById: async (id: number): Promise<LoanType> => {
    const response = await apiClient.get(`/api/v1/loan-products/${id}`);
    return response.data;
  },

   getLoanMemberById: async (id: number): Promise<Member> => {
      const response = await apiClient.get(`/api/v1/members/${id}`);
    
      return response.data;
    },

    updateLoanProduct: async (loanType: LoanProduct): Promise<AcknowledgementResponseObject> => {
    const response = await apiClient.put(`/api/v1/loan-products/update`, loanType);
    return response.data;
  },

  deleteLoanType: async (id: number): Promise<AcknowledgementResponseObject> => {
    const response = await apiClient.delete(`/api/v1/loan-products/delete/${id}`);
    return response.data;
  },

  // Loan Applications
  getAllLoanApplications: async (): Promise<LoanApplication[]> => {
    const response = await apiClient.get('/api/v1/loan-applications?page=0&size=1&sort=100000000000');
    return response.data.content;
  },

  getAllLoanPenalties: async (): Promise<LoanPenalty[]> => {
    const response = await apiClient.get('/api/v1/loan-penalties/getAll?page=0&size=20');
    return response.data.data.content;
  },

  getLoanApplicationById: async (id: number): Promise<LoanApplication> => {
    const response = await apiClient.get(`/api/v1/loan-applications/${id}`);
    return response.data;
  },
  getLoanPenaltyById: async (id: number): Promise<LoanApplication> => {
    const response = await apiClient.get(`/api/v1/loan-penalties/${id}`);
    return response.data;
  },

  updateLoanApplication: async (application: LoanApplicationRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put('/api/v1/loans/updated', application);
    return response.data;
  },

  updateLoanPenalty: async (application: LoanPenalty): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put('/api/v1/loan-penalties/update', application);
    return response.data;
  },

  // Loan Approvals
  updateLoanApproval: async (approval: LoanApprovalRequest): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put('/api/v1/loan-approvals/updated', approval);
    return response.data;
  }
};
