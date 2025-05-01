import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/pages/admin/DashboardLayout";
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
import { Edit, User, UserCheck, UserMinus, UserPlus, Loader2, Users } from "lucide-react";

// Form schema for member details - making all fields required to match MemberRequest
const memberFormSchema = z.object({
  memberId: z.number(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  nationalId: z.string().min(1, "National ID is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  status: z.string(),
});

// Form schema for suspension
const suspensionFormSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  suspendedUntil: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;
type SuspensionFormValues = z.infer<typeof suspensionFormSchema>;

const Members = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { toast } = useToast();

  const memberForm = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      memberId: 0,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      dateOfBirth: "",
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
  } = useQuery({
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
      dateOfBirth: member.dateOfBirth.split("T")[0],
      address: member.address,
      status: member.status,
    });
    setSelectedMember(member);
    setShowEditForm(true);
  };

  const handleSuspendMember = (member: Member) => {
    suspensionForm.reset({
      reason: "",
      suspendedUntil: "",
    });
    setSelectedMember(member);
    setShowSuspendForm(true);
  };

  const handleReactivateMember = async (memberId: number) => {
    try {
      const result = await memberService.reactivateMember(memberId);
      toast({
        title: "Success",
        description: result.message || "Member reactivated successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error reactivating member:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate member",
        variant: "destructive",
      });
    }
  };

  const onSubmitEdit = async (values: MemberFormValues) => {
    try {
      // Ensure all required fields are provided before submitting
      const memberRequest = {
        memberId: values.memberId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        nationalId: values.nationalId,
        dateOfBirth: values.dateOfBirth,
        address: values.address,
        status: values.status,
      };

      const result = await memberService.updateMember(memberRequest);
      toast({
        title: "Success",
        description: result.message || "Member updated successfully",
      });
      setShowEditForm(false);
      refetch();
    } catch (error) {
      console.error("Error updating member:", error);
      toast({
        title: "Error",
        description: "Failed to update member",
        variant: "destructive",
      });
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
        description: result.message || "Member suspended successfully",
      });
      setShowSuspendForm(false);
      refetch();
    } catch (error) {
      console.error("Error suspending member:", error);
      toast({
        title: "Error",
        description: "Failed to suspend member",
        variant: "destructive",
      });
    }
  };

  // Define columns for DataTable
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
      header: "Registration Date",
      accessorKey: "registrationDate",
      sortable: true,
      cell: (member) => (
        <span>
          {member.registrationDate 
            ? new Date(member.registrationDate).toLocaleDateString() 
            : "N/A"}
        </span>
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
            <Button onClick={() => {}}>
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
                  onClick={() => {}} 
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
                    <h3 className="font-medium text-gray-500">
                      Registration Date
                    </h3>
                    <p>
                      {new Date(
                        selectedMember.registrationDate
                      ).toLocaleDateString()}
                    </p>
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
                      {new Date(
                        selectedMember.dateOfBirth
                      ).toLocaleDateString()}
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

        {/* Edit Member Form Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
              <DialogDescription>
                Update the selected member's information
              </DialogDescription>
            </DialogHeader>

            <Form {...memberForm}>
              <form
                onSubmit={memberForm.handleSubmit(onSubmitEdit)}
                className="grid gap-4 py-4"
              >
                <FormField
                  control={memberForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={memberForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={memberForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={memberForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={memberForm.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>National ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={memberForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={memberForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
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
      </div>
    // </DashboardLayout>
  );
};

export default Members;
