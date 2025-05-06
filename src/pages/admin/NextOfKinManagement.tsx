import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { nextOfKinService } from "@/services/nextOfKinService";
import { NextOfKin, NextOfKinRequestDTO } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { z } from "zod";
import DashboardLayout from "./DashboardLayout";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { memberService } from "@/services/memberService";

const nextOfKinSchema = z.object({
  memberId: z.number({ required_error: "Member ID is required" }),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  relationship: z.string().min(2, "Relationship must be at least 2 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  email: z.string().email("Please enter a valid email"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

const NextOfKinManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingKin, setEditingKin] = useState<NextOfKin | null>(null);
  const [deletingKinId, setDeletingKinId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<NextOfKinRequestDTO>({
    memberId: 0,
    firstName: "",
    lastName: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    address: "",
  });

  const queryClient = useQueryClient();

  const { data: nextOfKins = [], isLoading } = useQuery({
    queryKey: ["nextOfKins"],
    queryFn: nextOfKinService.getAllNextOfKins,
  });
  console.log({ nextOfKins });

  const createMutation = useMutation({
    mutationFn: nextOfKinService.createNextOfKin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nextOfKins"] });
      setIsDialogOpen(false);
      toast.success("Next of kin added successfully");
      resetForm();
    },
    onError: (error) => {
      console.error("Error creating next of kin:", error);
      toast.error("Failed to add next of kin");
    },
  });

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: memberService.getAllMembers,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: NextOfKinRequestDTO }) =>
      nextOfKinService.updateNextOfKin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nextOfKins"] });
      setIsDialogOpen(false);
      toast.success("Next of kin updated successfully");
      resetForm();
    },
    onError: (error) => {
      console.error("Error updating next of kin:", error);
      toast.error("Failed to update next of kin");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => nextOfKinService.deleteNextOfKin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nextOfKins"] });
      setIsDeleteDialogOpen(false);
      toast.success("Next of kin deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting next of kin:", error);
      toast.error("Failed to delete next of kin");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "memberId") {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validateForm = () => {
    try {
      nextOfKinSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0].toString();
          errors[field] = err.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    if (editingKin) {
      updateMutation.mutate({ id: editingKin.nextOfKinId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (kin: NextOfKin) => {
    setEditingKin(kin);
    setFormData({
      memberId: kin.memberId,
      firstName: kin.firstName,
      lastName: kin.lastName,
      relationship: kin.relationship,
      phoneNumber: kin.phoneNumber,
      email: kin.email,
      address: kin.address,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingKinId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingKinId) {
      deleteMutation.mutate(deletingKinId);
    }
  };

  const resetForm = () => {
    setFormData({
      memberId: 0,
      firstName: "",
      lastName: "",
      relationship: "",
      phoneNumber: "",
      email: "",
      address: "",
    });
    setEditingKin(null);
    setFormErrors({});
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    // <DashboardLayout>/
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Next of Kin Management</h1>
          <Button onClick={openAddDialog}>Add Next of Kin</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading next of kin data...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nextOfKins.length > 0 ? (
                  nextOfKins.map((kin) => (
                    <TableRow key={kin.nextOfKinId}>
                      <TableCell>{`${kin?.member?.firstName} ${kin?.member.lastName}`}</TableCell>
                      <TableCell>{`${kin.firstName} ${kin.lastName}`}</TableCell>
                      <TableCell>{kin.relationship}</TableCell>
                      <TableCell>{kin.phoneNumber}</TableCell>
                      <TableCell>{kin.email}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(kin)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(kin.nextOfKinId)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No next of kin records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingKin ? "Edit Next of Kin" : "Add Next of Kin"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid items-center gap-2">
                <Label htmlFor="memberId">Member</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, memberId: parseInt(value) })
                  }
                  value={formData.memberId ? formData.memberId.toString() : ""}
                >
                  <SelectTrigger id="memberId">
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member) => (
                      <SelectItem
                        key={member.memberId}
                        value={member.memberId.toString()}
                      >
                        {`${member.firstName} ${member.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.memberId && (
                  <p className="text-sm text-red-500">{formErrors.memberId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid items-center gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={formErrors.firstName ? "border-red-500" : ""}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-500">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>
                <div className="grid items-center gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={formErrors.lastName ? "border-red-500" : ""}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-500">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className={formErrors.relationship ? "border-red-500" : ""}
                />
                {formErrors.relationship && (
                  <p className="text-sm text-red-500">
                    {formErrors.relationship}
                  </p>
                )}
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={formErrors.phoneNumber ? "border-red-500" : ""}
                />
                {formErrors.phoneNumber && (
                  <p className="text-sm text-red-500">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={formErrors.address ? "border-red-500" : ""}
                />
                {formErrors.address && (
                  <p className="text-sm text-red-500">{formErrors.address}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingKin ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>
              Are you sure you want to delete this next of kin record? This
              action cannot be undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
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
    // </DashboardLayout>
  );
};

export default NextOfKinManagement;
