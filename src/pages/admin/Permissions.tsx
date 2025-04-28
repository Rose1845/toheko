import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from './DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { permissionService } from '@/services/permissionService';
import { Permission, PermissionDTO } from '@/types/api';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Plus, Shield, Loader2 } from 'lucide-react';

// Form schema for permissions
const permissionFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().default("ACTIVE")
});

type PermissionFormValues = z.infer<typeof permissionFormSchema>;

const Permissions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Query permissions
  const { data: permissions = [], isLoading, isError } = useQuery({
    queryKey: ['permissions'],
    queryFn: permissionService.getAllPermissions,
  });

  // Forms
  const addForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE"
    }
  });

  const editForm = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "ACTIVE"
    }
  });

  // Mutations
  const createPermission = async (permission: PermissionDTO): Promise<Permission> => {
    // Mock implementation since the API endpoint might not exist yet
    const response = await permissionService.updatePermission(0, permission);
    return response;
  };

  const createMutation = useMutation({
    mutationFn: createPermission,
    onSuccess: () => {
      toast({ title: "Success", description: "Permission created successfully" });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      addForm.reset();
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create permission" });
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, permission }: { id: number, permission: PermissionDTO }) => 
      permissionService.updatePermission(id, permission),
    onSuccess: () => {
      toast({ title: "Success", description: "Permission updated successfully" });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: "Failed to update permission" });
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => permissionService.deletePermission(id),
    onSuccess: () => {
      toast({ title: "Success", description: "Permission deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete permission" });
      console.error(error);
    },
  });

  // Handlers
  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    editForm.reset({
      name: permission.name,
      description: permission.description,
      status: permission.status
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this permission?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmitAdd = (values: PermissionFormValues) => {
    const newPermission: PermissionDTO = {
      name: values.name,
      description: values.description,
      status: values.status
    };
    createMutation.mutate(newPermission);
  };

  const onSubmitEdit = (values: PermissionFormValues) => {
    if (!selectedPermission) return;

    const updatedPermission: PermissionDTO = {
      name: values.name,
      description: values.description,
      status: values.status
    };

    updateMutation.mutate({
      id: selectedPermission.id,
      permission: updatedPermission
    });
  };

  // Define columns for DataTable
  const columns: Column<Permission>[] = [
    {
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      header: "Name",
      accessorKey: "name",
      sortable: true,
      cell: (permission) => (
        <span className="font-medium">{permission.name}</span>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (permission) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            permission.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {permission.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (permission) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(permission);
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
              handleDelete(permission.id);
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
            <div>
              <CardTitle>Permissions Management</CardTitle>
              <CardDescription>
                Manage system permissions for users and roles
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Permission
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading permissions...</span>
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-500">
                Error loading permissions. Please try again.
              </div>
            ) : permissions.length > 0 ? (
              <DataTable
                data={permissions}
                columns={columns}
                keyField="id"
                pagination={true}
                searchable={true}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                emptyMessage="No permissions found"
                loading={isLoading}
                onRowClick={handleEdit}
              />
            ) : (
              <div className="text-center py-10">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No permissions found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start by creating a new permission to manage system access.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Permission</DialogTitle>
            <DialogDescription>Create a new system permission.</DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(onSubmitAdd)}
              className="space-y-4"
            >
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter permission name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what this permission allows"
                      />
                    </FormControl>
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
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update permission details.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onSubmitEdit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter permission name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what this permission allows"
                      />
                    </FormControl>
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
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Permissions;
