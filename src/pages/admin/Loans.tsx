/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { loanService } from "@/services/loanService";
import { LoanApplication, LoanProduct } from "@/types/api";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { memberService } from "@/services/memberService";
import { paymentTypeService } from "@/services/paymentTypeService";
import axios from "axios";
import { Column, DataTable } from "@/components/ui/data-table";
import { Loader2, PiggyBank, Plus } from "lucide-react";
import ApproveAndGenerateRepayment from "./ApproveAndGenerateRepayment";
import LoanApplicationForm from "./loans/LoanApplication";
import { useForm } from "react-hook-form";
import LoanDetailsModal from "./LoanDetailsModal";
import ReviewLoanModal from "./ReviewLoanModal";
import LoanStatsCards from "@/components/dashboard/LoanStatsCards";

const Loans = () => {
  const [showForm, setShowForm] = useState(false);
  const [editLoan, setEditLoan] = useState<LoanApplication | null>(null);
  const [open, setOpen] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [decision, setDecision] = useState("APPROVE");
  const [showDisburseModal, setShowDisburseModal] = useState(false);

  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loanTypes, setLoanTypes] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(
    null
  );
  const [approveLoanId, setApproveLoanId] = useState<number | null>(null);
  const [disburseLoan, setDisburseLoan] = useState(null);
  const [disburseAccountId, setDisburseAccountId] = useState(null);
  const [disburseLoading, setDisburseLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("applications");
  const { toast } = useToast();
  const approveForm = useForm({ defaultValues: { comments: "" } });
  const disburseForm = useForm({ defaultValues: { amount: "", remarks: "" } });
  const [loanStats, setLoanStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: memberService.getAllMembers,
  });
  const getMemberName = (memberId: number) => {
    const member = members?.find((m) => m.memberId === memberId);
    return member ? `${member.firstName} ${member.lastName}` : "Unknown Member";
  };

  const { data: paymenttypes } = useQuery({
    queryKey: ["payment-types"],
    queryFn: paymentTypeService.getAllPaymentTypes,
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loansResponse, loanTypesData] = await Promise.all([
          loanService.getAllLoanApplications(page, pageSize, search),
          loanService.getAllLoanTypes(),
        ]);
        const loansData = loansResponse.content || loansResponse.data?.content || [];
        setLoans(loansData);
        setLoanTypes(loanTypesData);
        if (loansResponse.totalPages) setTotalPages(loansResponse.totalPages);
        else if (loansResponse.data?.totalPages) setTotalPages(loansResponse.data.totalPages);
      } catch (error) {
        console.error("Error fetching loan data:", error);
        toast({
          title: "Error fetching loan data",
          description: "There was an error loading the loans information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, page, pageSize, search]);

  useEffect(() => {
    const fetchLoanStats = async () => {
      try {
        const stats = await loanService.getLoanDashboardSummary();
        setLoanStats(stats);
      } catch (error) {
        // Optionally handle error
      }
    };
    fetchLoanStats();
  }, []);

  const handleViewDetails = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setShowDetails(true);
  };

  const getLoanTypeName = (loanTypeId: number): string => {
    const loanType = loanTypes.find((type) => type.id === loanTypeId);
    return loanType ? loanType.name : "Unknown";
  };

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case "Approved":
        return "default";
      case "Pending":
        return "secondary";
      case "Rejected":
        return "destructive";
      case "Closed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleGenerateRepaymentSchedule = async (loan: LoanApplication) => {
    console.log("loan", loan);

    const confirmed = window.confirm(
      "Are you sure you want to generate the repayment schedule?"
    );
    if (!confirmed) return;

    try {
      const params = {
        loanId: loan.loanApplicationId as unknown as string,
        loanAmount: loan.amount,
        interestRate: Number(12), // Fixed interest rate as 12
        termInMonths: loan.termDays,
        startDate: new Date().toISOString().split("T")[0],
        interestMethod: "REDUCING_BALANCE",
      };

      console.log("params", params);

      const queryString = new URLSearchParams(params as any).toString();

      const url = `https://sacco-app-production.up.railway.app/api/v1/repayment-schedules/generate?${queryString}`;

      const repayment = await axios.post(`${url}`);

      console.log("repayment", repayment.data);

      toast({
        title: "Repayment Schedule Generated",
        description: "The repayment schedule has been successfully generated.",
      });
    } catch (error) {
      console.error("Error generating repayment schedule:", error);
      toast({
        title: "Error",
        description: "Failed to generate repayment schedule.",
        variant: "destructive",
      });
    }
  };

  const handleOpenReviewModal = (loanId: number) => {
    setApproveLoanId(loanId);
    setDecision("APPROVE");
    setShowApproveModal(true);
  };

  const handleReviewSubmit = async (data) => {
    if (!approveLoanId) return;
    try {
      await loanService.submitLoanApprovalDecision({
        applicationId: approveLoanId,
        decision: decision === "APPROVE" ? "APPROVE" : "REJECT",
        comments: data.comments,
        approverType: userRole,
        approverUserId: Number(userId),
      });
      toast({ title: `Loan ${decision === "APPROVE" ? "Approved" : "Rejected"}` });
      setShowApproveModal(false);
      setApproveLoanId(null);
      approveForm.reset();
      // Refresh loans
      const updatedLoans = await loanService.getAllLoanApplications();
      setLoans(updatedLoans);
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${decision.toLowerCase()} loan.`, variant: "destructive" });
    }
  };

  const handleOpenDisburseModal = async (loan) => {
    setDisburseLoan(loan);
    disburseForm.reset({ amount: loan.amount, remarks: '' });
    setDisburseLoading(true);
    try {
      const response = await loanService.fetchLoanAccountByApplicationId(loan.loanApplicationId);
      setDisburseAccountId(response.id);
      setShowDisburseModal(true);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch loan account.', variant: 'destructive' });
    } finally {
      setDisburseLoading(false);
    }
  };

  const handleDisburseSubmit = async (data) => {
    if (!disburseAccountId) return;
    setDisburseLoading(true);
    try {
      await loanService.disburseLoanAccount({
        loanAccountId: disburseAccountId,
        amount: Number(data.amount),
        remarks: data.remarks,
      });
      toast({ title: 'Loan Disbursed', description: 'Loan has been successfully disbursed.' });
      setShowDisburseModal(false);
      setDisburseLoan(null);
      disburseForm.reset();
      // Refresh loans
      const updatedLoans = await loanService.getAllLoanApplications();
      setLoans(updatedLoans);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to disburse loan.', variant: 'destructive' });
    } finally {
      setDisburseLoading(false);
    }
  };

  // Get userId and role from localStorage
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");

  const columns: Column<LoanApplication>[] = [
    {
      header: "ID",
      accessorKey: "loanApplicationId",
      sortable: true,
    },
    {
      header: "Member",
      accessorKey: "memberId",
      sortable: true,
      cell: (saving) => {
        const member = members?.find((m) => m.memberId === saving.memberId);
        return (
          <span className="font-medium">
            {member
              ? `${member.firstName} ${member.lastName}`
              : `Member #${saving.memberId}`}
          </span>
        );
      },
    },
    {
      header: "loanApplicationCode",
      accessorKey: "loanApplicationCode",
      sortable: true,
      cell: (loan) => (
        <span className="font-medium">{loan?.loanApplicationCode}</span>
      ),
    },
        {
      header: "Amount",
      accessorKey: "amount",
      sortable: true,
      cell: (loan) => (
        <span className="font-medium">{loan?.amount}</span>
      ),
    },
    {
      header: "termDays",
      accessorKey: "termDays",
      sortable: true,
      cell: (loan) => <span>{loan?.termDays || "--"}</span>,
    },

    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (loan) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            loan.status === "PENDING"
              ? "bg-blue-100 text-blue-800"
              : loan.status === "DISBURSED"
              ? "bg-green-100 text-green-800"
              : loan.status === "REJECTED"
              ? "bg-red-100 text-red-800"
              : loan.status === "APPROVED"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {loan?.status}
        </span>
      ),
    },
            {
          header: "Created Date",
          accessorKey: "createDate",
          sortable: true,
          cell: (loan) => (
            <span>{format(new Date(loan.createDate), "dd/MM/yyyy")}</span>
          ),
        },
    // {
    //   header: "Actions",
    //   accessorKey: "loanApplicationId",
    //   cell: (loan) => (
    //     <div className="flex space-x-2 justify-end">
    //       <Button
    //         variant="ghost"
    //         size="sm"
    //         onClick={() => handleViewDetails(loan)}
    //       >
    //         View
    //       </Button>

    //       <Button
    //         variant="ghost"
    //         size="sm"
    //         onClick={() => {
    //           setEditLoan(loan);
    //           setShowForm(true);
    //         }}
    //       >
    //         Edit
    //       </Button>

    //       {/* {loan.loanStatus === "Pending" && (
    //         <Button
    //           variant="secondary"
    //           size="sm"
    //           onClick={() => handleGenerateRepaymentSchedule(loan)}
    //         >
    //           Generate Repayment Schedule
    //         </Button>
    //       )}

    //       {loan.loanStatus === "Pending" && (
    //         <Dialog open={open} onOpenChange={setOpen}>
    //           <DialogTrigger asChild>
    //             <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    //               Approve
    //             </button>
    //           </DialogTrigger>
    //           <DialogContent className="max-w-2xl">
    //             <DialogHeader>
    //               <DialogTitle>Loan Approval</DialogTitle>
    //             </DialogHeader>
    //             <ApproveAndGenerateRepayment loan={loan} approverId={1} />
    //           </DialogContent>
    //         </Dialog>
    //       )} */}
    //     </div>
    //   ),
    // },
 {
    header: "Actions",
    accessorKey: "loanApplicationId",
    cell: (loan) => (
      <div className="flex gap-2">
        <Button
          className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded px-3 py-1 transition-all duration-150 shadow-none"
          size="sm"
          onClick={() => handleViewDetails(loan)}
          title="View Details"
        >
          View
        </Button>
        <Button
          className={`bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 rounded px-3 py-1 transition-all duration-150 shadow-none ${loan.status !== "PENDING" ? 'opacity-50 cursor-not-allowed' : ''}`}
          size="sm"
          onClick={() => {
            setEditLoan(loan);
            setShowForm(true);
          }}
          disabled={loan.status !== "PENDING"}
          title="Edit Loan"
        >
          Edit
        </Button>
        {(loan.status === "PENDING" || loan.status === "UNDER_REVIEW") &&
          ["ADMIN", "LOAN_OFFICIAL"].includes(userRole) && (
            <Button
              className="bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 rounded px-3 py-1 transition-all duration-150 shadow-none"
              size="sm"
              onClick={() => handleOpenReviewModal(loan.loanApplicationId)}
              title="Review Loan"
            >
              Review
            </Button>
          )}
      {loan.status === "APPROVED" && userRole === "ADMIN" && (
        <Button
          className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded px-3 py-1 transition-all duration-150 shadow-none"
          size="sm"
          onClick={() => handleOpenDisburseModal(loan)}
          disabled={disburseLoading}
          title="Disburse Loan"
        >
          Disburse
        </Button>
      )}
    </div>
  ),
},
  ];

  const loantypescolumns: Column<LoanProduct>[] = [
    {
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },

    {
      header: "Name",
      accessorKey: "name",
      sortable: true,
      cell: (loant) => <span className="font-medium">{loant?.name}</span>,
    },
    {
      header: "MinAmount",
      accessorKey: "minAmount",
      sortable: true,
      cell: (loant) => <span>{loant?.minAmount}</span>,
    },
    {
      header: "Maximum AMount",
      accessorKey: "maxAmount",
      sortable: true,
      cell: (loant) => <span>{loant.maxAmount}</span>,
    },
    {
      header: "InterestRate",
      accessorKey: "interestRate",
      sortable: true,
      cell: (loant) => <span>{loant?.interestRate}</span>,
    },
    {
      header: "Interest Method",
      accessorKey: "interestMethod",
      sortable: true,
      cell: (loant) => <span>{loant?.interestMethod}</span>,
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (loant) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            // onClick={() => handleViewDetails(loan)}
          >
            View
          </Button>

          <Button
            variant="ghost"
            size="sm"
            // onClick={() => {
            //   setEditLoan(loan);
            //   setShowForm(true);
            // }}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];
  // Fetch loan details by application ID
  const [loanDetails, setLoanDetails] = useState(null);
  const fetchLoanDetails = async (applicationId) => {
    try {
      const response = await loanService.getLoanApplicationById(applicationId);
      setLoanDetails(response);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch loan details.", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (showDetails && selectedLoan) {
      fetchLoanDetails(selectedLoan.loanApplicationId);
    }
  }, [showDetails, selectedLoan]);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Loans Management
            </h1>
            <p className="text-gray-500">
              View and manage all loan applications and loan types
            </p>
          </div>
        </div>
        </div>
        {/* Loan Stats Cards */}
        <LoanStatsCards loanStats={loanStats} />

        <div className="flex justify-end mb-4">
               <div className="text-center mt-5">
                    <Button 
                      onClick={() => setShowForm(true)} 
                      size="lg"
                      // className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Start New Loan Application
                    </Button>
                  </div>
          <LoanApplicationForm  showForm={showForm} setShowForm={setShowForm} editLoan={editLoan}  />
        </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Loan Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={loans}
                  columns={columns}
                  keyField="loanApplicationId"
                  pagination={false}
                  searchable={true}
                  pageSize={10}
                  emptyMessage="No loans found"
                  loading={searchLoading}
                  onSearch={async (searchValue) => {
                    setSearchLoading(true);
                    const [loansResponse] = await Promise.all([
                      loanService.getAllLoanApplications(page, pageSize, searchValue)
                    ]);
                    const loansData = loansResponse.content || loansResponse.data?.content || [];
                    setLoans(loansData);
                    if (loansResponse.totalPages) setTotalPages(loansResponse.totalPages);
                    else if (loansResponse.data?.totalPages) setTotalPages(loansResponse.data.totalPages);
                    setSearchLoading(false);
                  }}
                />
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
                      Previous
                    </Button>
                    <span className="mx-2">Page {page} of {totalPages}</span>
                    <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  </div>
                  <div>
                    <label className="mr-2">Rows per page:</label>
                    <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="border rounded px-2 py-1">
                      {[10, 20, 50, 100].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
      

        <LoanDetailsModal 
          open={showDetails}
          onOpenChange={setShowDetails}
          loanDetails={loanDetails}
          getMemberName={getMemberName}
        />

        <ReviewLoanModal
          open={showApproveModal}
          onOpenChange={setShowApproveModal}
          approveForm={approveForm}
          handleReviewSubmit={handleReviewSubmit}
          decision={decision}
          setDecision={setDecision}
          disburseLoading={disburseLoading}
        />

        <Dialog open={showDisburseModal} onOpenChange={setShowDisburseModal}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Disburse Loan</DialogTitle>
              <DialogDescription>Enter the amount and remarks to disburse this loan.</DialogDescription>
            </DialogHeader>
            <form onSubmit={disburseForm.handleSubmit(handleDisburseSubmit)}>
              <div className="mb-4">
                <label className="block mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full border rounded p-2"
                  {...disburseForm.register("amount", { required: true })}
                  placeholder="Enter amount"
                />
                <label className="block mb-1 mt-2">Remarks</label>
                <textarea
                  className="w-full border rounded p-2"
                  {...disburseForm.register("remarks")}
                  placeholder="Enter remarks (optional)"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowDisburseModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="secondary" disabled={disburseLoading}>
                  Disburse
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Loans;
