/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { loanService } from "@/services/loanService";
import { LoanApplication, LoanProduct, LoanType } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { memberService } from "@/services/memberService";
import { paymentTypeService } from "@/services/paymentTypeService";
import axios from "axios";
import { Column, DataTable } from "@/components/ui/data-table";
import { Loader2, PiggyBank } from "lucide-react";
import ApproveAndGenerateRepayment from "./ApproveAndGenerateRepayment";
import LoanApplicationForm from "./loans/LoanApplication";

const Disbursements = () => {
  const [showForm, setShowForm] = useState(false);
  const [editLoan, setEditLoan] = useState<LoanApplication | null>(null);
  const [open, setOpen] = useState(false);

  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loanTypes, setLoanTypes] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("applications");
  const { toast } = useToast();

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
        const [loansData, loanTypesData] = await Promise.all([
          loanService.getAllLoanApplications(),
          loanService.getAllLoanTypes(),
        ]);
        setLoans(loansData);
        setLoanTypes(loanTypesData);
      } catch (error) {
        console.error("Error fetching loan data:", error);
        toast({
          title: "Error fetching loan data",
          description:
            "There was an error loading the loans information. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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
  const handleApproveLoan = async (loanApplicationId: number) => {
    try {
      await loanService.approveLoan(loanApplicationId);
      toast({
        title: "Loan Approved",
        description: "The loan has been successfully approved.",
      });
      // Refresh loans
      const updatedLoans = await loanService.getAllLoanApplications();
      setLoans(updatedLoans);
    } catch (error) {
      console.error("Error approving loan:", error);
      toast({
        title: "Error",
        description: "Failed to approve the loan. Please try again.",
        variant: "destructive",
      });
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
        loanId: loan.id as unknown as string,
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

  const columns: Column<LoanApplication>[] = [
    {
      header: "ID",
      accessorKey: "id",
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
    // {
    //   header: "loanApplicationCode",
    //   accessorKey: "loanApplicationCode",
    //   sortable: true,
    //   cell: (loan) => (
    //     <span className="font-medium">{loan?.}</span>
    //   ),
    // },
    {
      header: "termDays",
      accessorKey: "termDays",
      sortable: true,
      cell: (loan) => <span>{loan?.termDays}</span>,
    },

    // {
    //   header: "Status",
    //   accessorKey: "loanStatus",
    //   sortable: true,
    //   cell: (loan) => (
    //     <span
    //       className={`px-2 py-1 rounded-full text-xs ${
    //         loan.loanStatus === "Pending"
    //           ? "bg-green-100 text-green-800"
    //           : loan.loanStatus === "COMPLETED"
    //           ? "bg-blue-100 text-blue-800"
    //           : "bg-red-100 text-red-800"
    //       }`}
    //     >
    //       {loan?.loanStatus}
    //     </span>
    //   ),
    // },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (loan) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(loan)}
          >
            View
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditLoan(loan);
              setShowForm(true);
            }}
          >
            Edit
          </Button>

          {/* {loan.loanStatus === "Pending" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleGenerateRepaymentSchedule(loan)}
            >
              Generate Repayment Schedule
            </Button>
          )}

          {loan.loanStatus === "Pending" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Approve
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Loan Approval</DialogTitle>
                </DialogHeader>
                <ApproveAndGenerateRepayment loan={loan} approverId={1} />
              </DialogContent>
            </Dialog>
          )} */}
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
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Loans Management
          </h1>
          <p className="text-gray-500">
            View and manage all loan applications and loan types
          </p>
        </div>

        <div className="flex justify-end mb-4">
          <LoanApplicationForm />
        </div>

        <Tabs
          defaultValue="applications"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-6"
        >
          <TabsList>
            <TabsTrigger value="applications">Loan Applications</TabsTrigger>
            <TabsTrigger value="types">Loan Products</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Loan Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading Loans...</span>
                  </div>
                ) : loans?.length === 0 ? (
                  <div className="text-center py-10">
                    <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">
                      No loans found
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Get started by applting a new loan.
                    </p>
                  </div>
                ) : (
                  <DataTable
                    data={loans}
                    columns={columns}
                    keyField="id"
                    pagination={true}
                    searchable={true}
                    pageSize={10}
                    pageSizeOptions={[5, 10, 25, 50]}
                    emptyMessage="No loans found"
                    loading={loading}
                    // onRowClick={(loan) => handleEdit(saving)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Loan Products</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading products...</span>
                  </div>
                ) : loanTypes?.length === 0 ? (
                  <div className="text-center py-10">
                    <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">
                      No products found
                    </h3>
                  </div>
                ) : (
                  <DataTable
                    data={loanTypes}
                    columns={loantypescolumns}
                    keyField="id"
                    pagination={true}
                    searchable={true}
                    pageSize={10}
                    pageSizeOptions={[5, 10, 25, 50]}
                    emptyMessage="No loanTypes found"
                    loading={loading}
                    // onRowClick={(loan) => handleEdit(saving)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Loan Application Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected loan application
              </DialogDescription>
            </DialogHeader>
            {selectedLoan && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Loan ID</h3>
                    <p>{selectedLoan.id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Member ID</h3>
                    <p>{selectedLoan.memberId}</p>
                  </div>
                  {/* <div>
                    <h3 className="font-medium text-gray-500">Loan Type</h3>
                    <p>{getLoanTypeName(selectedLoan.loanTypeId)}</p>
                  </div> */}

                  <div>
                    <h3 className="font-medium text-gray-500">Amount</h3>
                    <p>KSH {selectedLoan.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">
                      Monthly Repayment
                    </h3>
                    <p>KSH {selectedLoan.termDays.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Disbursements;
