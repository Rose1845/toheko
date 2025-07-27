import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, User, Users, Loader2, X, ChevronLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { memberService } from "@/services/memberService";
import { nextOfKinService } from "@/services/nextOfKinService";
import { Member, NextOfKin } from "@/types/api";
import { formatDateSafe } from "@/lib/utils";
const memberFormSchema = z.object({
  memberId: z.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  nationalId: z.string().min(1, "National ID is required"),
  address: z.string().min(1, "Address is required"),
  nextOfKins: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1, "Name is required"),
      relationship: z.string().min(1, "Relationship is required"),
      phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
      email: z.string().email("Invalid email").or(z.literal("")),
      address: z.string().optional(),
    })
  ),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const Members = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("member");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      address: "",
      nextOfKins: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "nextOfKins",
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: memberService.getAllMembers,
  });

  const memberMutation = useMutation({
    mutationFn: (data: Omit<MemberFormValues, "nextOfKins"> & { dateOfBirth: string; status: string }) =>
      isEditing
        ? memberService.updateMember(data)
        : memberService.createMember(data),
    onSuccess: (data) => {
      if (!isEditing) {
        form.setValue("memberId", data.id);
      }
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({
        title: "Success",
        description: "Member details saved successfully",
      });
      // Only auto-switch to next of kin tab for new members
      if (!isEditing) {
        setActiveTab("nextOfKin");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save member",
        variant: "destructive",
      });
    },
  });

  const handleAddNextOfKin = async (nextOfKin: NextOfKin, memberId: number) => {
    try {
      const response = await nextOfKinService.createNextOfKin({
        ...nextOfKin,
        memberId
      });
      return response;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add next of kin",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdateNextOfKin = async (nextOfKin: NextOfKin) => {
    try {
      if (!nextOfKin.id) return;
      const response = await nextOfKinService.updateNextOfKin(nextOfKin.id, nextOfKin);
      return response;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update next of kin",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDeleteNextOfKin = async (id: number) => {
    try {
      await nextOfKinService.deleteNextOfKin(id);
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete next of kin",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleAddMember = () => {
    form.reset({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      address: "",
      nextOfKins: [],
    });
    setIsEditing(false);
    setActiveTab("member");
    setShowForm(true);
  };

  const handleEditMember = (member: Member, tab: "member" | "nextOfKin" = "member") => {
    form.reset({
      ...member,
      nextOfKins: member.nextOfKins || [],
    });
    setIsEditing(true);
    setActiveTab(tab); // Allow opening directly to next of kin tab
    setShowForm(true);
  };

  const onSubmitMember = (values: Omit<MemberFormValues, "nextOfKins">) => {
    // Provide default values for required fields if not present
    memberMutation.mutate({
      ...values,
      dateOfBirth: (values as any).dateOfBirth || "",
      status: (values as any).status || "ACTIVE",
    });
  };

  const onSubmitNextOfKin = async (values: MemberFormValues) => {
    if (!values.memberId) return;

    try {
      const memberId = values.memberId;
      const currentNextOfKins = values.nextOfKins;
      const originalNextOfKins = isEditing
        ? members?.find(m => m.memberId === memberId)?.nextOfKins || []
        : [];

      // Process deletions
      const toDelete = originalNextOfKins.filter(original =>
        !currentNextOfKins.some(current => current.id === original.id)
      );
      await Promise.all(toDelete.map(nok => nok.id ? handleDeleteNextOfKin(nok.id) : Promise.resolve()));

      // Process updates and additions
      await Promise.all(currentNextOfKins.map(nok => {
        if (nok.id) {
          // Map form object to NextOfKin type
          const original = originalNextOfKins.find(orig => orig.id === nok.id);
          return handleUpdateNextOfKin({
            ...original,
            ...nok,
            nextOfKinId: nok.id ?? original?.nextOfKinId ?? 0,
            memberId: memberId,
          });
        } else {
          // Map form object to NextOfKin type for creation
          return handleAddNextOfKin(
            {
              ...nok,
              nextOfKinId: 0, // or undefined if your backend auto-generates
              memberId: memberId,
            } as NextOfKin,
            memberId
          );
        }
      }));

      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({
        title: "Success",
        description: "Next of kin saved successfully",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving next of kin:", error);
    }
  };

  const addNextOfKin = () => {
    append({
      name: "",
      relationship: "",
      phoneNumber: "",
      email: "",
      address: "",
    });
  };

  const removeNextOfKin = (index: number) => {
    remove(index);
  };

  const columns = [
    { header: "ID", accessorKey: "memberId" },
    {
      header: "Name",
      accessorKey: "firstName",
      cell: (row: any) => `${row.firstName} ${row.lastName}`
    },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phoneNumber" },
    {
      header: "Next of Kin",
      accessorKey: "nextOfKins",
      cell: (row: any) => (
        <Button
          variant="link"
          className="h-auto p-0"
          onClick={() => handleEditMember(row, "nextOfKin")}
        >
          <Badge variant="outline">
            {row.nextOfKins?.length || 0}
          </Badge>
        </Button>
      ),
    },
    {
      header: "Created",
      accessorKey: "createDate",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span>{formatDateSafe(row.createdAt, "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {formatDateSafe(row.createdAt, "hh:mm a")}
          </span>
        </div>
      ),
    },
    {
      header: "Last Updated",
      accessorKey: "lastModified",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span>{formatDateSafe(row.updatedAt, "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {formatDateSafe(row.updatedAt, "hh:mm a")}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditMember(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleEditMember(row, "nextOfKin")}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>Manage SACCO members and their next of kin
            </CardDescription>
          </div>
          <Button onClick={handleAddMember}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={members || []}
              columns={columns}
              keyField="memberId"
              emptyMessage="No members found"
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Member" : "Add New Member"}
            </DialogTitle>
            {activeTab === "nextOfKin" && (
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("member")}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {isEditing ? "Member Details" : "Back to Member"}
                </Button>
              </div>
            )}
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                activeTab === "member" ? onSubmitMember : onSubmitNextOfKin
              )}
              className="space-y-6 pt-2"
            >
              {activeTab === "member" ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Next of Kin Details</h3>
                      <p className="text-sm text-muted-foreground">
                        {isEditing ? "Edit" : "Add"} next of kin for this member
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNextOfKin}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Next of Kin
                    </Button>
                  </div>

                  <Separator />

                  {fields.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg">
                      <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h4 className="mt-2 font-medium">No Next of Kin Added</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add at least one next of kin for this member
                      </p>
                    </div>
                  ) : (
                    fields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4 space-y-4 relative group">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-3 right-3 h-8 w-8 p-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeNextOfKin(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`nextOfKins.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`nextOfKins.${index}.relationship`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Relationship</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`nextOfKins.${index}.phoneNumber`}
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
                            control={form.control}
                            name={`nextOfKins.${index}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`nextOfKins.${index}.address`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address (Optional)</FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={2} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              <DialogFooter className="pt-4">
                {activeTab === "member" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                    // disabled={memberMutation.isLoading}
                    >
                      {/* {memberMutation.isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )} */}
                      {isEditing ? "Update Member" : "Save Member Details"}
                    </Button>
                    {isEditing && (
                      <Button
                        type="button"
                        onClick={() => setActiveTab("nextOfKin")}
                      >
                        Edit Next of Kin
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => isEditing ? setShowForm(false) : setActiveTab("member")}
                    >
                      {isEditing ? "Cancel" : "Back"}
                    </Button>
                    <Button
                      type="submit"
                    >
                      {isEditing ? "Save Changes" : "Complete Registration"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;

