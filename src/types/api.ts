/* eslint-disable @typescript-eslint/no-explicit-any */

import { Interface } from "node:readline";

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

export interface LoanProduct  {
  id: number;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  interestMethod: 'SIMPLE' | 'COMPOUND'; // add other methods if needed
  minTermDays: number;
  maxTermDays: number;
  gracePeriodDays: number;
  requiresCollateral: boolean;
  requiresGuarantor: boolean;
  requiresNextOfKin: boolean;
  allowPenalties: boolean;
  isActive: boolean;
  maxGuarantors: number;
  maxCollateralItems: number;
};

export interface LoanPenaltySetting  {
  id: number;
  loanProductId: number;
  penaltyType: 'NONE' | 'FIXED' | 'PERCENTAGE'; // extend with other types as needed
  penaltyValue: number;
  isActive: boolean;
};

export interface LoanCollateralItem  {
  id: number;
  loanApplicationId: number;
  type: string;
  description: string;
  estimatedValue: number;
  ownerName: string;
  ownerContact: string;
};

export interface LoanApplicationRequest {
  id?: number;
  loanPurpose: string;
  loanApplicationId: number;
  loanApplicationCode: string;
  loanAmount: number;
  memberId: number;
  paymentTypeId: number;
  loanTypeId: number;
  monthlyRepayment: number;
  loanStatus: string;
  dateApplied: string;
  approvedDate: string | null;
  remarks: string;
}

export type LoanGuarantor = {
  id: number;
  loanApplicationId: number;
  guarantorName: string;
  relationship: string;
  guarantorContact: string;
  guarantorIdNumber: string;
  guaranteedAmount: number;
};

export interface LoanPenalty {
  id: number;
  loanProductId: number;
  penaltyType: string;
  penaltyValue: number;
  isActive: boolean;
};



export interface LoanNextOfKin {
  id: number;
  loanApplicationId: number;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
};



export interface LoanApplication {
  id: number;
  loanProductId: number;
  applicantId: number;
  memberId: number;
  name: string;
  amount: number;
  termDays: number;
  guarantors: LoanGuarantor[];
  nextOfKin: LoanNextOfKin[];
  collateral: LoanCollateralItem[];
};




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

// Group interfaces
export interface Group {
  createDate: string;
  lastModified: string;
  createdBy: number;
  lastModifiedBy: number;
  version: number;
  groupId: number;
  groupName: string;
  groupType: string;
  registrationNumber: string;
  phoneNumber: string;
  email: string;
  physicalAddress: string;
  status: string;
  approvedAt: string;
  suspensionReason: string;
  suspendedAt: string;
  reactivatedAt: string;
}

export interface GroupRequest {
  groupName: string;
  groupType: string;
  registrationNumber: string;
  phoneNumber: string;
  email: string;
  physicalAddress: string;
  officials: GroupOfficial[];
}

export interface GroupOfficial {
  id?: number;
  createDate?: string;
  lastModified?: string;
  createdBy?: number;
  lastModifiedBy?: number;
  version?: number;
  name: string;
  phoneNumber: string;
  email: string;
  role: string;
  groupId?: number;
  group?: {
    groupId: number;
    groupName: string;
    groupType: string;
    registrationNumber: string;
    phoneNumber: string;
    email: string;
    physicalAddress: string;
    status: string;
  };
}

export interface GroupSuspensionRequest {
  reason: string;
  suspendedUntil?: string;
}

// export interface AccountType {
//   id: number;
//   name: string;
//   description: string;
//   interestRate: number;
//   minimumBalance: number;
//   monthlyFee: number;
//   status: string;
// }

// export interface AccountTypeDTO {
//   name: string;
//   description: string;
//   interestRate: number;
//   minimumBalance: number;
//   monthlyFee: number;
//   status: string;
// }

// types/api.ts (update the existing AccountTypeDTO definition)
export interface AccountType {
  id: number; // Maps to accountTypeId
  name: string;
  description: string;
  shortDescription: string | null;
  activationFee: number;
  createDate?: string;
  lastModified?: string | null;
  createdBy?: number | null;
  lastModifiedBy?: number | null;
  version?: number;
}

export interface AccountTypeDTO {
  name: string;
  description: string;
  shortDescription: string;
  activationFee: number; // Add this field
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
  roleCode: number;
  roleName: string;
  roleShortDesc: string;
  roleDescription: string;
  roleStatus: string;
  createDate?: string;
  lastModified?: string | null;
  createdBy?: number | null;
  lastModifiedBy?: number | null;
  permissions?: Array<{
    id: number;
    permissionName: string;
    permissionDescription: string;
  }>;
  version?: number;
}

export interface RoleDTO {
  roleName: string;
  roleDescription: string;
  roleStatus: string;
  permissionIds?: number[];
}

// Repayment types
export interface Repayment {
  id: number;
  repaymentCode: string;
  loanId: number;
  loanCode: string;
  memberName: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  penalty: number;
  dueDate: string;
  paymentDate: string | null;
  status: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'WAIVED' | 'CANCELLED';
  paymentReference: string;
  paymentMethod: string;
  receivedBy: number | null;
  receivedByName: string | null;
  remarks: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RepaymentRequest {
  id?: number;
  repaymentCode?: string;
  loanId: number;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  dueDate: string;
  status?: string;
  paymentReference?: string;
  paymentMethod?: string;
  receivedBy?: number;
  remarks?: string;
}

export interface RecordPaymentRequest {
  id: number;
  amount: number;
  paymentReference: string;
  paymentMethod: string;
  receivedBy: number;
  remarks?: string;
}

export interface WaiveRequest {
  id: number;
  remarks: string;
}

export interface CancelRequest {
  id: number;
  remarks: string;
}

// Disbursement interfaces
export interface Disbursement {
  id: number;
  disbursementCode: string;
  loanApplicationId: number;
  loanApplicationCode: string;
  memberName: string;
  amount: number;
  disbursementDate: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentReference: string;
  paymentMethod: string;
  bankAccount: string;
  mobileNumber: string;
  disbursedBy: number;
  disbursedByName: string;
  remarks: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DisbursementRequest {
  id?: number;
  disbursementCode: string;
  loanApplicationId: number;
  amount: number;
  disbursementDate: string;
  status?: string;
  paymentReference?: string;
  paymentMethod: string;
  bankAccount?: string;
  mobileNumber?: string;
  disbursedBy: number;
  remarks?: string;
  isActive?: boolean;
}

export interface DisbursementCompleteRequest {
  id: number;
  paymentReference: string;
}

export interface DisbursementFailCancelRequest {
  id: number;
  remarks: string;
}

// Repayment Schedule interfaces
export interface RepaymentSchedule {
  id: number;
  loanId: number;
  loanCode: string;
  memberName: string;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingPrincipal: number;
  paidAmount: number;
  status: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'WAIVED' | 'CANCELLED';
  paymentDate: string;
  remarks: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RepaymentScheduleRequest {
  id?: number;
  loanId: number;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  remainingPrincipal: number;
  paidAmount: number;
  status: string;
  paymentDate: string;
  remarks: string;
  isActive: boolean;
}

export interface GenerateScheduleRequest {
  loanId: number;
  loanAmount: number;
  interestRate: number;
  termInMonths: number;
  startDate: string;
  interestMethod: string;
}

export interface RecordSchedulePaymentRequest {
  id: number;
  amount: number;
  paymentDate: string;
  remarks?: string;
}
