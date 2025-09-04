import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

const LoanDetailsModal = ({ open, onOpenChange, loanDetails, getMemberName }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Loan Application Details</DialogTitle>
          <DialogDescription>
            Complete information about the selected loan application
          </DialogDescription>
        </DialogHeader>
        {loanDetails && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-500">Loan ID</h3>
                <p>{loanDetails.loanApplicationId}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Loan Application Code</h3>
                <p>{loanDetails.loanApplicationCode}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Loan Product Code</h3>
                <p>{loanDetails.loanProductCode}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Member Name</h3>
                <p>{getMemberName(loanDetails.memberId)}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Amount</h3>
                <p>KSH {loanDetails.amount?.toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Term (Days)</h3>
                <p>{loanDetails.termDays}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Status</h3>
                <p>{loanDetails.status}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Created Date</h3>
                <p>{loanDetails.createDate ? format(new Date(loanDetails.createDate), "dd/MM/yyyy") : '--'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Purpose</h3>
                <p>{loanDetails.loanPurpose || '--'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Penalty Applicable</h3>
                <p>{loanDetails.penaltyApplicable ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Guarantor Applicable</h3>
                <p>{loanDetails.guarantorApplicable ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Collateral Applicable</h3>
                <p>{loanDetails.collateralApplicable ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Requires Next of Kin</h3>
                <p>{loanDetails.requiresNextOfKin ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Approval Date</h3>
                <p>{loanDetails.approvalDate ? format(new Date(loanDetails.approvalDate), "dd/MM/yyyy") : '--'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Admin Comments</h3>
                <p>{loanDetails.adminComments || '--'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Officer Approval Count</h3>
                <p>{loanDetails.officerApprovalCount || '--'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Admin Approval Count</h3>
                <p>{loanDetails.adminApprovalCount || '--'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Rejection Count</h3>
                <p>{loanDetails.rejectionCount || '--'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Last Decision</h3>
                <p>{loanDetails.lastDecision || '--'}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-500">Last Decided At</h3>
                <p>{loanDetails.lastDecidedAt ? format(new Date(loanDetails.lastDecidedAt), "dd/MM/yyyy") : '--'}</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LoanDetailsModal;
