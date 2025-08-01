 /* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Trash, Plus, Loader2, Users, Check, Ban, FileX, CreditCard } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "./DashboardLayout";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { 
  Repayment, 
  RepaymentRequest,
  RecordPaymentRequest,
  WaiveRequest,
  CancelRequest 
} from "@/types/api";
import { repaymentService } from "@/services/repaymentService";
import { loanService } from "@/services/loanService";
import { memberService } from "@/services/memberService";
import { DatePicker } from "@/components/ui/date-picker";

const repaymentSchema = z.object({
  loanId: z.coerce.number().min(1, "Loan is required"),
  amount: z.coerce.number().min(1, "Amount is required"),
  principalAmount: z.coerce.number().min(0, "Principal amount is required"),
  interestAmount: z.coerce.number().min(0, "Interest amount is required"),
  penaltyAmount: z.coerce.number().min(0).optional().default(0),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  remarks: z.string().optional(),
});

const recordPaymentSchema = z.object({
  id: z.coerce.number(),
  amount: z.coerce.number().min(1, "Amount is required"),
  paymentReference: z.string().min(1, "Payment reference is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  receivedBy: z.coerce.number().min(1, "Received by is required"),
  remarks: z.string().optional(),
});

const actionSchema = z.object({
  id: z.coerce.number(),
  remarks: z.string().min(1, "Remarks are required"),
});

type RepaymentFormValues = z.infer<typeof repaymentSchema>;
type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;
type ActionFormValues = z.infer<typeof actionSchema>;

const LoanRepayments = () => {
  const [showForm, setShowForm] = useState(false);
  const [showRecordPaymentForm, setShowRecordPaymentForm] = useState(false);
  const [showWaiveForm, setShowWaiveForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState<Repayment | null>(null);
  const { toast } = useToast();

  const { data: repayments, isLoading, error, refetch } = useQuery({
    queryKey: ["repayments"],
    queryFn: () => repaymentService.getAllRepayments(),
  });

  const { data: loans } = useQuery({
    queryKey: ["loans"],
    queryFn: loanService.getAllLoanApplications,
  });

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: memberService.getAllMembers,
  });

  const repaymentForm = useForm<RepaymentFormValues>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: {
      loanId: 0,
      amount: 0,
      principalAmount: 0,
      interestAmount: 0,
      penaltyAmount: 0,
      remarks: "",
    },
  });

  const recordPaymentForm = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      id: 0,
      amount: 0,
      paymentReference: "",
      paymentMethod: "",
      receivedBy: 0,
      remarks: "",
    },
  });

  const waiveForm = useForm<ActionFormValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      id: 0,
      remarks: "",
    },
  });

  const cancelForm = useForm<ActionFormValues>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      id: 0,
      remarks: "",
    },
  });

  const handleAddNew = () => {
    repaymentForm.reset({
      loanId: 0,
      amount: 0,
      principalAmount: 0,
      interestAmount: 0,
      penaltyAmount: 0,
      remarks: "",
    });
    setSelectedRepayment(null);
    setShowForm(true);
  };

  const handleEdit = (repayment: Repayment) => {
    repaymentForm.reset({
      loanId: repayment.loanId,
      amount: repayment.amount,
      principalAmount: repayment.principalAmount,
      interestAmount: repayment.interestAmount,
      penaltyAmount: repayment.penaltyAmount || 0,
      dueDate: new Date(repayment.dueDate),
      remarks: repayment.remarks || "",
    });
    setSelectedRepayment(repayment);
    setShowForm(true);
  };

  const handleDelete = (repayment: Repayment) => {
    setSelectedRepayment(repayment);
    setShowDeleteDialog(true);
  };

  const handleRecordPayment = (repayment: Repayment) => {
    recordPaymentForm.reset({
      id: repayment.id,
      amount: repayment.amount,
      paymentReference: "",
      paymentMethod: "",
      receivedBy: 0,
      remarks: "",
    });
    setSelectedRepayment(repayment);
    setShowRecordPaymentForm(true);
  };

  const handleWaive = (repayment: Repayment) => {
    waiveForm.reset({
      id: repayment.id,
      remarks: "",
    });
    setSelectedRepayment(repayment);
    setShowWaiveForm(true);
  };

  const handleCancel = (repayment: Repayment) => {
    cancelForm.reset({
      id: repayment.id,
      remarks: "",
    });
    setSelectedRepayment(repayment);
    setShowCancelForm(true);
  };

  const confirmDelete = async () => {
    if (!selectedRepayment) return;

    try {
      await repaymentService.deleteRepayment(selectedRepayment.id);
      toast({
        title: "Success",
        description: "Repayment deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting repayment:", error);
      toast({
        title: "Error",
        description: "Failed to delete repayment",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedRepayment(null);
    }
  };

  const onSubmitRepayment = async (values: RepaymentFormValues) => {
    try {
      const repaymentData: RepaymentRequest = {
        loanId: values.loanId,
        amount: values.amount,
        principalAmount: values.principalAmount,
        interestAmount: values.interestAmount,
        // penaltyAmount: values.penaltyAmount,
        dueDate: format(values.dueDate, "yyyy-MM-dd"),
        remarks: values.remarks,
        status: "PENDING",
        // isActive: true,
      };

      if (selectedRepayment) {
        await repaymentService.updateRepayment(selectedRepayment.id, repaymentData);
        toast({
          title: "Success",
          description: "Repayment updated successfully",
        });
      } else {
        await repaymentService.createRepayment(repaymentData);
        toast({
          title: "Success",
          description: "Repayment created successfully",
        });
      }

      setShowForm(false);
      refetch();
    } catch (error) {
      console.error("Error saving repayment:", error);
      toast({
        title: "Error",
        description: selectedRepayment
          ? "Failed to update repayment"
          : "Failed to create repayment",
        variant: "destructive",
      });
    }
  };

  const onSubmitRecordPayment = async (values: RecordPaymentFormValues) => {
    try {
      const paymentData: RecordPaymentRequest = {
        id: values.id,
        amount: values.amount,
        paymentReference: values.paymentReference,
        paymentMethod: values.paymentMethod,
        receivedBy: values.receivedBy,
        remarks: values.remarks,
      };

      await repaymentService.recordPayment(values.id, paymentData);
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      setShowRecordPaymentForm(false);
      refetch();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const onSubmitWaive = async (values: ActionFormValues) => {
    try {
      const waiveData: WaiveRequest = {
        id: values.id,
        remarks: values.remarks,
      };

      await repaymentService.waiveRepayment(values.id, waiveData);
      toast({
        title: "Success",
        description: "Repayment waived successfully",
      });

      setShowWaiveForm(false);
      refetch();
    } catch (error) {
      console.error("Error waiving repayment:", error);
      toast({
        title: "Error",
        description: "Failed to waive repayment",
        variant: "destructive",
      });
    }
  };

  const onSubmitCancel = async (values: ActionFormValues) => {
    try {
      const cancelData: CancelRequest = {
        id: values.id,
        remarks: values.remarks,
      };

      await repaymentService.cancelRepayment(values.id, cancelData);
      toast({
        title: "Success",
        description: "Repayment cancelled successfully",
      });

      setShowCancelForm(false);
      refetch();
    } catch (error) {
      console.error("Error cancelling repayment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel repayment",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PARTIALLY_PAID":
        return "bg-blue-100 text-blue-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "WAIVED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: Column<Repayment>[] = [
    {
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      header: "Code",
      accessorKey: "repaymentCode",
      sortable: true,
      cell: (repayment) => (
        <span className="font-medium">{repayment.repaymentCode}</span>
      ),
    },
    {
      header: "Loan",
      accessorKey: "loanCode",
      sortable: true,
    },
    {
      header: "Amount",
      accessorKey: "amount",
      sortable: true,
      cell: (repayment) => <span>Ksh {repayment.amount.toLocaleString()}</span>,
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      sortable: true,
      cell: (repayment) => (
        <span>{format(new Date(repayment.dueDate), "dd/MM/yyyy")}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (repayment) => (
        <Badge className={getStatusColor(repayment.status)}>
          {repayment.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (repayment) => (
        <div className="flex space-x-2 justify-end">
          {repayment.status === "PENDING" || repayment.status === "OVERDUE" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRecordPayment(repayment);
                }}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                Pay
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWaive(repayment);
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Waive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(repayment);
                }}
              >
                <Ban className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(repayment);
                }}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(repayment);
                }}
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Loan Repayments</CardTitle>
              <CardDescription>
                Manage loan repayments and payments
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Repayment
            </Button>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex justify-center p-4">
                <p className="text-red-500">Error loading repayments. Please try again.</p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading repayments...</span>
              </div>
            ) : repayments?.length === 0 ? (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No repayments found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by adding a new repayment
                </p>
                <Button
                  onClick={handleAddNew}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Repayment
                </Button>
              </div>
            ) : (
              <DataTable
                data={repayments || []}
                columns={columns}
                keyField="id"
                pagination={true}
                searchable={true}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                emptyMessage="No repayments found"
                loading={isLoading}
                onRowClick={(repayment) => handleEdit(repayment)}
              />
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Repayment Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedRepayment ? "Edit Repayment" : "Add New Repayment"}
              </DialogTitle>
              <DialogDescription>
                {selectedRepayment
                  ? "Update the repayment details below."
                  : "Fill in the details to create a new repayment."}
              </DialogDescription>
            </DialogHeader>
            <Form {...repaymentForm}>
              <form onSubmit={repaymentForm.handleSubmit(onSubmitRepayment)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={repaymentForm.control}
                    name="loanId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select loan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loans?.map((loan) => (
                              <SelectItem key={loan.loanApplicationId} value={loan.loanApplicationId.toString()}>
                                {loan.loanApplicationCode} - Ksh {loan.amount.toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={repaymentForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={repaymentForm.control}
                    name="principalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Principal Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={repaymentForm.control}
                    name="interestAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={repaymentForm.control}
                    name="penaltyAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Penalty Amount</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={repaymentForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={repaymentForm.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedRepayment ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={showRecordPaymentForm} onOpenChange={setShowRecordPaymentForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for this repayment.
              </DialogDescription>
            </DialogHeader>
            <Form {...recordPaymentForm}>
              <form onSubmit={recordPaymentForm.handleSubmit(onSubmitRecordPayment)} className="space-y-4">
                <FormField
                  control={recordPaymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={recordPaymentForm.control}
                  name="paymentReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Reference</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={recordPaymentForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          <SelectItem value="CHECK">Check</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={recordPaymentForm.control}
                  name="receivedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Received By</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members?.map((member) => (
                            <SelectItem key={member.memberId} value={member.memberId.toString()}>
                              {member.firstName} {member.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={recordPaymentForm.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowRecordPaymentForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Record Payment</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Waive Dialog */}
        <Dialog open={showWaiveForm} onOpenChange={setShowWaiveForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Waive Repayment</DialogTitle>
              <DialogDescription>
                Waive this repayment. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <Form {...waiveForm}>
              <form onSubmit={waiveForm.handleSubmit(onSubmitWaive)} className="space-y-4">
                <FormField
                  control={waiveForm.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Waiving</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowWaiveForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Waive Repayment</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Cancel Dialog */}
        <Dialog open={showCancelForm} onOpenChange={setShowCancelForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cancel Repayment</DialogTitle>
              <DialogDescription>
                Cancel this repayment. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <Form {...cancelForm}>
              <form onSubmit={cancelForm.handleSubmit(onSubmitCancel)} className="space-y-4">
                <FormField
                  control={cancelForm.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Cancellation</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowCancelForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="destructive">
                    Cancel Repayment
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this repayment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LoanRepayments;