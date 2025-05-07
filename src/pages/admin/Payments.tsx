/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { paymentService } from "@/services/paymentService";
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
import { Payment } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { paymentTypeService } from "@/services/paymentTypeService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Vault } from "lucide-react";

const Payments = () => {
  const [activeTab, setActiveTab] = useState("payments");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [showAddPaymentTypeDialog, setShowAddPaymentTypeDialog] =
    useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const paymentFormSchema = z.object({
    remarks: z.string().optional(),
    phoneNumber: z.string(),
    modeOfPaymentId: z.coerce.number(),
    amount: z.coerce.number().positive("Amount must be positive"),
    accountId: z.coerce.number().positive("Member ID is required"),
  });

  const paymentTypeFormSchema = z.object({
    name: z.string().min(3, "Name is required"),
    paymentShortDesc: z.string().optional(),
    paymentDescription: z.string().optional(),
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await paymentService.getAllPayments();
        console.log("response", response);
        setPayments(response || []);
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast({
          title: "Error fetching payments",
          description:
            "There was an error loading the payments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);
  const { data: paymenttypes } = useQuery({
    queryKey: ["payment-types"],
    queryFn: paymentTypeService.getAllPaymentTypes,
  });
  const handleViewDetails = (payment: any) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  type PaymentFormValues = z.infer<typeof paymentFormSchema>;
  type PaymentTypeFormValues = z.infer<typeof paymentTypeFormSchema>;

  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      phoneNumber: "",
      amount: 0,
      accountId: 0,
    },
  });

  const paymentTypeForm = useForm<PaymentTypeFormValues>({
    resolver: zodResolver(paymentTypeFormSchema),
    defaultValues: {
      name: "",
      paymentShortDesc: "",
      paymentDescription: "",
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const onSubmitPayment = async (values: PaymentFormValues) => {
    console.log("Submitting Payment:", values);
    await paymentService.createPayment(values);
    toast({ title: "Payment Added" });
    setShowAddPaymentDialog(false);
    paymentForm.reset();
  };

  const onSubmitPaymentType = async (values: PaymentTypeFormValues) => {
    console.log("Submitting Payment Type:", values);
    await paymentTypeService.createPaymentType(values);
    toast({ title: "Payment Type Added" });
    setShowAddPaymentTypeDialog(false);
    paymentTypeForm.reset();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Payments Management
          </h1>
          <p className="text-gray-500">View and manage all SACCO payments</p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-6"
        >
          <TabsList>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="types">Payment Types</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Payments List</CardTitle>
              </CardHeader>
              <div className="flex justify-end mb-4">
                <Button onClick={() => setShowAddPaymentDialog(true)}>
                  Add Payment
                </Button>
              </div>

              <CardContent>
                {loading ? (
                  <p>Loading payments...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.paymentId}>
                          <TableCell>{payment.transactionReference}</TableCell>
                          <TableCell>
                            {payment.account?.member
                              ? `${payment.account.member.firstName} ${payment.account.member.lastName}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === "COMPLETED"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(payment)}
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
                <CardTitle>Payments Types List</CardTitle>
              </CardHeader>
              <div className="flex justify-end mb-4">
                <Button onClick={() => setShowAddPaymentTypeDialog(true)}>
                  Add Payment Type
                </Button>
              </div>

              <CardContent>
                {loading ? (
                  <p>Loading payments types...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Payment Description</TableHead>
                        <TableHead>Short Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymenttypes?.map((payment) => (
                        <TableRow key={payment.paymentTypeId}>
                          <TableCell>{payment.name}</TableCell>
                          <TableCell>{payment.paymentDescription}</TableCell>
                          <TableCell>{payment.paymentShortDesc}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(payment)}
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
        </Tabs>
        <Dialog
          open={showAddPaymentDialog}
          onOpenChange={setShowAddPaymentDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment</DialogTitle>
              <DialogDescription>
                Provide payment details below.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={paymentForm.handleSubmit(onSubmitPayment)}
              className="space-y-4"
            >
              <Input
                placeholder="Transaction Reference"
                {...paymentForm.register("phoneNumber")}
              />
              {paymentForm.formState.errors.phoneNumber && (
                <p className="text-red-500 text-sm">
                  {paymentForm.formState.errors.phoneNumber.message}
                </p>
              )}

              <Input
                type="number"
                placeholder="Amount"
                {...paymentForm.register("amount", { valueAsNumber: true })}
              />
              {paymentForm.formState.errors.amount && (
                <p className="text-red-500 text-sm">
                  {paymentForm.formState.errors.amount.message}
                </p>
              )}

              <Input
                placeholder="accountId ID"
                type="number"
                {...paymentForm.register("accountId", { valueAsNumber: true })}
              />
              {paymentForm.formState.errors.accountId && (
                <p className="text-red-500 text-sm">
                  {paymentForm.formState.errors.accountId.message}
                </p>
              )}

              <Button type="submit">Add Payment</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showAddPaymentTypeDialog}
          onOpenChange={setShowAddPaymentTypeDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Type</DialogTitle>
              <DialogDescription>Enter payment type details.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={paymentTypeForm.handleSubmit(onSubmitPaymentType)}
              className="space-y-4"
            >
              <Input placeholder="Name" {...paymentTypeForm.register("name")} />
              {paymentTypeForm.formState.errors.name && (
                <p className="text-red-500 text-sm">
                  {paymentTypeForm.formState.errors.name.message}
                </p>
              )}

              <Input
                placeholder="paymentShortDesc (optional)"
                {...paymentTypeForm.register("paymentShortDesc")}
              />

              <Input
                placeholder="paymentDescription (optional)"
                {...paymentTypeForm.register("paymentDescription")}
              />
              <Button type="submit">Add Payment Type</Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected payment
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-500">
                      Reference Number
                    </h3>
                    <p>{selectedPayment.transactionReference}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Payment Date</h3>
                    <p>
                      {new Date(
                        selectedPayment.paymentDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Member</h3>
                    <p>
                      {selectedPayment.account?.member
                        ? `${selectedPayment.account.member.firstName} ${selectedPayment.account.member.lastName}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Amount</h3>
                    <p>{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Payment Type</h3>
                    <p>{selectedPayment.paymentType?.name || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">
                      Mode of Payment
                    </h3>
                    <p>{selectedPayment.modeOfPayment?.name || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Status</h3>
                    <Badge
                      variant={
                        selectedPayment.status === "COMPLETED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>
                {selectedPayment.remarks && (
                  <div>
                    <h3 className="font-medium text-gray-500">Remarks</h3>
                    <p>{selectedPayment.remarks}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
