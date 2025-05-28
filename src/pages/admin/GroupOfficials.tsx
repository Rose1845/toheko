import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { groupService } from "@/services/groupService";
import { Group, GroupOfficial } from "@/types/api";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
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
import { Edit, UserPlus, Loader2, Trash2, AlertTriangle, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Form schema for official details
const officialFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  role: z.string().min(1, "Role is required"),
  groupId: z.number().optional(),
});

type OfficialFormValues = z.infer<typeof officialFormSchema>;

const GroupOfficials: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState<GroupOfficial | null>(null);
  const [officialToDelete, setOfficialToDelete] = useState<GroupOfficial | null>(null);
  const { toast } = useToast();
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  // Initialize the form
  const officialForm = useForm<OfficialFormValues>({
    resolver: zodResolver(officialFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      role: "",
    },
  });

  // Fetch all group officials
  const {
    data: officials,
    isLoading,
    error,
    refetch,
  } = useQuery<GroupOfficial[]>({
    queryKey: ["groupOfficials"],
    queryFn: groupService.getAllGroupOfficials,
  });

  // Fetch all groups for the dropdown
  const {
    data: allGroups,
  } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: groupService.getAllGroups,
    onSuccess: (data) => {
      setGroups(data || []);
    },
  });

  const handleViewDetails = (official: GroupOfficial) => {
    setSelectedOfficial(official);
    setShowDetails(true);
  };

  const handleEditOfficial = (official: GroupOfficial) => {
    setSelectedOfficial(official);
    
    officialForm.reset({
      name: official.name,
      phoneNumber: official.phoneNumber,
      role: official.role,
      groupId: official.group?.groupId,
    });
    
    setShowEditForm(true);
  };

  const handleAddOfficial = () => {
    officialForm.reset({
      name: "",
      phoneNumber: "",
      role: "",
      groupId: undefined,
    });
    setShowAddForm(true);
  };

  const handleConfirmDelete = (official: GroupOfficial) => {
    setOfficialToDelete(official);
    setShowDeleteConfirm(true);
  };

  const handleDeleteOfficial = async () => {
    if (!officialToDelete?.id) return;

    try {
      await groupService.deleteGroupOfficial(officialToDelete.id);
      toast({
        title: "Success",
        description: `Official ${officialToDelete.name} has been deleted.`,
        variant: "default",
      });
      refetch();
    } catch (error) {
      console.error("Failed to delete official:", error);
      toast({
        title: "Error",
        description: "Failed to delete official. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
      setOfficialToDelete(null);
    }
  };

  const onSubmitEdit = async (values: OfficialFormValues) => {
    if (!selectedOfficial?.id) return;
    
    setIsEditLoading(true);
    try {
      const officialData = {
        name: values.name,
        phoneNumber: values.phoneNumber,
        role: values.role,
        groupId: values.groupId
      };
      
      await groupService.updateGroupOfficial(selectedOfficial.id, officialData);
      toast({
        title: "Success",
        description: "Official has been updated successfully.",
        variant: "default",
      });
      refetch();
      setShowEditForm(false);
    } catch (error) {
      console.error("Failed to update official:", error);
      toast({
        title: "Error",
        description: "Failed to update official. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditLoading(false);
    }
  };

  const onSubmitAdd = async (values: OfficialFormValues) => {
    setIsAddLoading(true);
    try {
      const officialData = {
        name: values.name,
        phoneNumber: values.phoneNumber,
        role: values.role,
        groupId: values.groupId
      };
      
      await groupService.createGroupOfficial(officialData);
      toast({
        title: "Success",
        description: "Official has been added successfully.",
        variant: "default",
      });
      refetch();
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add official:", error);
      toast({
        title: "Error",
        description: "Failed to add official. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddLoading(false);
    }
  };

  // Define columns for the data table
  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Phone Number",
      accessorKey: "phoneNumber",
    },
    {
      header: "Role",
      accessorKey: "role",
    },
    {
      header: "Group",
      accessorKey: "group.groupName",
      cell: (official: GroupOfficial) => (
        <span>{official.group?.groupName || "N/A"}</span>
      ),
    },
    {
      header: "Actions",
      cell: (official: GroupOfficial) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(official)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditOfficial(official)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:bg-red-50"
            onClick={() => handleConfirmDelete(official)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Group Officials</CardTitle>
              <CardDescription>
                Manage officials for all community groups
              </CardDescription>
            </div>
            <Button onClick={handleAddOfficial}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Official
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={officials || []}
              isLoading={isLoading}
              searchPlaceholder="Search officials..."
              searchColumn="name"
              keyField="id"
            />
          </CardContent>
        </Card>

        {/* View Official Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Official Details</DialogTitle>
            </DialogHeader>
            {selectedOfficial && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Name</h3>
                    <p>{selectedOfficial.name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Phone Number</h3>
                    <p>{selectedOfficial.phoneNumber}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Role</h3>
                  <p>{selectedOfficial.role}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Group</h3>
                  <p>{selectedOfficial.group?.groupName || "N/A"}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Official Form Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Official</DialogTitle>
              <DialogDescription>
                Enter the details of the new group official.
              </DialogDescription>
            </DialogHeader>
            <Form {...officialForm}>
              <form onSubmit={officialForm.handleSubmit(onSubmitAdd)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={officialForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Official's name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={officialForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="e.g., 0712345678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={officialForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="e.g., Chairperson" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={officialForm.control}
                    name="groupId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group</FormLabel>
                        <FormControl>
                          <select
                            className="w-full p-2 border rounded"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          >
                            <option value="">Select a group</option>
                            {groups.map((group) => (
                              <option key={group.groupId} value={group.groupId}>
                                {group.groupName}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAddLoading}>
                    {isAddLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Official"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Official Form Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Official</DialogTitle>
              <DialogDescription>
                Update the official details.
              </DialogDescription>
            </DialogHeader>
            <Form {...officialForm}>
              <form onSubmit={officialForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={officialForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Official's name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={officialForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="e.g., 0712345678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={officialForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="e.g., Chairperson" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={officialForm.control}
                    name="groupId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group</FormLabel>
                        <FormControl>
                          <select
                            className="w-full p-2 border rounded"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          >
                            <option value="">Select a group</option>
                            {groups.map((group) => (
                              <option key={group.groupId} value={group.groupId}>
                                {group.groupName}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isEditLoading}>
                    {isEditLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Official"
                    )}
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
                  {officialToDelete ? officialToDelete.name : ""}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOfficialToDelete(null);
                }}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteOfficial}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GroupOfficials;
