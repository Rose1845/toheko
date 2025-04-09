
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
import { Badge } from "@/components/ui/badge";
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
    interestRate: 0,
    minimumBalance: 0,
    monthlyFee: 0,
    status: "ACTIVE",
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create account type",
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update account type",
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete account type",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
    
    // Convert numeric fields to numbers
    if (["interestRate", "minimumBalance", "monthlyFee"].includes(name)) {
      processedValue = parseFloat(value) || 0;
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
      interestRate: accountType.interestRate,
      minimumBalance: accountType.minimumBalance,
      monthlyFee: accountType.monthlyFee,
      status: accountType.status,
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
      interestRate: 0,
      minimumBalance: 0,
      monthlyFee: 0,
      status: "ACTIVE",
    });
    setCurrentAccountType(null);
    setIsEditMode(false);
  };

  if (isLoading) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout>Error loading account types</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Account Types</CardTitle>
              <CardDescription>Manage the account types offered by your SACCO</CardDescription>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button 
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
                      <Label htmlFor="interestRate" className="text-right">
                        Interest Rate (%)
                      </Label>
                      <Input
                        id="interestRate"
                        name="interestRate"
                        type="number"
                        step="0.01"
                        value={formData.interestRate}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="minimumBalance" className="text-right">
                        Minimum Balance
                      </Label>
                      <Input
                        id="minimumBalance"
                        name="minimumBalance"
                        type="number"
                        step="0.01"
                        value={formData.minimumBalance}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="monthlyFee" className="text-right">
                        Monthly Fee
                      </Label>
                      <Input
                        id="monthlyFee"
                        name="monthlyFee"
                        type="number"
                        step="0.01"
                        value={formData.monthlyFee}
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
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Min. Balance</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountTypes && accountTypes.length > 0 ? (
                  accountTypes.map((accountType) => (
                    <TableRow key={accountType.id}>
                      <TableCell className="font-medium">{accountType.name}</TableCell>
                      <TableCell>{accountType.description}</TableCell>
                      <TableCell>{accountType.interestRate}%</TableCell>
                      <TableCell>${accountType.minimumBalance}</TableCell>
                      <TableCell>${accountType.monthlyFee}</TableCell>
                      <TableCell>
                        <Badge variant={accountType.status === "ACTIVE" ? "default" : "destructive"}>
                          {accountType.status}
                        </Badge>
                      </TableCell>
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
                    <TableCell colSpan={7} className="text-center">
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
