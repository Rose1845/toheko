import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { loanService } from "@/services/loanService";
import { LoanApplication, LoanType } from "@/types/api";
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Loans = () => {
  const [showForm, setShowForm] = useState(false);
  const [editLoan, setEditLoan] = useState<LoanApplication | null>(null);

  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("applications");
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loansData, loanTypesData] = await Promise.all([
          loanService.getAllLoanApplications(),
          loanService.getAllLoanTypes(),
          // loanService.getLoanMemberById(),
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
      case "APPROVED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

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
          <Button
            onClick={() => {
              setShowForm(true);
              setEditLoan(null);
            }}
          >
            + Add Loan
          </Button>
        </div>

        <Tabs
          defaultValue="applications"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-6"
        >
          <TabsList>
            <TabsTrigger value="applications">Loan Applications</TabsTrigger>
            <TabsTrigger value="types">Loan Types</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Loan Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading loan applications...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>LoanApplicationCode</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Loan AMount</TableHead>
                        <TableHead>MonthlyRepayment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Applied</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((loan) => (
                        <TableRow key={loan.loanApplicationId}>
                          <TableCell>{loan.loanApplicationCode}</TableCell>
                          <TableCell>{loan.memberId}</TableCell>
                          <TableCell>
                            KSH {loan.loanAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            KSH {loan.monthlyRepayment.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(loan.loanStatus)}>
                              {loan.loanStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(loan.dateApplied).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Loan Types</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading loan types...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Interest Rate</TableHead>
                        <TableHead>Min Amount</TableHead>
                        <TableHead>Max Amount</TableHead>
                        <TableHead>Interest Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loanTypes.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell>{type.id}</TableCell>
                          <TableCell>{type.name}</TableCell>
                          <TableCell>{type.interestRate}%</TableCell>
                          <TableCell>
                            KSH {type.minAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            KSH {type.maxAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>{type.interestMethod}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                type.status === "ACTIVE"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {type.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                    <p>{selectedLoan.loanApplicationId}</p>
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
                    <h3 className="font-medium text-gray-500">
                      Application Date
                    </h3>
                    <p>
                      {new Date(selectedLoan.dateApplied).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Amount</h3>
                    <p>KSH {selectedLoan.loanAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">
                      Monthly Repayment
                    </h3>
                    <p>KSH {selectedLoan.monthlyRepayment.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Status</h3>
                    <Badge variant={getStatusVariant(selectedLoan.loanStatus)}>
                      {selectedLoan.loanStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Purpose</h3>
                  <p>{selectedLoan.loanPurpose}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Remarks</h3>
                  <p>{selectedLoan.remarks}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editLoan ? "Update Loan" : "New Loan"}</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const payload = {
                  memberId: Number(formData.get("memberId")),
                  loanApplicationId: formData.get("loanApplicationId"),
                  loanApplicationCode: formData.get("loanApplicationCode"),
                  dateApplied: formData.get("dateApplied"),
                  approvedDate: formData.get("approvedDate"),
                  loanStatus: formData.get("loanStatus"),
                  loanTypeId: Number(formData.get("loanTypeId")),
                  paymentTypeId: Number(formData.get("paymentTypeId")),
                  monthlyRepayment: Number(formData.get("monthlyRepayment")),
                  loanAmount: Number(formData.get("loanAmount")),
                  loanPurpose: formData.get("loanPurpose"),
                  remarks: formData.get("remarks"),
                };

                try {
                  if (editLoan) {
                    await loanService.updateLoanApplication(payload);
                    toast({ title: "Loan updated successfully." });
                  } else {
                    await loanService.createLoanApplication(payload);
                    toast({ title: "Loan added successfully." });
                  }
                  setShowForm(false);
                  setLoading(true); // Refresh
                  const data = await loanService.getAllLoanApplications();
                  setLoans(data);
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to submit loan.",
                    variant: "destructive",
                  });
                }
              }}
              className="grid gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Member ID
                </label>
                <input
                  type="text"
                  name="memberId"
                  defaultValue={editLoan?.memberId || ""}
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Type
                </label>
                <input
                  type="text"
                  name="paymentTypeId"
                  defaultValue={editLoan?.paymentTypeId || ""}
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loan Type
                </label>
                <select
                  name="loanTypeId"
                  defaultValue={editLoan?.loanTypeId || ""}
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                >
                  <option value="">Select Type</option>
                  {loanTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loan Amount
                </label>
                <input
                  type="number"
                  name="loanAmount"
                  defaultValue={editLoan?.loanAmount || ""}
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Monthy Repayment
                </label>
                <input
                  type="number"
                  name="monthlyRepayment"
                  defaultValue={editLoan?.monthlyRepayment || ""}
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loan Purpose
                </label>
                <textarea
                  name="loanPurpose"
                  defaultValue={editLoan?.loanPurpose || ""}
                  className="mt-1 block w-full border rounded-md p-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  defaultValue={editLoan?.remarks || ""}
                  className="mt-1 block w-full border rounded-md p-2"
                  rows={2}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit">
                  {editLoan ? "Update Loan" : "Add Loan"}
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
