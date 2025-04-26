/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { paymentTypeService, PaymentTypeFormValues } from "@/services/paymentTypeService";
import { PaymentType } from "@/types/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

const PaymentTypes = () => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const paymentTypeFormSchema = z.object({
    name: z.string().min(3, "Name is required"),
    paymentShortDesc: z.string().optional(),
    paymentDescription: z.string().optional(),
  });

  type FormValues = z.infer<typeof paymentTypeFormSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(paymentTypeFormSchema),
    defaultValues: {
      name: "",
      paymentShortDesc: "",
      paymentDescription: "",
    },
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(paymentTypeFormSchema),
    defaultValues: {
      name: "",
      paymentShortDesc: "",
      paymentDescription: "",
    },
  });

  useEffect(() => {
    fetchPaymentTypes();
  }, []);

  useEffect(() => {
    if (selectedPaymentType && showEditDialog) {
      editForm.reset({
        name: selectedPaymentType.name || "",
        paymentShortDesc: selectedPaymentType.paymentShortDesc || "",
        paymentDescription: selectedPaymentType.paymentDescription || "",
      });
      
      // Log the selected payment type for debugging
      console.log("Selected payment type for editing:", selectedPaymentType);
    }
  }, [selectedPaymentType, showEditDialog, editForm]);

  const fetchPaymentTypes = async () => {
    try {
      setLoading(true);
      const response = await paymentTypeService.getAllPaymentTypes();
      setPaymentTypes(response || []);
    } catch (error) {
      console.error("Error fetching payment types:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment types",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentType = async (values: FormValues) => {
    try {
      setSubmitting(true);
      // Make sure all required fields are provided
      const paymentTypeData: PaymentTypeFormValues = {
        name: values.name,
        paymentShortDesc: values.paymentShortDesc || "",
        paymentDescription: values.paymentDescription || ""
      };
      await paymentTypeService.createPaymentType(paymentTypeData);
      toast({
        title: "Success",
        description: "Payment type added successfully",
      });
      setShowAddDialog(false);
      form.reset();
      fetchPaymentTypes();
    } catch (error) {
      console.error("Error adding payment type:", error);
      toast({
        title: "Error",
        description: "Failed to add payment type",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPaymentType = async (values: FormValues) => {
    if (!selectedPaymentType) return;
    
    try {
      setSubmitting(true);
      
      // Create the update payload with the correct structure
      const updateData = {
        paymentTypeId: selectedPaymentType.paymentTypeId,
        name: values.name,
        paymentShortDesc: values.paymentShortDesc || "",
        paymentDescription: values.paymentDescription || "",
      };
      
      // Log the data being sent
      console.log("Sending update with data:", updateData);
      
      await paymentTypeService.updatePaymentType(updateData);
      toast({
        title: "Success",
        description: "Payment type updated successfully",
      });
      setShowEditDialog(false);
      fetchPaymentTypes();
    } catch (error) {
      console.error("Error updating payment type:", error);
      toast({
        title: "Error",
        description: "Failed to update payment type",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePaymentType = async () => {
    if (!selectedPaymentType) return;
    
    try {
      setSubmitting(true);
      await paymentTypeService.deletePaymentType(selectedPaymentType.paymentTypeId);
      toast({
        title: "Success",
        description: "Payment type deleted successfully",
      });
      setShowDeleteDialog(false);
      fetchPaymentTypes();
    } catch (error) {
      console.error("Error deleting payment type:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment type",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Payment Types</h1>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Payment Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Payment Types</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Loading payment types...</p>
              </div>
            ) : paymentTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-3">
                <CreditCard className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No payment types found</p>
                <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                  Add your first payment type
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Short Description</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentTypes.map((paymentType) => (
                    <TableRow key={paymentType.paymentTypeId}>
                      <TableCell>{paymentType.paymentTypeId}</TableCell>
                      <TableCell className="font-medium">{paymentType.name}</TableCell>
                      <TableCell>{paymentType.paymentShortDesc || "-"}</TableCell>
                      <TableCell>{paymentType.paymentDescription || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPaymentType(paymentType);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPaymentType(paymentType);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Payment Type Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Type</DialogTitle>
              <DialogDescription>
                Create a new payment type for the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleAddPaymentType)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  placeholder="Enter payment type name"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="shortDesc" className="text-sm font-medium">Short Description</label>
                <Input
                  id="shortDesc"
                  placeholder="Enter short description"
                  {...form.register("paymentShortDesc")}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed description"
                  {...form.register("paymentDescription")}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Payment Type"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Payment Type Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Payment Type</DialogTitle>
              <DialogDescription>
                Update the payment type details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(handleEditPaymentType)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                <Input
                  id="edit-name"
                  placeholder="Enter payment type name"
                  {...editForm.register("name")}
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-shortDesc" className="text-sm font-medium">Short Description</label>
                <Input
                  id="edit-shortDesc"
                  placeholder="Enter short description"
                  {...editForm.register("paymentShortDesc")}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter detailed description"
                  {...editForm.register("paymentDescription")}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Payment Type"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the payment type
                and remove it from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeletePaymentType} 
                className="bg-red-600 hover:bg-red-700"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default PaymentTypes;
