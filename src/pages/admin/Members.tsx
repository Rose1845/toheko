import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { memberService } from "@/services/memberService";
import { Member, SuspensionRequest } from "@/types/api";
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
import { Edit, User, UserCheck, UserMinus, UserPlus } from "lucide-react";

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

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Members Management
          </h1>
          <p className="text-gray-500">View and manage all SACCO members</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Members List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading members...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members &&
                    members.map((member) => (
                      <TableRow key={member.memberId}>
                        <TableCell>{member.memberNo}</TableCell>
                        <TableCell>{`${member.firstName} ${member.lastName}`}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phoneNumber}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.status === "ACTIVE"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(member)}
                            >
                              <User className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMember(member)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            {member.status === "ACTIVE" ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-amber-600"
                                onClick={() => handleSuspendMember(member)}
                              >
                                <UserMinus className="h-4 w-4 mr-1" /> Suspend
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() =>
                                  handleReactivateMember(
                                    member.memberId! as unknown as number
                                  )
                                }
                              >
                                <UserCheck className="h-4 w-4 mr-1" />{" "}
                                Reactivate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
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
                Update member information using the form below.
              </DialogDescription>
            </DialogHeader>
            <Form {...memberForm}>
              <form
                onSubmit={memberForm.handleSubmit(onSubmitEdit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
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
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowEditForm(false)}
                  >
                    Cancel
                  </Button>
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
    </DashboardLayout>
  );
};

export default Members;
