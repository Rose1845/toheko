import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ReviewLoanModal = ({ open, onOpenChange, approveForm, handleReviewSubmit, decision, setDecision, disburseLoading }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>Review Loan</DialogTitle>
        <DialogDescription>Select a decision and enter comments (optional).</DialogDescription>
      </DialogHeader>
      <form onSubmit={approveForm.handleSubmit(handleReviewSubmit)}>
        <div className="mb-4">
          <label className="block mb-1">Decision</label>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="APPROVE"
                checked={decision === "APPROVE"}
                onChange={() => setDecision("APPROVE")}
              />
              Approve
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="REJECT"
                checked={decision === "REJECT"}
                onChange={() => setDecision("REJECT")}
              />
              Reject
            </label>
          </div>
          <label className="block mb-1">Comments</label>
          <textarea
            className="w-full border rounded p-2"
            {...approveForm.register("comments")}
            placeholder="Enter comments (optional)"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant={decision === "APPROVE" ? "secondary" : "destructive"} disabled={disburseLoading}>
            {decision === "APPROVE" ? "Approve" : "Reject"}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);

export default ReviewLoanModal;
