import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Role, User, UserDTO } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { z } from "zod";
import DashboardLayout from "./DashboardLayout";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { roleService } from "@/services/roleService";
import { userService } from "@/services/userService";

// Schema for validation
const userSchema = z.object({
  firstname: z.string().min(2, "First name must be at least 2 characters"),
  lastname: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  userStatus: z.string(),
  userPhoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.object({
    roleCode: z.number().min(1, "Role is required"),
  }),
});

const Users = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Role[]>([]);

  const [formData, setFormData] = useState<UserDTO>({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    userStatus: "ACTIVE",
    userPhoneNumber: "",
    role: { roleCode: 0 },
  });

  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getAllUsers,
    retry: 3,
    staleTime: 60000, // 1 minute
  });

  // Fetch roles for dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await roleService.getAllRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDialogOpen(false);
      toast.success("User added successfully");
      resetForm();
    },
    onError: (error) => {
      console.error("Error creating user:", error);
      toast.error("Failed to add user");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserDTO }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDialogOpen(false);
      toast.success("User updated successfully");
      resetForm();
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDeleteDialogOpen(false);
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user changes input
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, userStatus: value as "ACTIVE" | "INACTIVE" });

    if (formErrors.userStatus) {
      setFormErrors({ ...formErrors, userStatus: "" });
    }
  };

  const handleRoleChange = (value: string) => {
    const roleCode = parseInt(value);
    setFormData({ ...formData, role: { roleCode } });

    // Clear error
    if (formErrors.role) {
      setFormErrors({ ...formErrors, role: "" });
    }
  };

  const validateForm = () => {
    try {
      userSchema.parse(formData);
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
    if (!validateForm()) return;

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      username: user.username,
      userStatus: user.userStatus,
      userPhoneNumber: user.userPhoneNumber,
      role: { roleCode: user.role?.roleCode || 0 },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeletingUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingUserId !== null) {
      deleteMutation.mutate(deletingUserId);
    }
  };

  const resetForm = () => {
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      username: "",
      userStatus: "ACTIVE",
      userPhoneNumber: "",
      role: { roleCode: 0 },
    });
    setFormErrors({});
    setEditingUser(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Define columns for the DataTable
  const columns: Column<User>[] = [
    {
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
  {
    header: "Name",
    accessorKey: "firstname",
    cell: (user) => {
      if (!user.firstname && !user.lastname) return '---';
      return `${user.firstname || ''} ${user.lastname || ''}`.trim();
    },
    sortable: true,
  },
    {
      header: "Email",
      accessorKey: "email",
      sortable: true,
    },
    {
      header: "Username",
      accessorKey: "username",
      sortable: true,
    },
    {
      header: "Phone",
      accessorKey: "userPhoneNumber",
      sortable: true,
    },
   {
    header: "Role",
    accessorKey: "role",
    cell: (user) => {
      if (!user.role) return 'No role assigned';
      return user.role.roleName || `Role #${user.role.roleCode}`;
    },
    sortable: true,
  },
    {
      header: "Status",
      accessorKey: "userStatus",
      sortable: true,
      cell: (user) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            user.userStatus === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.userStatus}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (user) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user.id);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button onClick={openAddDialog}>Add User</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading user data...</span>
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-red-500">
            Error loading users: {(error as Error)?.message || "Unknown error"}
          </div>
        ) : (
          <DataTable
            data={Array.isArray(users) ? users : []}
            columns={columns}
            keyField="id"
            pagination={true}
            searchable={true}
            pageSize={10}
            pageSizeOptions={[5, 10, 25, 50]}
            emptyMessage="No users found"
            loading={isLoading}
            onRowClick={handleEdit}
          />
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add User"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 grid-cols-2">
              <div className="grid items-center gap-2">
                <Label htmlFor="firstname">First Name</Label>
                <Input
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  className={formErrors.firstname ? "border-red-500" : ""}
                />
                {formErrors.firstname && (
                  <p className="text-sm text-red-500">{formErrors.firstname}</p>
                )}
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  className={formErrors.lastname ? "border-red-500" : ""}
                />
                {formErrors.lastname && (
                  <p className="text-sm text-red-500">{formErrors.lastname}</p>
                )}
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={formErrors.username ? "border-red-500" : ""}
                />
                {formErrors.username && (
                  <p className="text-sm text-red-500">{formErrors.username}</p>
                )}
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="userPhoneNumber">Phone Number</Label>
                <Input
                  id="userPhoneNumber"
                  name="userPhoneNumber"
                  value={formData.userPhoneNumber}
                  onChange={handleInputChange}
                  className={formErrors.userPhoneNumber ? "border-red-500" : ""}
                />
                {formErrors.userPhoneNumber && (
                  <p className="text-sm text-red-500">{formErrors.userPhoneNumber}</p>
                )}
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role?.roleCode?.toString() || ""}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger
                    className={formErrors.role ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.roleCode} value={role.roleCode.toString()}>
                        {role.roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <p className="text-sm text-red-500">{formErrors.role}</p>
                )}
              </div>
              <div className="grid items-center gap-2">
                <Label htmlFor="userStatus">Status</Label>
                <Select
                  value={formData.userStatus}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger
                    className={formErrors.userStatus ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.userStatus && (
                  <p className="text-sm text-red-500">{formErrors.userStatus}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingUser ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editingUser ? "Update" : "Add"
                )}
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
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Users;