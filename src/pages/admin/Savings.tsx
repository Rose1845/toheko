import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "./DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { paymentService } from "@/services/paymentService";
import { Payment } from "@/types/api";
import { DataTable, Column } from "@/components/ui/data-table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PiggyBank, Eye } from "lucide-react";

const Savings = () => {
  const { toast } = useToast();
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Query payments
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["savings-payments"],
    queryFn: () => paymentService.getAllPayments(0, 100),
  });

  const payments = paymentsData?.content || [];

  // Handle viewing payment details
  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  // Define columns for DataTable
  const columns: Column<Payment>[] = [
    {
      header: "ID",
      accessorKey: "paymentId",
      sortable: true,
    },
    {
      header: "Member",
      accessorKey: "account",
      sortable: true,
      cell: (payment) => {
        const member = payment.account?.member;
        return (
          <span className="font-medium">
            {member
              ? `${member.firstName} ${member.lastName}`
              : "N/A"}
          </span>
        );
      },
    },
    {
      header: "Account",
      accessorKey: "account",
      sortable: true,
      cell: (payment) => (
        <span className="text-sm text-muted-foreground">
          {payment.account?.accountNumber || "N/A"}
        </span>
      ),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      sortable: true,
      cell: (payment) => (
        <span className="font-medium">
          {new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
          }).format(payment.amount)}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "paymentDate",
      sortable: true,
      cell: (payment) => (
        <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
      ),
    },
    {
      header: "Payment Type",
      accessorKey: "paymentType",
      sortable: true,
      cell: (payment) => (
        <span className="capitalize">
          {payment.paymentType?.name || "N/A"}
        </span>
      ),
    },
    {
      header: "Method",
      accessorKey: "modeOfPayment",
      sortable: true,
      cell: (payment) => (
        <span className="capitalize">
          {payment.modeOfPayment?.name || "N/A"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (payment) => (
        <Badge
          variant="outline"
          className={
            payment.status === "COMPLETED"
              ? "bg-green-100 text-green-800 border-green-200"
              : payment.status === "PENDING"
              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
              : "bg-red-100 text-red-800 border-red-200"
          }
        >
          {payment.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "paymentId",
      cell: (payment) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleView(payment);
            }}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-2 py-3 sm:px-4 sm:py-4 md:py-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Savings Management</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                View member savings and payment transactions
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading savings...</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-10">
                <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No savings found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No payment records available.
                </p>
              </div>
            ) : (
              <DataTable
                data={payments}
                columns={columns}
                keyField="paymentId"
                pagination={true}
                searchable={true}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                emptyMessage="No savings found"
                loading={paymentsLoading}
                onRowClick={(payment) => handleView(payment)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              View payment transaction information
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="font-medium">{selectedPayment.paymentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedPayment.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : selectedPayment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {selectedPayment.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">
                    {new Intl.NumberFormat("en-KE", {
                      style: "currency",
                      currency: "KES",
                    }).format(selectedPayment.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(selectedPayment.paymentDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member</p>
                  <p className="font-medium">
                    {selectedPayment.account?.member
                      ? `${selectedPayment.account.member.firstName} ${selectedPayment.account.member.lastName}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account</p>
                  <p className="font-medium">
                    {selectedPayment.account?.accountNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Type</p>
                  <p className="font-medium">
                    {selectedPayment.paymentType?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">
                    {selectedPayment.modeOfPayment?.name || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Transaction Reference</p>
                  <p className="font-medium text-xs font-mono break-all">
                    {selectedPayment.transactionReference || "N/A"}
                  </p>
                </div>
                {selectedPayment.mpesaReceiptNo && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">M-PESA Receipt</p>
                    <p className="font-medium">{selectedPayment.mpesaReceiptNo}</p>
                  </div>
                )}
                {selectedPayment.remarks && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Remarks</p>
                    <p className="font-medium">{selectedPayment.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Savings;
