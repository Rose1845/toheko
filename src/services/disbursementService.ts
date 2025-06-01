import axios from "axios";
import { Disbursement, DisbursementRequest, DisbursementCompleteRequest, DisbursementFailCancelRequest } from "@/types/api";

const API_URL = "https://sacco-app-production.up.railway.app/api/v1";

export const disbursementService = {
  // Get all disbursements
  getAllDisbursements: async (): Promise<Disbursement[]> => {
    const response = await axios.get(`${API_URL}/disbursements`);
    return response.data.data;
  },

  // Get disbursement by ID
  getDisbursementById: async (id: number): Promise<Disbursement> => {
    const response = await axios.get(`${API_URL}/disbursements/${id}`);
    return response.data;
  },

  // Get disbursements by status
  getDisbursementsByStatus: async (status: string): Promise<Disbursement[]> => {
    const response = await axios.get(`${API_URL}/disbursements/by-status/${status}`);
    return response.data.data;
  },

  // Get disbursements by loan application ID
  getDisbursementsByLoanApplication: async (loanApplicationId: number): Promise<Disbursement[]> => {
    const response = await axios.get(`${API_URL}/disbursements/by-loan-application/${loanApplicationId}`);
    return response.data.data;
  },

  // Get disbursements by disbursed by
  getDisbursementsByDisbursedBy: async (disbursedBy: number): Promise<Disbursement[]> => {
    const response = await axios.get(`${API_URL}/disbursements/by-disbursed-by/${disbursedBy}`);
    return response.data.data;
  },

  // Get disbursements by date range
  getDisbursementsByDateRange: async (startDate: string, endDate: string): Promise<Disbursement[]> => {
    const response = await axios.get(`${API_URL}/disbursements/by-date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data;
  },

  // Get disbursements by code
  getDisbursementsByCode: async (code: string): Promise<Disbursement[]> => {
    const response = await axios.get(`${API_URL}/disbursements/by-code/${code}`);
    return response.data.data;
  },

  // Create new disbursement
  createDisbursement: async (disbursement: DisbursementRequest): Promise<Disbursement> => {
    const response = await axios.post(`${API_URL}/disbursements`, disbursement);
    return response.data;
  },

  // Update disbursement
  updateDisbursement: async (id: number, disbursement: DisbursementRequest): Promise<Disbursement> => {
    const response = await axios.put(`${API_URL}/disbursements/${id}`, disbursement);
    return response.data;
  },

  // Delete disbursement
  deleteDisbursement: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/disbursements/${id}`);
  },

  // Process disbursement
  processDisbursement: async (id: number): Promise<Disbursement> => {
    const response = await axios.put(`${API_URL}/disbursements/${id}/process`);
    return response.data;
  },

  // Complete disbursement
  completeDisbursement: async (id: number, data: DisbursementCompleteRequest): Promise<Disbursement> => {
    const response = await axios.put(`${API_URL}/disbursements/${id}/complete`, null, {
      params: {
        paymentReference: data.paymentReference
      }
    });
    return response.data;
  },

  // Fail disbursement
  failDisbursement: async (id: number, data: DisbursementFailCancelRequest): Promise<Disbursement> => {
    const response = await axios.put(`${API_URL}/disbursements/${id}/fail`, null, {
      params: {
        remarks: data.remarks
      }
    });
    return response.data;
  },

  // Cancel disbursement
  cancelDisbursement: async (id: number, data: DisbursementFailCancelRequest): Promise<Disbursement> => {
    const response = await axios.put(`${API_URL}/disbursements/${id}/cancel`, null, {
      params: {
        remarks: data.remarks
      }
    });
    return response.data;
  },
};
