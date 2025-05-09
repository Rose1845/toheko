import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/pages/admin/DashboardLayout"; // Ensure this import is correct
import { memberService } from "@/services/memberService";
import { Member, SuspensionRequest } from "@/types/api";
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
import { Edit, User, UserCheck, UserMinus, UserPlus, Loader2, Users, Trash2, AlertTriangle } from "lucide-react";

// Phone number validation and formatting
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, ""); // Remove non-digits
  if (cleaned.startsWith("07") || cleaned.startsWith("01")) {
    return `254${cleaned.substring(1)}`;
  }
  return cleaned;
};

// Form schema for member details with enhanced email validation (removed dateOfBirth)
const memberFormSchema = z.object({
  memberId: z.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address (e.g., example@domain.com)"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (value) => {
        const cleaned = value.replace(/\D/g, "");
        return cleaned.length === 10 || cleaned.length === 12;
      },
      {
        message: "Phone number must be 10 digits (07...) or 12 digits (254...)",
      }
    ),
  nationalId: z.string().min(1, "National ID is required"),
  address: z.string().min(1, "Address is required"),
  status: z.string().optional(),
});

// Form schema for suspension
const suspensionFormSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  suspendedUntil: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;
type SuspensionFormValues = z.infer<typeof suspensionFormSchema>;

