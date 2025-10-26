import apiClient from '../api';

// Member details interface based on the API response
export interface MemberDetails {
  createdAt: string;
  updatedAt: string;
  version: number;
  memberId: number;
  firstName: string;
  lastName: string;
  otherNames: string | null;
  position: string | null;
  memberNo: string;
  nationalId: string;
  gender: string | null;
  address: string;
  email: string;
  phoneNumber: string;
  dob: string | null;
  hashedPhoneNumber: string;
  status: string;
  suspensionReason: string | null;
  suspendedAt: string | null;
  reactivatedAt: string | null;
}

// User member service for the member dashboard
export const userMemberService = {
  // Get member details by member ID
  getMemberDetails: async (memberId: number): Promise<MemberDetails> => {
    try {
      const response = await apiClient.get(`/api/v1/members/findByMemberId?memberId=${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching member details:', error);
      throw error;
    }
  }
};
