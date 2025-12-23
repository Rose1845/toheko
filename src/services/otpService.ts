import apiClient from './api';

interface OTPVerifyRequest {
  email: string;
  otp: string;
}

interface OTPSendRequest {
  email: string;
}

interface OTPResponse {
  responseCode: string;
  message: string;
  timestamp: string;
  requestId: string;
  data: any;
}

export const otpService = {
  verifyOTP: async (request: OTPVerifyRequest): Promise<OTPResponse> => {
    console.log("OTP Service - Verifying OTP:", request);
    const response = await apiClient.post('/api/v1/otp/verify', request);
    console.log("OTP Service - Verify Response:", response.data);
    return response.data;
  },

  sendOTP: async (request: OTPSendRequest): Promise<OTPResponse> => {
    console.log("OTP Service - Sending OTP:", request);
    const response = await apiClient.post('/api/v1/otp/send', request);
    console.log("OTP Service - Send Response:", response.data);
    return response.data;
  },
};
