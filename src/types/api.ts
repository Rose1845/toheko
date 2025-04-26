/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AcknowledgementResponse {
  success: boolean;
  message: string;
}

export interface AcknowledgementResponseObject {
  success: boolean;
  message: string;
  object?: any;
}

export interface AuthenticationRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
    userFirstname: string,
    userLastname: string,
    userEmail: string,
    userPhoneNumber: string,
    userUsername: string,
    userPassword: string,
    userIdNumber: string,
    roleId: number;
}

export interface AuthenticationResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  userId: number;
  roles: string[];
}

export interface MemberRequest {
  memberId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  dateOfBirth: string;
  address: string;
  status: string;
}

export interface Member extends MemberRequest {
  memberNo: string;
  memberId: number;
  registrationDate: string;
}

export interface SuspensionRequest {
  reason: string;
  suspendedUntil?: string;
}

export interface LoanType {
  id: number;
  name: string;
  description: string;
  interestRate: number;
  maxAmount: number;
  minAmount: number;
  maxTenure: number;
  minTenure: number;
  isActive: boolean;
  interestMethod: string;
  status: string;
}

export interface LoanApplicationRequest {
  id?: number;
  loanPurpose: string;
  loanApplicationId: number;
  loanApplicationCode: string;
  loanAmount: number;
  memberId: number;
  paymentTypeId: number;
  monthlyRepayment: number;
  loanStatus: string;
  dateApplied: string;
  approvedDate: string | null;
  remarks: string;
}

export interface LoanApplication extends LoanApplicationRequest {
  id: number;
  applicationDate: string;
}

export interface LoanApprovalRequest {
  id?: number;
  loanApplicationId: number;
  approvedBy: number;
  approvalDate?: string;
  status: string;
  comments?: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  memberId: number;
  accountType: string;
  balance: number;
  status: string;
  dateCreated: string;
}

export interface AccountUpdateDTO {
  accountType: string;
  status: string;
}

export interface AccountSuspensionRequest {
  reason: string;
  suspendedUntil?: string;
}

export interface AccountType {
  id: number;
  name: string;
  description: string;
  interestRate: number;
  minimumBalance: number;
  monthlyFee: number;
  status: string;
}

export interface AccountTypeDTO {
  name: string;
  description: string;
  interestRate: number;
  minimumBalance: number;
  monthlyFee: number;
  status: string;
}

// Payment types
export interface Payment {
  id: number;
  memberId: number;
  amount: number;
  accountId: Account;
  paymentDate: string;
  paymentType: PaymentType;
  modeOfPaymentId: number;
  referenceNumber: string;
  phoneNumber: string;
  description?: string;
}

export interface PaymentUpdateDTO {
  amount: number;
  paymentTypeId: number;
  modeOfPaymentId: number;
  referenceNumber: string;
  status: string;
  description?: string;
}

export interface PaymentType {
  paymentTypeId: number;
  name: string;
  paymentShortDesc: string;
  paymentDescription: string;
}

export interface PaymentTypeRequest {
  paymentTypeId: number;
  name: string;
  paymentShortDesc: string;
  paymentDescription: string;
}

// Mode of Payment
export interface ModeOfPayment {
  id?: number;
  modeOfPaymentId: number;
  name: string;
  description: string;
  shortDescription?: string;
  status: string;
}

export interface ModeOfPaymentDto {
  name: string;
  description: string;
  status: string;
}

// Next of Kin
export interface NextOfKin {
  nextOfKinId: number;
  memberId: number;
  member: Member;
  firstName: string;
  lastName: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  address: string;
  status: string;
}

export interface NextOfKinRequestDTO {
  memberId: number;
  firstName: string;
  lastName: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  address: string;
}

// Permission types
export interface Permission {
  id: number;
  name: string;
  description: string;
  status: string;
}

export interface PermissionDTO {
  name: string;
  description: string;
  status: string;
}

// Board Member types
export interface BoardMember {
  id: number;
  memberId: number;
  position: string;
  createdAt: string;
  endDate?: string;
  status: string;
}

export interface BoardMemberRequest {
  id: number;
  memberId: number;
  position: string;
  createdAt: string;
  endDate?: string;
  status: string;
}

// Saving types
export interface Saving {
  id: number;
  memberId: number;
  savingAmount: number;
  savingDate: string;
  savingMethod: string;
  status: string;
}

export interface SavingRequest {
  id: number;
  memberId: number;
  savingAmount: number;
  savingDate: string;
  savingMethod: string;
  status: string;
}

// Role types
export interface Role {
  code: number;
  name: string;
  description: string;
  status: string;
}

export interface RoleDTO {
  name: string;
  description: string;
  status: string;
}
