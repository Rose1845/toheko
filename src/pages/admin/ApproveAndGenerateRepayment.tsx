import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { LoanApplication } from "@/types/api";

type LoanApplicationType = {
  id: number;
  amount: number;
  interestRate: number;
  termInMonths: number;
  startDate: string; // or Date
  interestMethod: string;
};

const ApproveAndGenerateRepayment = ({
  loan,
  approverId,
}: {
  loan: LoanApplication;
  approverId: number;
}) => {
  const [approvalComments, setApprovalComments] = useState("");
  const [approvalReason, setApprovalReason] = useState("");
  const [approvalOutcome, setApprovalOutcome] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

  const handleApproveLoan = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this loan?"
    );
    if (!confirmed) return;

    if (!approvalComments || !approvalReason || !approvalOutcome) {
      toast({
        title: "Validation Error",
        description:
          "Please fill out all required fields before approving the loan.",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(
        "https://sacco-app-production.up.railway.app/api/v1/loan-approvals/approved",
        {
          loanApplicationId: loan.loanApplicationId,
          approverId: approverId,
          approvalDate: new Date().toISOString(),
          approvalStatus: "Approved", // not "Pending" anymore
          approvalType: "STANDARD_APPROVAL",
          approvalReason: approvalReason,
          approvalWorkflowStage: "FINAL",
          approvalDuration: 0,
          approvalComments: approvalComments,
          approvalOutcome: approvalOutcome,
          approvalRating: 5,
          approvalTimestamp: new Date().toISOString(),
          approvalNotes: approvalNotes,
          approvalOutcomeReason: "Meets all loan conditions.",
        }
      );

      toast({
        title: "Loan Approved",
        description: "The loan has been approved successfully.",
      });
    } catch (error) {
      console.error("Error approving loan:", error);
      toast({
        title: "Error",
        description: "Failed to approve the loan.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="approvalComments"
          className="block text-sm font-medium text-gray-700"
        >
          Approval Comments
        </label>
        <textarea
          id="approvalComments"
          value={approvalComments}
          onChange={(e) => setApprovalComments(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label
          htmlFor="approvalReason"
          className="block text-sm font-medium text-gray-700"
        >
          Approval Reason
        </label>
        <input
          type="text"
          id="approvalReason"
          value={approvalReason}
          onChange={(e) => setApprovalReason(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label
          htmlFor="approvalOutcome"
          className="block text-sm font-medium text-gray-700"
        >
          Approval Outcome
        </label>
        <input
          type="text"
          id="approvalOutcome"
          value={approvalOutcome}
          onChange={(e) => setApprovalOutcome(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label
          htmlFor="approvalNotes"
          className="block text-sm font-medium text-gray-700"
        >
          Approval Notes (Optional)
        </label>
        <input
          type="text"
          id="approvalNotes"
          value={approvalNotes}
          onChange={(e) => setApprovalNotes(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="flex gap-4">
        <Button onClick={handleApproveLoan}>Approve Loan</Button>
      </div>
    </div>
  );
};

export default ApproveAndGenerateRepayment;
