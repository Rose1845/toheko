import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { nextOfKinService } from "@/services/nextOfKinService";
import { memberService } from "@/services/memberService";
import { NextOfKin, NextOfKinRequestDTO, Member } from "@/types/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, UserPlus, Loader2, Users, Trash2, AlertTriangle } from "lucide-react";

// Phone number validation and formatting (similar to Members.tsx)
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, ""); // Remove non-digits
  if (cleaned.startsWith("07") || cleaned.startsWith("01")) {
    return `254${cleaned.substring(1)}`;
  }
  return cleaned;
};

// Form schema for next of kin with validation
const nextOfKinFormSchema = z.object({
  memberId: z.number({ required_error: "Member is required" }).min(1, "Please select a member"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  otherNames: z.string().optional(),
  nationalId: z.string().min(1, "National ID is required"),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required" }),
  address: z.string().min(5, "Address must be at least 5 characters"),
  email: z.string().email("Please enter a valid email address (e.g., example@domain.com)"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .refine(
      (value) => {
        const cleaned = value.replace(/\D/g, "");
        return cleaned.length === 10 || cleaned.length === 12;
      },
      { message: "Phone number must be 10 digits (07...) or 12 digits (254...)" }
    ),
  dob: z.string().optional(),
  birthCertificateNo: z.string().optional(),
  relationship: z.string().min(2, "Relationship must be at least 2 characters"),
  nationality: z.string().min(2, "Nationality must be at least 2 characters"),
});

type NextOfKinFormValues = z.infer<typeof nextOfKinFormSchema>;

const NextOfKinManagement: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedNextOfKin, setSelectedNextOfKin] = useState<NextOfKin | null>(null);
  const [nextOfKinToDelete, setNextOfKinToDelete] = useState<NextOfKin | null>(null);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NextOfKinFormValues>({
    resolver: zodResolver(nextOfKinFormSchema),
    defaultValues: {
      memberId: 0,
      firstName: "",
      lastName: "",
      otherNames: "",
      nationalId: "",
      gender: "Male",
      address: "",
      email: "",
      phoneNumber: "",
      dob: "",
      birthCertificateNo: "",
      relationship: "",
      nationality: "",
    },
  });

  // Fetch next of kin data
  const {
    data: nextOfKins,
    isLoading,
    refetch,
  } = useQuery<NextOfKin[]>({
    queryKey: ["nextOfKins"],
    queryFn: nextOfKinService.getAllNextOfKins,
  });

  // Fetch members data for the dropdown
  const { data: members } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: memberService.getAllMembers,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: NextOfKinRequestDTO) => nextOfKinService.createNextOfKin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nextOfKins"] });
      toast({
        title: "Success",
        description: "Next of kin added successfully.",
      });
      setShowAddForm(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Error creating next of kin:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add next of kin. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAddLoading(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: NextOfKinRequestDTO }) =>
      nextOfKinService.updateNextOfKin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nextOfKins"] });
      toast({
        title: "Success",
        description: "Next of kin updated successfully.",
      });
      setShowEditForm(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Error updating next of kin:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update next of kin. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsEditLoading(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => nextOfKinService.deleteNextOfKin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nextOfKins"] });
      toast({
        title: "Success",
        description: "Next of kin deleted successfully.",
      });
      setShowDeleteConfirm(false);
      setNextOfKinToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error deleting next of kin:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete next of kin. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleteLoading(false);
    },
  });

  const handleViewDetails = (nextOfKin: NextOfKin) => {
    setSelectedNextOfKin(nextOfKin);
    setShowDetails(true);
  };

  const handleEditNextOfKin = (nextOfKin: NextOfKin) => {
    form.reset({
      memberId: nextOfKin.member?.memberId || 0,
      firstName: nextOfKin.firstName,
      lastName: nextOfKin.lastName,
      otherNames: nextOfKin.otherNames || "",
      nationalId: nextOfKin.nationalId,
      gender: nextOfKin.gender as "Male" | "Female" | "Other",
      address: nextOfKin.address,
      email: nextOfKin.email,
      phoneNumber: nextOfKin.phoneNumber,
      dob: nextOfKin.dob || "",
      birthCertificateNo: nextOfKin.birthCertificateNo || "",
      relationship: nextOfKin.relationship,
      nationality: nextOfKin.nationality,
    });
    setSelectedNextOfKin(nextOfKin);
    setShowEditForm(true);
  };

  const handleAddNextOfKin = () => {
    form.reset({
      memberId: 0,
      firstName: "",
      lastName: "",
      otherNames: "",
      nationalId: "",
      gender: "Male",
      address: "",
      email: "",
      phoneNumber: "",
      dob: "",
      birthCertificateNo: "",
      relationship: "",
      nationality: "",
    });
    setSelectedNextOfKin(null);
    setShowAddForm(true);
  };

  const handleConfirmDelete = (nextOfKin: NextOfKin) => {
    setNextOfKinToDelete(nextOfKin);
    setShowDeleteConfirm(true);
  };

  const handleDeleteNextOfKin = async () => {
    if (!nextOfKinToDelete) return;
    setIsDeleteLoading(true);
    deleteMutation.mutate(nextOfKinToDelete.nextOfKinId);
  };

  const onSubmitAdd = async (values: NextOfKinFormValues) => {
    setIsAddLoading(true);
    const formattedPhone = formatPhoneNumber(values.phoneNumber);
    const nextOfKinRequest: NextOfKinRequestDTO = {
      memberId: values.memberId,
      firstName: values.firstName,
      lastName: values.lastName,
      otherNames: values.otherNames || undefined,
      nationalId: values.nationalId,
      gender: values.gender,
      address: values.address,
      email: values.email,
      phoneNumber: formattedPhone,
      dob: values.dob || undefined,
      birthCertificateNo: values.birthCertificateNo || undefined,
      relationship: values.relationship,
      nationality: values.nationality,
    };
    createMutation.mutate(nextOfKinRequest);
  };

  const onSubmitEdit = async (values: NextOfKinFormValues) => {
    if (!selectedNextOfKin) return;
    setIsEditLoading(true);
    const formattedPhone = formatPhoneNumber(values.phoneNumber);
    const nextOfKinRequest: NextOfKinRequestDTO = {
      memberId: values.memberId,
      firstName: values.firstName,
      lastName: values.lastName,
      otherNames: values.otherNames || undefined,
      nationalId: values.nationalId,
      gender: values.gender,
      address: values.address,
      email: values.email,
      phoneNumber: formattedPhone,
      dob: values.dob || undefined,
      birthCertificateNo: values.birthCertificateNo || undefined,
      relationship: values.relationship,
      nationality: values.nationality,
    };
    updateMutation.mutate({ id: selectedNextOfKin.nextOfKinId, data: nextOfKinRequest });
  };

  // Define columns for DataTable
  const columns: Column<NextOfKin>[] = [
    {
      header: "ID",
      accessorKey: "nextOfKinId",
      sortable: true,
    },
    {
      header: "Member",
      accessorKey: "member",
      sortable: true,
      cell: (nextOfKin) => (
        <span className="font-medium">
          {nextOfKin.member ? `${nextOfKin.member.firstName} ${nextOfKin.member.lastName}` : "N/A"}
        </span>
      ),
    },
    {
      header: "Name",
      accessorKey: "firstName",
      sortable: true,
      cell: (nextOfKin) => (
        <span className="font-medium">
          {nextOfKin.firstName} {nextOfKin.lastName}
        </span>
      ),
    },
    {
      header: "Relationship",
      accessorKey: "relationship",
      sortable: true,
    },
    {
      header: "Contact",
      accessorKey: "email",
      sortable: true,
      cell: (nextOfKin) => (
        <div className="flex flex-col">
          <span>{nextOfKin.email}</span>
          <span className="text-xs text-muted-foreground">{nextOfKin.phoneNumber}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (nextOfKin) => (
        <Badge
          className={
            nextOfKin.status === "ACTIVE"
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : "bg-red-100 text-red-800 hover:bg-red-100"
          }
        >
          {nextOfKin.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "nextOfKinId",
      cell: (nextOfKin) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditNextOfKin(nextOfKin);
            }}
            className="border-gray-300 hover:bg-gray-100 transition-colors duration-200"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmDelete(nextOfKin);
            }}
            className="bg-red-600 hover:bg-red-700 transition-colors duration-200"
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
              <CardTitle>Next of Kin</CardTitle>
              <CardDescription>
                Manage next of kin records for SACCO members
              </CardDescription>
            </div>
            <Button
              onClick={handleAddNextOfKin}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Next of Kin
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading next of kin...</span>
              </div>
            ) : !nextOfKins || nextOfKins.length === 0 ? (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No next of kin found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by adding new next of kin records.
                </p>
                <Button
                  onClick={handleAddNextOfKin}
                  className="mt-4 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  variant="outline"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Next of Kin
                </Button>
              </div>
            ) : (
              <DataTable
                data={nextOfKins}
                columns={columns}
                keyField="nextOfKinId"
                pagination={true}
                searchable={true}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                emptyMessage="No next of kin found"
                loading={isLoading}
                onRowClick={(nextOfKin) => handleViewDetails(nextOfKin)}
              />
            )}
          </CardContent>
        </Card>

        {/* View Next of Kin Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform animate-fadeIn">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                Next of Kin Details
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-1">
                Complete information about the selected next of kin
              </DialogDescription>
            </DialogHeader>
            {selectedNextOfKin && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Member</h3>
                    <p className="text-gray-800">{selectedNextOfKin.member ? `${selectedNextOfKin.member.firstName} ${selectedNextOfKin.member.lastName}` : "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Full Name</h3>
                    <p className="text-gray-800">{`${selectedNextOfKin.firstName} ${selectedNextOfKin.lastName}`}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Relationship</h3>
                    <p className="text-gray-800">{selectedNextOfKin.relationship}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Email</h3>
                    <p className="text-gray-800">{selectedNextOfKin.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Phone Number</h3>
                    <p className="text-gray-800">{selectedNextOfKin.phoneNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">National ID</h3>
                    <p className="text-gray-800">{selectedNextOfKin.nationalId}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Gender</h3>
                    <p className="text-gray-800">{selectedNextOfKin.gender}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Date of Birth</h3>
                    <p className="text-gray-800">{selectedNextOfKin.dob ? new Date(selectedNextOfKin.dob).toLocaleDateString() : "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Birth Certificate No</h3>
                    <p className="text-gray-800">{selectedNextOfKin.birthCertificateNo || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Nationality</h3>
                    <p className="text-gray-800">{selectedNextOfKin.nationality}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Status</h3>
                    <Badge
                      variant={selectedNextOfKin.status === "ACTIVE" ? "default" : "destructive"}
                      className={
                        selectedNextOfKin.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {selectedNextOfKin.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500">Address</h3>
                  <p className="text-gray-800">{selectedNextOfKin.address}</p>
                </div>
                <DialogFooter className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetails(false);
                      handleEditNextOfKin(selectedNextOfKin);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Next of Kin
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Next of Kin Form Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform animate-fadeIn max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <UserPlus className="h-6 w-6 text-blue-600 mr-2" />
                Add New Next of Kin
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-1">
                Enter the details for the new next of kin below.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="memberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Member</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value ? field.value.toString() : ""}
                          >
                            <SelectTrigger className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <SelectValue placeholder="Select a member" />
                            </SelectTrigger>
                            <SelectContent>
                              {members?.map((member) => (
                                <SelectItem key={member.memberId} value={member.memberId.toString()}>
                                  {`${member.firstName} ${member.lastName}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otherNames"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Other Names</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">National ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Gender</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., 07xxxxxxxx or 254xxxxxxxx"
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthCertificateNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Birth Certificate No</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Relationship</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Nationality</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm mt-1" />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAddLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                  >
                    {isAddLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Next of Kin
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Next of Kin Form Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform animate-fadeIn max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <Edit className="h-6 w-6 text-blue-600 mr-2" />
                Edit Next of Kin
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-1">
                Update the selected next of kin's information below.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="memberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Member</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value ? field.value.toString() : ""}
                          >
                            <SelectTrigger className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <SelectValue placeholder="Select a member" />
                            </SelectTrigger>
                            <SelectContent>
                              {members?.map((member) => (
                                <SelectItem key={member.memberId} value={member.memberId.toString()}>
                                  {`${member.firstName} ${member.lastName}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otherNames"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Other Names</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">National ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Gender</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., 07xxxxxxxx or 254xxxxxxxx"
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthCertificateNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Birth Certificate No</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Relationship</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Nationality</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          />
                        </FormControl>
                        <FormMessage className="text-red-600 text-sm mt-1" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage className="text-red-600 text-sm mt-1" />
                    </FormItem>
                  )}
                />

                <DialogFooter className="flex justify-end space-x-3 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditForm(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isEditLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl transition-all duration-300 ease-in-out transform animate-fadeIn">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-1">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {nextOfKinToDelete ? `${nextOfKinToDelete.firstName} ${nextOfKinToDelete.lastName}` : ""}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setNextOfKinToDelete(null);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                disabled={isDeleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteNextOfKin}
                className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                disabled={isDeleteLoading}
              >
                {isDeleteLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    // </DashboardLayout>
  );
};

export default NextOfKinManagement;