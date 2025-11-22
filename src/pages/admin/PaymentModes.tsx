/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { DataTable, Column } from "@/components/ui/data-table";
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
import { Wallet, Edit, Trash2, Plus, Loader2 } from "lucide-react";
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
import { modeOfPaymentService, ModeOfPaymentFormValues } from "@/services/modeOfPaymentService";
import { ModeOfPayment } from "@/types/api";

const PaymentModes = () => {
  const [paymentModes, setPaymentModes] = useState<ModeOfPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<ModeOfPayment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const paymentModeFormSchema = z.object({
    name: z.string().min(3, "Name is required"),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
  });

  type PaymentModeFormValues = z.infer<typeof paymentModeFormSchema>;

  const form = useForm<PaymentModeFormValues>({
    resolver: zodResolver(paymentModeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
    },
  });

  const editForm = useForm<PaymentModeFormValues>({
    resolver: zodResolver(paymentModeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
    },
  });

  useEffect(() => {
    fetchPaymentModes();
  }, []);

  useEffect(() => {
    if (selectedPaymentMode && showEditDialog) {
      editForm.reset({
        name: selectedPaymentMode.name || "",
        description: selectedPaymentMode.description || "",
        shortDescription: selectedPaymentMode.shortDescription || "",
      });
    }
  }, [selectedPaymentMode, showEditDialog, editForm]);

  const fetchPaymentModes = async () => {
    try {
      setLoading(true);
      const response = await modeOfPaymentService.getAllModesOfPayment();
      setPaymentModes(response || []);
    } catch (error) {
      console.error("Error fetching payment modes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payment modes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMode = async (values: PaymentModeFormValues) => {
    try {
      setSubmitting(true);
      const modeOfPaymentData: ModeOfPaymentFormValues = {
        name: values.name,
        description: values.description || "",
        shortDescription: values.shortDescription
      };
      await modeOfPaymentService.createModeOfPayment(modeOfPaymentData);
      toast({
        title: "Success",
        description: "Payment mode added successfully",
      });
      setShowAddDialog(false);
      form.reset();
      fetchPaymentModes();
    } catch (error) {
      console.error("Error adding payment mode:", error);
      toast({
        title: "Error",
        description: "Failed to add payment mode",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPaymentMode = async (values: PaymentModeFormValues) => {
    if (!selectedPaymentMode) return;
    
    try {
      setSubmitting(true);
      
      const modeOfPaymentData: ModeOfPaymentFormValues = {
        name: values.name,
        description: values.description || "",
        shortDescription: values.shortDescription
      };
      
      await modeOfPaymentService.updateModeOfPayment(
        selectedPaymentMode.modeOfPaymentId,
        modeOfPaymentData
      );
      
      toast({
        title: "Success",
        description: "Payment mode updated successfully",
      });
      
      setShowEditDialog(false);
      editForm.reset();
      fetchPaymentModes();
    } catch (error) {
      console.error("Error updating payment mode:", error);
      toast({
        title: "Error",
        description: "Failed to update payment mode",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePaymentMode = async () => {
    if (!selectedPaymentMode) return;
    
    try {
      setSubmitting(true);
      await modeOfPaymentService.deleteModeOfPayment(selectedPaymentMode.modeOfPaymentId);
      toast({
        title: "Success",
        description: "Payment mode deleted successfully",
      });
      setShowDeleteDialog(false);
      fetchPaymentModes();
    } catch (error) {
      console.error("Error deleting payment mode:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment mode",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Define columns for DataTable
  const columns: Column<ModeOfPayment>[] = [
    {
      header: "ID",
      accessorKey: "modeOfPaymentId",
      sortable: true,
    },
    {
      header: "Name",
      accessorKey: "name",
      sortable: true,
      cell: (paymentMode) => (
        <span className="font-medium">{paymentMode.name}</span>
      ),
    },
    {
      header: "Short Description",
      accessorKey: "shortDescription",
      sortable: true,
      cell: (paymentMode) => (
        <span>{paymentMode.shortDescription || "-"}</span>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      sortable: true,
      cell: (paymentMode) => (
        <span>{paymentMode.description || "-"}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (paymentMode) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            paymentMode.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {paymentMode.status || "ACTIVE"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "modeOfPaymentId",
      cell: (paymentMode) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPaymentMode(paymentMode);
              setShowEditDialog(true);
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
              setSelectedPaymentMode(paymentMode);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
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
            <CardTitle className="text-lg sm:text-xl">Payment Modes</CardTitle>
            <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Mode
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading payment modes...</span>
              </div>
            ) : paymentModes.length === 0 ? (
              <div className="text-center py-10">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No payment modes found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by creating a new payment mode.
                </p>
                <Button 
                  onClick={() => setShowAddDialog(true)} 
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Mode
                </Button>
              </div>
            ) : (
              <DataTable
                data={paymentModes}
                columns={columns}
                keyField="modeOfPaymentId"
                pagination={true}
                searchable={true}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                emptyMessage="No payment modes found"
                loading={loading}
                onRowClick={(paymentMode) => {
                  setSelectedPaymentMode(paymentMode);
                  setShowEditDialog(true);
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Add Payment Mode Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment Mode</DialogTitle>
              <DialogDescription>
                Create a new payment mode for transactions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleAddPaymentMode)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  placeholder="Enter payment mode name"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="shortDescription" className="text-sm font-medium">Short Description</label>
                <Input
                  id="shortDescription"
                  placeholder="Enter short description"
                  {...form.register("shortDescription")}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  placeholder="Enter detailed description"
                  {...form.register("description")}
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
                    "Save Payment Mode"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Payment Mode Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Payment Mode</DialogTitle>
              <DialogDescription>
                Update the payment mode details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(handleEditPaymentMode)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">Name</label>
                <Input
                  id="edit-name"
                  placeholder="Enter payment mode name"
                  {...editForm.register("name")}
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{editForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-shortDescription" className="text-sm font-medium">Short Description</label>
                <Input
                  id="edit-shortDescription"
                  placeholder="Enter short description"
                  {...editForm.register("shortDescription")}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter detailed description"
                  {...editForm.register("description")}
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
                    "Update Payment Mode"
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
                This action cannot be undone. This will permanently delete the payment mode
                and remove it from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeletePaymentMode} 
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

export default PaymentModes;
