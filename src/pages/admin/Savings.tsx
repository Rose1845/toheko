import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "./DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { savingService } from "@/services/savingService";
import { memberService } from "@/services/memberService";
import { Saving, SavingRequest } from "@/types/api";
import { DataTable, Column } from "@/components/ui/data-table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Plus, Loader2, PiggyBank } from "lucide-react";

// Form schema for savings
const savingFormSchema = z.object({
  id: z.number().optional(),
  memberId: z.number(),
  savingAmount: z.coerce.number().positive("Amount must be positive"),
  savingDate: z.string(),
  savingMethod: z.string(),
  status: z.string().default("ACTIVE"),
});

type SavingFormValues = z.infer<typeof savingFormSchema>;

const Savings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null);

  // Queries
  const { data: savings, isLoading: savingsLoading } = useQuery({
    queryKey: ["savings"],
    queryFn: savingService.getAllSavings,
  });

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: memberService.getAllMembers,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: savingService.createSaving,
    onSuccess: () => {
      toast({ title: "Success", description: "Saving created successfully" });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create saving",
      });
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: savingService.updateSaving,
    onSuccess: () => {
      toast({ title: "Success", description: "Saving updated successfully" });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update saving",
      });
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => savingService.deleteSaving(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Saving deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["savings"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete saving",
      });
      console.error(error);
    },
  });

  // Forms
  const editForm = useForm<SavingFormValues>({
    resolver: zodResolver(savingFormSchema),
    defaultValues: {
      id: 0,
      memberId: 0,
      savingAmount: 0,
      savingDate: new Date().toISOString().split("T")[0],
      savingMethod: "",
      status: "ACTIVE",
    },
  });

  const addForm = useForm<SavingFormValues>({
    resolver: zodResolver(savingFormSchema),
    defaultValues: {
      memberId: 0,
      savingAmount: 0,
      savingDate: new Date().toISOString().split("T")[0],
      savingMethod: "",
      status: "ACTIVE",
    },
  });

  // Handle opening the edit dialog
  const handleEdit = (saving: Saving) => {
    setSelectedSaving(saving);
    editForm.reset({
      id: saving.id,
      memberId: saving.memberId,
      savingAmount: saving.savingAmount,
      savingDate: saving.savingDate.split("T")[0],
      savingMethod: saving.savingMethod,
      status: saving.status,
    });
    setIsEditDialogOpen(true);
  };

  // Handle form submissions
  const onSubmitAdd = (values: SavingFormValues) => {
    const savingRequest: SavingRequest = {
      id: 0, // This will be ignored on create
      memberId: values.memberId,
      savingAmount: values.savingAmount,
      savingDate: values.savingDate,
      savingMethod: values.savingMethod,
      status: values.status,
    };
    createMutation.mutate(savingRequest);
  };

  const onSubmitEdit = (values: SavingFormValues) => {
    if (!selectedSaving) return;

    const savingRequest: SavingRequest = {
      id: selectedSaving.id,
      memberId: values.memberId,
      savingAmount: values.savingAmount,
      savingDate: values.savingDate,
      savingMethod: values.savingMethod,
      status: values.status,
    };
    updateMutation.mutate(savingRequest);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this saving?")) {
      deleteMutation.mutate(id);
    }
  };

  // Define columns for DataTable
  const columns: Column<Saving>[] = [
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
    {
      header: "Amount",
      accessorKey: "savingAmount",
      sortable: true,
      cell: (saving) => (
        <span className="font-medium">
          {new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
          }).format(saving?.savingAmount)}
        </span>
      ),
    },
    {
      header: "Date",
      accessorKey: "savingDate",
      sortable: true,
      cell: (saving) => (
        <span>{new Date(saving?.savingDate).toLocaleDateString()}</span>
      ),
    },
    {
      header: "Method",
      accessorKey: "savingMethod",
      sortable: true,
      cell: (saving) => (
        <span className="capitalize">
          {" "}
          {saving?.savingMethod ? saving.savingMethod.toLowerCase() : "N/A"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (saving) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            saving.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : saving.status === "COMPLETED"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {saving?.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (saving) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(saving);
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
              handleDelete(saving.id);
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
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Savings Management</CardTitle>
            <CardDescription>
              Manage member savings and contributions
            </CardDescription>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Saving
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Saving</DialogTitle>
                  <DialogDescription>
                    Create a new saving record for a member.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form
                    onSubmit={addForm.handleSubmit(onSubmitAdd)}
                    className="space-y-4"
                  >
                    <FormField
                      control={addForm.control}
                      name="memberId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Member</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {members?.map((member) => (
                                <SelectItem
                                  key={member.memberId}
                                  value={member.memberId.toString()}
                                >
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
                      control={addForm.control}
                      name="savingAmount"
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
                      control={addForm.control}
                      name="savingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saving Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="savingMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saving Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="REGULAR">Regular</SelectItem>
                              <SelectItem value="SPECIAL">Special</SelectItem>
                              <SelectItem value="FIXED">Fixed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="COMPLETED">
                                Completed
                              </SelectItem>
                              <SelectItem value="CANCELLED">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {savingsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading savings...</span>
              </div>
            ) : savings?.length === 0 ? (
              <div className="text-center py-10">
                <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No savings found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by creating a new saving record.
                </p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Saving
                </Button>
              </div>
            ) : (
              <DataTable
                data={savings}
                columns={columns}
                keyField="id"
                pagination={true}
                searchable={true}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                emptyMessage="No savings found"
                loading={savingsLoading}
                onRowClick={(saving) => handleEdit(saving)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Saving</DialogTitle>
            <DialogDescription>
              Update saving information for this record.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onSubmitEdit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members?.map((member) => (
                          <SelectItem
                            key={member.memberId}
                            value={member.memberId.toString()}
                          >
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
                control={editForm.control}
                name="savingAmount"
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
                control={editForm.control}
                name="savingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saving Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="savingMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saving Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="REGULAR">Regular</SelectItem>
                        <SelectItem value="SPECIAL">Special</SelectItem>
                        <SelectItem value="FIXED">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Savings;
