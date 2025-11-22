// pages/admin/AccountTypes.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountTypeService } from "@/services/accountTypeService";
import { AccountType, AccountTypeDTO } from "@/types/api";
import DashboardLayout from "./DashboardLayout";

const AccountTypes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAccountType, setCurrentAccountType] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState<AccountTypeDTO>({
    name: "",
    description: "",
    shortDescription: "",
    activationFee: 0, // Add this field
  });

  const { data: accountTypes, isLoading, error } = useQuery({
    queryKey: ["accountTypes"],
    queryFn: accountTypeService.getAllAccountTypes,
  });

  const createMutation = useMutation({
    mutationFn: accountTypeService.createAccountType,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account type created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["accountTypes"] });
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create account type",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountTypeDTO }) => 
      accountTypeService.updateAccountType(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account type updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["accountTypes"] });
      setIsOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update account type",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: accountTypeService.deleteAccountType,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account type deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["accountTypes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete account type",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    if (name === "activationFee") {
      processedValue = parseFloat(value) || 0; // Convert to number for activationFee
    }

    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && currentAccountType) {
      updateMutation.mutate({ id: currentAccountType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (accountType: AccountType) => {
    setCurrentAccountType(accountType);
    setFormData({
      name: accountType.name,
      description: accountType.description,
      shortDescription: accountType.shortDescription || "",
      activationFee: accountType.activationFee || 0, // Add this field
    });
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this account type?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      shortDescription: "",
      activationFee: 0, // Add this field
    });
    setCurrentAccountType(null);
    setIsEditMode(false);
  };

  if (isLoading) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout>Error loading account types: {(error as Error).message}</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-2 py-3 sm:px-4 sm:py-4 md:py-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Account Types</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage the account types offered by your SACCO</CardDescription>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => {
                    resetForm();
                    setIsEditMode(false);
                  }}
                >
                  Add Account Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Edit Account Type" : "Create New Account Type"}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details for the account type
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="shortDescription" className="text-right">
                        Short Description
                      </Label>
                      <Input
                        id="shortDescription"
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="activationFee" className="text-right">
                        Activation Fee
                      </Label>
                      <Input
                        id="activationFee"
                        name="activationFee"
                        type="number"
                        step="0.01"
                        value={formData.activationFee}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {isEditMode ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Short Description</TableHead>
                  <TableHead>Activation Fee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountTypes && accountTypes.length > 0 ? (
                  accountTypes.map((accountType) => (
                    <TableRow key={accountType.id}>
                      <TableCell className="font-medium">{accountType.name || "N/A"}</TableCell>
                      <TableCell>{accountType.description || "N/A"}</TableCell>
                      <TableCell>{accountType.shortDescription || "N/A"}</TableCell>
                      <TableCell>${(accountType.activationFee ?? 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(accountType)}>
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(accountType.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No account types found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccountTypes;