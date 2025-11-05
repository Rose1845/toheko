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
    try {
      const response = await apiClient.get('/api/v1/loan-collaterals?page=0&size=100&sort=id,desc');
      console.log({response});
      
      // Check if we have the expected data structure
      if (response.data && response.data.data && response.data.data.content) {
        return response.data.data.content;
      } else if (response.data && response.data.content) {
        return response.data.content;
      } else {
        console.error('Unexpected response structure:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching loan collaterals:', error);
      return [];
    }
  },

  createLoanApplication: async (data): Promise<LoanApplicationRequest>=>{
    const response = await apiClient.post(`/api/v1/loan-applications`, data);
    return response.data;
  },
  createLoanGuarantor: async (data): Promise<LoanGuarantor>=>{
    const response = await apiClient.post(`/api/v1/loan-guarantors/create`, data);
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
    const response = await apiClient.post(`/api/v1/loan-penalties/create`, data);
    return response.data;
  },
  createLoanCollateral:  async (data): Promise<LoanCollateralItem>=>{
    const response = await apiClient.post(`/api/v1/loan-collaterals`, data);
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

  deleteLoanCollateral : async (id: number): Promise<AcknowledgementResponseObject> => {
    const response = await apiClient.delete(`/api/v1/loan-collaterals/${id}`);
    return response.data;
  },

  // Loan Applications
  // getAllLoanApplications: async (page = 1, size = 10, search = ""): Promise<any> => {
  //   const params = new URLSearchParams({
  //     page: String(page - 1),
  //     size: String(size),
  //   });
  //   if (search) params.append("search", search);
  //   const response = await apiClient.get(`/api/v1/loan-applications/get-all?${params.toString()}`);
  //   return response.data;
  // },

  getAllLoanApplications: async (params?: any): Promise<any> => {
    const urlParams = new URLSearchParams();
    if (params.page !== undefined) urlParams.append("page", String(params.page));
    if (params.size !== undefined) urlParams.append("size", String(params.size));
    if (params.minAmount) urlParams.append("minAmount", String(params.minAmount));
    if (params.maxAmount) urlParams.append("maxAmount", String(params.maxAmount));
    if (params.createdFrom) urlParams.append("createdFrom", params.createdFrom);
    if (params.createdTo) urlParams.append("createdTo", params.createdTo);
    if (params.search) urlParams.append("search", params.search);
    const response = await apiClient.get(`/api/v1/loan-applications/get-all?${urlParams.toString()}`);
    return response.data;
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

  updateLoanApplication: async (application: LoanApplication): Promise<AcknowledgementResponse> => {
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
  },

  // In loanService.ts
 updateLoanGuarantors: async (loanApplicationId: number, guarantors: any[]) => {
  const response = await apiClient.put(
    `/loan-applications/guarantors`,
    { guarantors }
  );
  return response.data;
},

  updateLoanCollateral: async (loanApplicationId: number, collateral: any[]): Promise<AcknowledgementResponse> => {
    const response = await apiClient.put('/api/v1/loan-collaterals/update', collateral);
    return response.data;
  },

 updateLoanNextOfKin: async (loanApplicationId: number, nextOfKin: any[]) => {
  const response = await apiClient.put(
    `/loan-applications/next-of-kin`,
    { nextOfKin }
  );
  return response.data;
},


  getLoanNextOfKinByLoanId: async (loanId: number): Promise<LoanNextOfKin[]> => {
    const response = await apiClient.get(`/api/v1/loan-next-of-kin?loanId=${loanId}`);
    return response.data.data.content;
  },

  getLoanCollateralByLoanId: async (loanId: number): Promise<LoanCollateralItem[]> => {
    const response = await apiClient.get(`/api/v1/loan-collaterals?loanId=${loanId}`);
    return response.data.data.content;
  },

  getLoanGuarantors: async (loanId: number): Promise<LoanGuarantor[]> => {
    const response = await apiClient.get(`/api/v1/loan-guarantors/getAll?loanId=${loanId}`);
    return response.data.data.content;
  },

  /**
   * Submit a loan approval or rejection decision
   * @param decisionData {object} - { loanApplicationId, decision, comments }
   * @returns {Promise<AcknowledgementResponse>}
   */
  submitLoanApprovalDecision: async (decisionData: {
    applicationId: number;
    decision: 'APPROVE' | 'REJECT';
    comments?: string;
    approverType?: string;
    approverUserId?: number;
  }): Promise<AcknowledgementResponse> => {
    const response = await apiClient.post(
      '/api/v1/loan-applications-approvals/decisions',
      decisionData
    );
    return response.data;
  },

  fetchLoanAccountByApplicationId: async (loanApplicationId: number) => {
    const response = await apiClient.get(`/api/v1/loan-accounts/fetch-loan-applicationId/${loanApplicationId}`);
    return response.data;
  },

  disburseLoanAccount: async (payload: { loanAccountId: number; amount: number; remarks: string }) => {
    const response = await apiClient.post('/api/v1/loan-disbursements/disburse', payload);
    return response.data;
  },

  // getAllLoanAccounts: async (page = 1, size = 10, search = ""): Promise<any> => {
  //   const params = new URLSearchParams({
  //     page: String(page - 1),
  //     size: String(size),
  //   });
  //   if (search) params.append("search", search);
  //   const response = await apiClient.get(`/api/v1/loan-accounts/get-all?${params.toString()}`);
  //   return response.data;
  // },

  getAllLoanAccounts: async (query: string): Promise<any> => {
    const response = await apiClient.get(`/api/v1/loan-accounts/get-all?${query}`);
    return response.data;
  },
  

  getLoanDashboardSummary: async (): Promise<any> => {
    const response = await apiClient.get('/api/v1/loan-applications/summary-dashboard');
    return response.data.body;
  },

  getLoanAccountKpi: async (): Promise<any> => {
    const response = await apiClient.get('/api/v1/loan-accounts/admin-loan-account-kpi');
    return response.data;
  }
  
};
