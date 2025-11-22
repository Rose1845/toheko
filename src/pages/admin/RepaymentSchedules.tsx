import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { repaymentScheduleService } from "@/services/repaymentScheduleService";
import { 
  RepaymentSchedule, 
  RepaymentScheduleRequest, 
  GenerateScheduleRequest,
  RecordSchedulePaymentRequest
} from "@/types/api";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Edit, 
  FilePlus, 
  Loader2, 
  RefreshCcw, 
  Trash2, 
  Calendar, 
  CreditCard, 
  DollarSign 
} from "lucide-react";
import { format } from "date-fns";

// Form schema for recording a payment
const recordPaymentSchema = z.object({
  amount: z.coerce.number().min(1, "Amount is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  remarks: z.string().optional(),
});

// Form schema for generating schedules
const generateScheduleSchema = z.object({
  loanId: z.coerce.number().min(1, "Loan ID is required"),
  loanAmount: z.coerce.number().min(1, "Loan amount is required"),
  interestRate: z.coerce.number().min(0, "Interest rate is required"),
  termInMonths: z.coerce.number().min(1, "Term in months is required"),
  startDate: z.string().min(1, "Start date is required"),
  interestMethod: z.string().min(1, "Interest method is required"),
});

type RecordPaymentFormValues = z.infer<typeof recordPaymentSchema>;
type GenerateScheduleFormValues = z.infer<typeof generateScheduleSchema>;

const RepaymentSchedules: React.FC = () => {
  // Toast notification
  const { toast } = useToast();

  // State management
  const [showDetails, setShowDetails] = useState(false);
  const [showRecordPaymentForm, setShowRecordPaymentForm] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<RepaymentSchedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<RepaymentSchedule | null>(null);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [loanIdFilter, setLoanIdFilter] = useState<number | null>(null);

  // Forms
  const recordPaymentForm = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      amount: 0,
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      remarks: "",
    },
  });

  const generateScheduleForm = useForm<GenerateScheduleFormValues>({
    resolver: zodResolver(generateScheduleSchema),
    defaultValues: {
      loanId: 0,
      loanAmount: 0,
      interestRate: 0,
      termInMonths: 12,
      startDate: format(new Date(), "yyyy-MM-dd"),
      interestMethod: "SIMPLE",
    },
  });

  // Query for fetching repayment schedules
  const { data: schedules, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["repaymentSchedules", statusFilter, loanIdFilter],
    queryFn: async () => {
      try {
        if (statusFilter) {
          return repaymentScheduleService.getSchedulesByStatus(statusFilter);
        } else if (loanIdFilter) {
          return repaymentScheduleService.getSchedulesByLoanId(loanIdFilter);
        } else {
          return repaymentScheduleService.getAllSchedules();
        }
      } catch (err) {
        console.error("Error fetching repayment schedules:", err);
        // Return empty data structure to prevent rendering errors
        return { content: [] };
      }
    },
    // Add these options for better error handling
    retry: 1,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error("Query error:", err);
      toast({
        title: "Error",
        description: "Failed to load repayment schedules. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Event handlers
  const handleViewDetails = (schedule: RepaymentSchedule) => {
    setSelectedSchedule(schedule);
    setShowDetails(true);
  };

  const handleRecordPayment = (schedule: RepaymentSchedule) => {
    setSelectedSchedule(schedule);
    recordPaymentForm.reset({
      amount: schedule.totalAmount - schedule.paidAmount,
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      remarks: "",
    });
    setShowRecordPaymentForm(true);
  };

  const handleGenerateSchedules = () => {
    generateScheduleForm.reset();
    setShowGenerateForm(true);
  };

  const handleConfirmDelete = (schedule: RepaymentSchedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteConfirm(true);
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;
    
    setIsDeleting(true);
    try {
      await repaymentScheduleService.deleteSchedule(scheduleToDelete.id);
      toast({
        title: "Schedule deleted",
        description: "The repayment schedule has been deleted successfully.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the repayment schedule.",
        variant: "destructive",
      });
      console.error("Error deleting schedule:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setScheduleToDelete(null);
    }
  };

  const onSubmitRecordPayment = async (values: RecordPaymentFormValues) => {
    if (!selectedSchedule) return;
    
    setIsRecordingPayment(true);
    try {
      const paymentData: RecordSchedulePaymentRequest = {
        id: selectedSchedule.id,
        amount: values.amount,
        paymentDate: values.paymentDate,
        remarks: values.remarks,
      };
      
      await repaymentScheduleService.recordPayment(selectedSchedule.id, paymentData);
      toast({
        title: "Payment recorded",
        description: "The payment has been recorded successfully.",
      });
      refetch();
      setShowRecordPaymentForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record the payment.",
        variant: "destructive",
      });
      console.error("Error recording payment:", error);
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const onSubmitGenerateSchedules = async (values: GenerateScheduleFormValues) => {
    setIsGenerating(true);
    try {
      const generateData: GenerateScheduleRequest = {
        loanId: values.loanId,
        loanAmount: values.loanAmount,
        interestRate: values.interestRate,
        termInMonths: values.termInMonths,
        startDate: values.startDate,
        interestMethod: values.interestMethod,
      };
      
      await repaymentScheduleService.generateSchedules(generateData);
      toast({
        title: "Schedules generated",
        description: "The repayment schedules have been generated successfully.",
      });
      refetch();
      setShowGenerateForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate repayment schedules.",
        variant: "destructive",
      });
      console.error("Error generating schedules:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFilterByStatus = (status: string | null) => {
    setStatusFilter(status);
    setLoanIdFilter(null);
  };

  const handleFilterByLoanId = (event: React.ChangeEvent<HTMLInputElement>) => {
    const loanId = event.target.value ? parseInt(event.target.value) : null;
    setLoanIdFilter(loanId);
    setStatusFilter(null);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Status badge colors
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PARTIALLY_PAID":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
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

  // DataTable columns
  const columns: Column<RepaymentSchedule>[] = [
    {
      header: "ID",
      accessorKey: "id",
      cell: (schedule) => <span>{schedule.id}</span>,
    },
    {
      header: "Loan",
      accessorKey: "loanCode",
      cell: (schedule) => <span>{schedule.loanCode}</span>,
    },
    {
      header: "Member",
      accessorKey: "memberName",
      cell: (schedule) => <span>{schedule.memberName}</span>,
    },
    {
      header: "Installment #",
      accessorKey: "installmentNumber",
      cell: (schedule) => <span>{schedule.installmentNumber}</span>,
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (schedule) => <span>{schedule.dueDate}</span>,
    },
    {
      header: "Amount",
      accessorKey: "totalAmount",
      cell: (schedule) => <span>{formatCurrency(schedule.totalAmount)}</span>,
    },
    {
      header: "Paid",
      accessorKey: "paidAmount",
      cell: (schedule) => <span>{formatCurrency(schedule.paidAmount)}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (schedule) => (
        <Badge className={getStatusBadgeColor(schedule.status)}>
          {schedule.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: (schedule) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(schedule)}
            title="View Details"
          >
            <CreditCard className="h-4 w-4" />
          </Button>
          
          {(schedule.status === "PENDING" || schedule.status === "PARTIALLY_PAID" || schedule.status === "OVERDUE") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRecordPayment(schedule)}
              title="Record Payment"
            >
              <DollarSign className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleConfirmDelete(schedule)}
            title="Delete"
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-2 py-3 sm:px-4 sm:py-4 md:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Repayment Schedules</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="flex items-center w-full sm:w-auto"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={handleGenerateSchedules}
              className="flex items-center w-full sm:w-auto"
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Generate Schedules
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Filter Options</CardTitle>
            <CardDescription>Filter repayment schedules by status or loan ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
                <Select
                  onValueChange={(value) => handleFilterByStatus(value === "ALL" ? null : value)}
                  value={statusFilter || "ALL"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="WAIVED">Waived</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Loan ID</label>
                <Input
                  type="number"
                  placeholder="Filter by Loan ID"
                  value={loanIdFilter || ""}
                  onChange={handleFilterByLoanId}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Repayment Schedules</CardTitle>
            <CardDescription>
              Manage repayment schedules for loans
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-8">
                <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
                <h3 className="text-lg font-medium">Failed to load data</h3>
                <p className="text-muted-foreground mb-4">There was an error loading the repayment schedules.</p>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={schedules?.content || []}
                searchPlaceholder="Search schedules..."
                searchColumn="memberName"
              />
            )}
          </CardContent>
        </Card>
        
        {/* Schedule Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Repayment Schedule Details</DialogTitle>
            </DialogHeader>
            {selectedSchedule && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p>{selectedSchedule.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Loan ID/Code</p>
                    <p>{selectedSchedule.loanId} / {selectedSchedule.loanCode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Member Name</p>
                    <p>{selectedSchedule.memberName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Installment Number</p>
                    <p>{selectedSchedule.installmentNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                    <p>{selectedSchedule.dueDate}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Principal Amount</p>
                    <p>{formatCurrency(selectedSchedule.principalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Interest Amount</p>
                    <p>{formatCurrency(selectedSchedule.interestAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <p>{formatCurrency(selectedSchedule.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                    <p>{formatCurrency(selectedSchedule.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Remaining Principal</p>
                    <p>{formatCurrency(selectedSchedule.remainingPrincipal)}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusBadgeColor(selectedSchedule.status)}>
                    {selectedSchedule.status.replace("_", " ")}
                  </Badge>
                </div>
                {selectedSchedule.remarks && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                    <p>{selectedSchedule.remarks}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Created/Updated</p>
                  <p>{selectedSchedule.createdAt} / {selectedSchedule.updatedAt}</p>
                </div>
                <div className="col-span-2 mt-4">
                  {(selectedSchedule.status === "PENDING" || selectedSchedule.status === "PARTIALLY_PAID" || selectedSchedule.status === "OVERDUE") && (
                    <Button onClick={() => {
                      setShowDetails(false);
                      handleRecordPayment(selectedSchedule);
                    }}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Record Payment
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Record Payment Form Dialog */}
        <Dialog open={showRecordPaymentForm} onOpenChange={setShowRecordPaymentForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for this repayment schedule.
              </DialogDescription>
            </DialogHeader>
            <Form {...recordPaymentForm}>
              <form
                onSubmit={recordPaymentForm.handleSubmit(onSubmitRecordPayment)}
                className="space-y-4"
              >
                <FormField
                  control={recordPaymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={recordPaymentForm.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={recordPaymentForm.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter any remarks about this payment"
                        />
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
                  <Button type="submit" disabled={isRecordingPayment}>
                    {isRecordingPayment && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Record Payment
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Generate Schedules Form Dialog */}
        <Dialog open={showGenerateForm} onOpenChange={setShowGenerateForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate Repayment Schedules</DialogTitle>
              <DialogDescription>
                Generate repayment schedules for a loan.
              </DialogDescription>
            </DialogHeader>
            <Form {...generateScheduleForm}>
              <form
                onSubmit={generateScheduleForm.handleSubmit(onSubmitGenerateSchedules)}
                className="space-y-4"
              >
                <FormField
                  control={generateScheduleForm.control}
                  name="loanId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generateScheduleForm.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generateScheduleForm.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generateScheduleForm.control}
                  name="termInMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Term (Months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generateScheduleForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generateScheduleForm.control}
                  name="interestMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interest method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SIMPLE">Simple</SelectItem>
                          <SelectItem value="COMPOUND">Compound</SelectItem>
                          <SelectItem value="REDUCING_BALANCE">Reducing Balance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowGenerateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Generate Schedules
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Are you sure you want to delete this repayment schedule? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setScheduleToDelete(null);
                }}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSchedule}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default RepaymentSchedules;
