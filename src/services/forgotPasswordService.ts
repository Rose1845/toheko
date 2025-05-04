import axios from 'axios';
import apiClient from './api';
const API_BASE_URL = apiClient.defaults.baseURL;

// Create a separate axios instance for public endpoints (no token required)
const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const forgotPasswordService = {
  verifyEmail: async (email: string) => {
    const response = await publicApiClient.post(`/api/v1/forgotPassword/verifyMail/${email}`);
    return response;
  },

  verifyOtp: async (email: string, otp: number) => {
    const response = await publicApiClient.post(`/api/v1/forgotPassword/verifyOtp/${otp}/${email}`);
    return response;
  },

  changePassword: async (email: string, password: string) => {
    const response = await publicApiClient.post(`/api/v1/forgotPassword/changePassword/${email}`, {
      password,
      repeatPassword: password,
    });
    return response;
  },
};