const Members: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const { toast } = useToast();
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const memberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      memberId: 0,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      address: "",
      status: "ACTIVE",
    },
  });

  const suspensionForm = useForm<SuspensionFormValues>({
    resolver: zodResolver(suspensionFormSchema),
    defaultValues: {
      reason: "",
      suspendedUntil: "",
    },
  });

  // Fetch members data
  const {
    data: members,
    isLoading,
    error,
    refetch,
  } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: memberService.getAllMembers,
  });

  const handleViewDetails = (member: Member) => {
    setSelectedMember(member);
    setShowDetails(true);
  };

  const handleEditMember = (member: Member) => {
    memberForm.reset({
      memberId: member.memberId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phoneNumber: member.phoneNumber,
      nationalId: member.nationalId,
      address: member.address,
      status: member.status,
    });
    setSelectedMember(member);
    setShowEditForm(true);
  };

  const handleAddMember = () => {
    memberForm.reset({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      address: "",
      status: "ACTIVE",
    });
    setSelectedMember(null);
    setShowAddForm(true);
  };

  const handleSuspendMember = (member: Member) => {
    suspensionForm.reset({
      reason: "",
      suspendedUntil: "",
    });
    setSelectedMember(member);
    setShowSuspendForm(true);
  };

  const handleConfirmDelete = (member: Member) => {
    setMemberToDelete(member);
    setShowDeleteConfirm(true);
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
  
    try {
      const result = await memberService.deleteMember(memberToDelete.memberId);
      toast({
        title: "Success",
        description: result.message || "Member deleted successfully.",
      });
      refetch();
    } catch (error: any) {
      console.error("Error deleting member:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete member. This may be due to associated user records. Please delete or reassign them first, then try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
      setMemberToDelete(null);
    }
  };
  const handleReactivateMember = async (memberId: number) => {
    try {
      const result = await memberService.reactivateMember(memberId);
      toast({
        title: "Success",
        description: result.message || "Member reactivated successfully.",
      });
      refetch();
    } catch (error: any) {
      console.error("Error reactivating member:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reactivate member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmitEdit = async (values: MemberFormValues) => {
    setIsEditLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(values.phoneNumber);
      const memberRequest = {
        memberId: values.memberId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: formattedPhone,
        nationalId: values.nationalId,
        address: values.address,
        status: values.status,
      };

      const result = await memberService.updateMember(memberRequest);
      toast({
        title: "Success",
        description: result.message || "Member updated successfully.",
      });
      setShowEditForm(false);
      refetch();
    } catch (error: any) {
      console.error("Error updating member:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update member. Please check the details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditLoading(false);
    }
  };

  const onSubmitAdd = async (values: MemberFormValues) => {
    setIsAddLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(values.phoneNumber);
      const memberRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: formattedPhone,
        nationalId: values.nationalId,
        address: values.address,
        status: "ACTIVE",
      };

      const result = await memberService.createMember(memberRequest);
      toast({
        title: "Success",
        description: result.message || "Member added successfully.",
      });
      setShowAddForm(false);
      refetch();
    } catch (error: any) {
      console.error("Error creating member:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add member. Please check the details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddLoading(false);
    }
  };

  const onSubmitSuspension = async (values: SuspensionFormValues) => {
    if (!selectedMember) return;

    try {
      const suspensionRequest: SuspensionRequest = {
        reason: values.reason,
        suspendedUntil: values.suspendedUntil || undefined,
      };

      const result = await memberService.suspendMember(
        selectedMember.memberId,
        suspensionRequest
      );
      toast({
        title: "Success",
        description: result.message || "Member suspended successfully.",
      });
      setShowSuspendForm(false);
      refetch();
    } catch (error: any) {
      console.error("Error suspending member:", error.response?.data || error.message);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to suspend member. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Define columns for DataTable (removed Registration Date)
  const columns: Column<Member>[] = [
    {
      header: "ID",
      accessorKey: "memberId",
      sortable: true,
    },
    {
      header: "Member No",
      accessorKey: "memberNo",
      sortable: true,
    },
    {
      header: "Name",
      accessorKey: "firstName",
      sortable: true,
      cell: (member) => (
        <span className="font-medium">
          {member.firstName} {member.lastName}
        </span>
      ),
    },
    {
      header: "Contact",
      accessorKey: "email",
      sortable: true,
      cell: (member) => (
        <div className="flex flex-col">
          <span>{member.email}</span>
          <span className="text-xs text-muted-foreground">{member.phoneNumber}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (member) => (
        <Badge
          className={
            member.status === "ACTIVE"
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : member.status === "SUSPENDED"
              ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
              : "bg-red-100 text-red-800 hover:bg-red-100"
          }
        >
          {member.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "memberId",
      cell: (member) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditMember(member);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {member.status === "ACTIVE" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSuspendMember(member);
              }}
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Suspend
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReactivateMember(member.memberId);
              }}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Reactivate
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmDelete(member);
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
    // <DashboardLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                Manage SACCO members and their accounts
              </CardDescription>
            </div>
            <Button onClick={handleAddMember}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading members...</span>
              </div>
            ) : members?.length === 0 ? (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No members found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by adding new members to the SACCO.
                </p>
                <Button
                  onClick={handleAddMember}
                  className="mt-4"
                  variant="outline"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            ) : (
              <DataTable
                data={members}
                columns={columns}
                keyField="memberId"
                pagination={true}
                searchable={true}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                emptyMessage="No members found"
                loading={isLoading}
                onRowClick={(member) => handleViewDetails(member)}
              />
            )}
          </CardContent>
        </Card>

        {/* View Member Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Member Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected member
              </DialogDescription>
            </DialogHeader>
            {selectedMember && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Member Number</h3>
                    <p>{selectedMember.memberNo}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Full Name</h3>
                    <p>{`${selectedMember.firstName} ${selectedMember.lastName}`}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Email</h3>
                    <p>{selectedMember.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Phone Number</h3>
                    <p>{selectedMember.phoneNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">National ID</h3>
                    <p>{selectedMember.nationalId}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Date of Birth</h3>
                    <p>
                      {selectedMember.dateOfBirth
                        ? new Date(selectedMember.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Status</h3>
                    <Badge
                      variant={
                        selectedMember.status === "ACTIVE"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {selectedMember.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Address</h3>
                  <p>{selectedMember.address}</p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetails(false);
                      handleEditMember(selectedMember);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit Member
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Member Form Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Add New Member</DialogTitle>
              <DialogDescription className="text-gray-600">
                Enter the details for the new member below.
              </DialogDescription>
            </DialogHeader>

            <Form {...memberForm}>
              <form
                onSubmit={memberForm.handleSubmit(onSubmitAdd)}
                className="space-y-6 py-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={memberForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={memberForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={memberForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={memberForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., 07xxxxxxxx or 254xxxxxxxx"
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={memberForm.control}
                    name="nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">National ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={memberForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm" />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex justify-end mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="mr-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAddLoading}
                    className="bg-primary text-white hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isAddLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Member Form Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">Edit Member</DialogTitle>
              <DialogDescription className="text-gray-600">
                Update the selected member's information below.
              </DialogDescription>
            </DialogHeader>

            <Form {...memberForm}>
              <form
                onSubmit={memberForm.handleSubmit(onSubmitEdit)}
                className="space-y-6 py-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={memberForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={memberForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={memberForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={memberForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., 07xxxxxxxx or 254xxxxxxxx"
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={memberForm.control}
                    name="nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">National ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={memberForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm" />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex justify-end mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditForm(false)}
                    className="mr-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isEditLoading}
                    className="bg-primary text-white hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isEditLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Suspend Member Form Dialog */}
        <Dialog open={showSuspendForm} onOpenChange={setShowSuspendForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Suspend Member</DialogTitle>
              <DialogDescription>
                Provide a reason for suspending this member.
              </DialogDescription>
            </DialogHeader>
            <Form {...suspensionForm}>
              <form
                onSubmit={suspensionForm.handleSubmit(onSubmitSuspension)}
                className="space-y-4"
              >
                <FormField
                  control={suspensionForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Suspension</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter the reason for suspension"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={suspensionForm.control}
                  name="suspendedUntil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suspended Until (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowSuspendForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" type="submit">
                    Suspend Member
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
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {memberToDelete ? `${memberToDelete.firstName} ${memberToDelete.lastName}` : ""}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setMemberToDelete(null);
                }}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteMember}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    // </DashboardLayout>
  );
};

export default Members;