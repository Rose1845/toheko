/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Trash, Plus, Loader2, Users } from "lucide-react";
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
import {
  BoardMember,
  BoardMemberRequest,
  LoanCollateralItem,
  LoanPenalty,
} from "@/types/api";
import { boardMemberService } from "@/services/boardMemberService";
import { memberService } from "@/services/memberService";
import { loanService } from "@/services/loanService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const formSchema = z.object({
  id: z.number().optional(),
  type: z.string().min(1, "type is required"),
  loanApplicationId: z.coerce.number().min(0),
  estimatedValue: z.coerce.number().min(0),
  ownerName: z.string(),
  ownerContact: z.string(),
  description: z.string(),
});
type FormValues = z.infer<typeof formSchema>;

const LoanCollateral = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<LoanCollateralItem | null>(null);
  const { toast } = useToast();
  const { data: loanTypes } = useQuery({
    queryKey: ["loan-types"],
    queryFn: loanService.getAllLoanCollaterals,
  });

  const { data: loanProducts } = useQuery({
    queryKey: ["loan-applications"],
    queryFn: loanService.getAllLoanApplications,
  });

  console.log("loan application", loanTypes);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: 0,
      loanApplicationId: 0,
      type: "",
      estimatedValue: 0,
      ownerContact: "",
      ownerName: "",
      description: "",
    },
  });

  // Fetch Loan Productss
  const {
    data: LoanPenaltys,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["loancollaterals"],
    queryFn: async () => {
      try {
        return await loanService.getAllLoanCollaterals();
      } catch (error) {
        console.error("Failed to fetch Loan Collaterals:", error);
        return [] as LoanCollateralItem[];
      }
    },
  });
  const handleAddNew = () => {
    form.reset({
      id: undefined,
      loanApplicationId: 0,
      type: "",
      estimatedValue: 0,
      ownerContact: "",
      ownerName: "",
      description: "",
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (product: LoanCollateralItem) => {
    form.reset({
      id: product.id,
      loanApplicationId: product.loanApplicationId,
      type: product.type,
      estimatedValue: product.estimatedValue,
      description: product.description,
      ownerContact: product.ownerContact,
      ownerName: product.ownerName,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = (product: LoanCollateralItem) => {
    setSelectedMember(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;

    try {
      await loanService.deleteLoanCollateral(selectedMember.id);
      toast({
        title: "Success",
        description: "Loan Products deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting Loan Products:", error);
      toast({
        title: "Error",
        description: "Failed to delete Loan Products",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedMember(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const LoanPenaltyData: LoanCollateralItem = {
        id: values.id || 0,
        loanApplicationId: values.loanApplicationId,
        type: values.type,
        estimatedValue: values.estimatedValue,
        description: values.description,
        ownerContact: values.ownerContact,
        ownerName: values.ownerName,
      };

      if (isEditing) {
        await loanService.updateLoanCollateral(LoanPenaltyData);
        toast({
          title: "Success",
          description: "Loan Collateral updated successfully",
        });
      } else {
        await loanService.createLoanCollateral(LoanPenaltyData);
        toast({
          title: "Success",
          description: "Loan Collateral added successfully",
        });
      }

      setShowForm(false);
      form.reset();
      refetch();
    } catch (error) {
      console.error("Error saving Loan Collateral:", error);
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update Loan Collateral"
          : "Failed to add Loan Collateral",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Define columns for DataTable
  const columns: Column<LoanCollateralItem & { type?: string }>[] = [
    {
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      header: "type",
      accessorKey: "type",
      sortable: true,
      cell: (LoanPenalty) => (
        <span className="font-medium">{LoanPenalty.type}</span>
      ),
    },
    {
      header: "Estmated Value",
      accessorKey: "estimatedValue",
      sortable: true,
      cell: (LoanPenalty) => (
        <span className="font-medium">{LoanPenalty.estimatedValue}</span>
      ),
    },
    {
      header: "OwnerName",
      accessorKey: "ownerName",
      sortable: true,
      cell: (LoanPenalty) => (
        <span className="font-medium">{LoanPenalty.ownerName}</span>
      ),
    },

    {
      header: "ownerContact",
      accessorKey: "ownerContact",
      cell: (LoanPenalty) => <span>{LoanPenalty.ownerContact}</span>,
    },

    {
      header: "Actions",
      accessorKey: "id",
      cell: (LoanPenalty) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(LoanPenalty);
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
              handleDelete(LoanPenalty);
            }}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
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
              <CardTitle>Loan Collaterals</CardTitle>
              <CardDescription>
                Manage the SACCO Loan Collaterals
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Loan Collaterals
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading Loan Collaterals...</span>
              </div>
            ) : LoanPenaltys?.length === 0 ? (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No loan Collaterals found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by adding a new Loan Collaterals
                </p>
                <Button
                  onClick={handleAddNew}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Loan Collateral
                </Button>
              </div>
            ) : (
              <DataTable
                data={LoanPenaltys}
                columns={columns}
                keyField="id"
                pagination={true}
                searchable={true}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                emptyMessage="No Loan Collaterals found"
                loading={isLoading}
                onRowClick={(boardMember) => handleEdit(boardMember)}
              />
            )}
          </CardContent>
        </Card>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[600px] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing
                  ? "Edit Loan Collaterals"
                  : "Add New Loan Collaterals"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the Loan Collaterals's information below."
                  : "Add a new Loan Collaterals by filling in the information below."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 overflow-y-auto pr-2"
              >
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-4 gap-2">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic" className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="loanApplicationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Product</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              defaultValue={field.value.toString()}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select loan product" />
                              </SelectTrigger>
                              <SelectContent>
                                {loanProducts?.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select penalty type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DAILY_PERCENTAGE">
                                  Daily Percentage
                                </SelectItem>
                                <SelectItem value="FLAT">Flat</SelectItem>
                                <SelectItem value="PERCENTAGE">
                                  Percentage
                                </SelectItem>
                                <SelectItem value="NONE">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EstimatedValue</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ownerContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OwnerName</FormLabel>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <DialogFooter className="pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{isEditing ? "Update" : "Add"}</Button>
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
                Are you sure you want to delete this Loan Collateral? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
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

export default LoanCollateral;
