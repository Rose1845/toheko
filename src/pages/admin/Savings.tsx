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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Plus } from "lucide-react";

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

  // Handle loading state
  if (savingsLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading savings data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Savings Management</CardTitle>
              <CardDescription>
                Manage member savings and contributions
              </CardDescription>
            </div>
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
            {savings && savings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savings.map((saving) => (
                    <TableRow key={saving.id}>
                      <TableCell>{saving.id}</TableCell>
                      <TableCell>{saving.memberId}</TableCell>
                      <TableCell>{saving.savingAmount}</TableCell>
                      <TableCell>
                        {new Date(saving.savingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{saving.savingMethod}</TableCell>
                      <TableCell>{saving.status}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(saving)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(saving.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-4">No savings records found</p>
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
                            key={member.id}
                            value={member.id.toString()}
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
