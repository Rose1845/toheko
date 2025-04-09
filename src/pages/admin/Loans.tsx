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

  // Get loan type name by ID
  const getLoanTypeName = (loanTypeId: number): string => {
    const loanType = loanTypes.find((type) => type.id === loanTypeId);
    return loanType ? loanType.name : "Unknown";
  };

  // Status badge variant
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
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Loans Management
          </h1>
          <p className="text-gray-500">
            View and manage all loan applications and loan types
          </p>
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
                        <TableHead>ID</TableHead>
                        <TableHead>Member ID</TableHead>
                        <TableHead>Loan Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Tenure (months)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loans.map((loan) => (
                        <TableRow key={loan.id}>
                          <TableCell>{loan.id}</TableCell>
                          <TableCell>{loan.memberId}</TableCell>
                          <TableCell>
                            {getLoanTypeName(loan.loanTypeId)}
                          </TableCell>
                          <TableCell>
                            KSH {loan.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{loan.tenure}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(loan.status)}>
                              {loan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              loan.applicationDate
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(loan)}
                            >
                              View Details
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
                    <p>{selectedLoan.id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Member ID</h3>
                    <p>{selectedLoan.memberId}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Loan Type</h3>
                    <p>{getLoanTypeName(selectedLoan.loanTypeId)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">
                      Application Date
                    </h3>
                    <p>
                      {new Date(
                        selectedLoan.applicationDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Amount</h3>
                    <p>KSH {selectedLoan.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Tenure</h3>
                    <p>{selectedLoan.tenure} months</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Status</h3>
                    <Badge variant={getStatusVariant(selectedLoan.status)}>
                      {selectedLoan.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Purpose</h3>
                  <p>{selectedLoan.purpose}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Loans;
