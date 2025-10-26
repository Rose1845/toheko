import React, { useState, useEffect } from "react";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { accountService, CreateAccountRequest } from "@/services/accountService";
import { memberService } from "@/services/memberService";
import { accountTypeService } from "@/services/accountTypeService";
import { Account, AccountUpdateDTO, AccountSuspensionRequest, AccountType, Member } from "@/types/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { DataTable, Column } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form validation schemas
const accountFormSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  shortDescription: z.string().min(1, "Description is required"),
  status: z.string().min(1, "Status is required"),
});

const newAccountFormSchema = z.object({
  memberId: z.string().min(1, "Member selection is required"),
  accountTypeId: z.string().min(1, "Account type is required"),
  initialDeposit: z.number().min(0, "Initial deposit must be a positive number").optional(),
});

const suspensionFormSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  suspendedUntil: z.date().optional(),
});

// Type for account form values
export type AccountFormValues = z.infer<typeof accountFormSchema>;

// Type for creating a new account
export type NewAccountFormValues = z.infer<typeof newAccountFormSchema>;

// Type for suspension form values
type SuspensionFormValues = z.infer<typeof suspensionFormSchema>;

const Accounts = () => {
  // State management
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isSuspendLoading, setIsSuspendLoading] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingAccountTypes, setIsLoadingAccountTypes] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { toast } = useToast();

  // Forms setup
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      status: ""
    },
  });

  const newAccountForm = useForm<NewAccountFormValues>({
    resolver: zodResolver(newAccountFormSchema),
    defaultValues: {
      memberId: "",
      accountTypeId: "",
      initialDeposit: 0,
    },
  });

  const suspensionForm = useForm<SuspensionFormValues>({
    resolver: zodResolver(suspensionFormSchema),
    defaultValues: {
      reason: "",
    },
  });

  // Fetch all accounts on component mount
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountService.getAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast({
        title: "Error fetching accounts",
        description:
          "There was an error loading the accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all members
  const fetchMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const data = await memberService.getAllMembers();
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error fetching members",
        description: "There was an error loading the members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Fetch all account types
  const fetchAccountTypes = async () => {
    setIsLoadingAccountTypes(true);
    try {
      const data = await accountTypeService.getAllAccountTypes();
      setAccountTypes(data);
    } catch (error) {
      console.error("Error fetching account types:", error);
      toast({
        title: "Error fetching account types",
        description: "There was an error loading the account types. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAccountTypes(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchMembers();
    fetchAccountTypes();
  }, [toast]);

  // The filtering is now handled by the DataTable component

  // Event handlers for account operations
  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account);
    setShowDetails(true);
  };
  
  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    
    accountForm.reset({
      name: account.name || '',
      shortDescription: account.shortDescription || '',
      status: account.status
    });
    setShowEditForm(true);
  };
  
  const handleSuspendAccount = (account: Account) => {
    setSelectedAccount(account);
    suspensionForm.reset({
      reason: ""
    });
    setShowSuspendForm(true);
  };
  
  const handleDeleteAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowDeleteConfirm(true);
  };
  
  const handleActivateAccount = async (account: Account) => {
    if (!account) return;
    
    try {
      await accountService.activateSuspendedAccount(account.accountId);
      toast({
        title: "Account Activated",
        description: "The account has been activated successfully.",
        variant: "default",
      });
      fetchAccounts();
    } catch (error) {
      console.error("Failed to activate account:", error);
      toast({
        title: "Error",
        description: "Failed to activate account. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Form submission handlers
  const onSubmitEdit = async (values: AccountFormValues) => {
    if (!selectedAccount) return;
    
    setIsEditLoading(true);
    try {
      // Make sure we're using a string value for accountType
      const accountData: AccountUpdateDTO = {
        name: values.name,
        shortDescription: values.shortDescription,
        status: values.status
      };
      
      await accountService.updateAccount(selectedAccount.accountId, accountData);
      toast({
        title: "Success",
        description: "Account has been updated successfully.",
        variant: "default",
      });
      fetchAccounts();
      setShowEditForm(false);
    } catch (error) {
      console.error("Failed to update account:", error);
      toast({
        title: "Error",
        description: "Failed to update account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditLoading(false);
    }
  };
  
  const onSubmitSuspend = async (values: SuspensionFormValues) => {
    if (!selectedAccount) return;
    
    setIsSuspendLoading(true);
    try {
      const suspensionData: AccountSuspensionRequest = {
        reason: values.reason,
        suspendedUntil: values.suspendedUntil ? format(values.suspendedUntil, 'yyyy-MM-dd') : undefined
      };
      
      await accountService.suspendAccount(selectedAccount.accountId, suspensionData);
      toast({
        title: "Success",
        description: "Account has been suspended successfully.",
        variant: "default",
      });
      fetchAccounts();
      setShowSuspendForm(false);
    } catch (error) {
      console.error("Failed to suspend account:", error);
      toast({
        title: "Error",
        description: "Failed to suspend account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSuspendLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };
  
  // Define columns for the accounts DataTable
  const accountColumns: Column<Account>[] = [
    { accessorKey: "accountNumber", header: "Account Number" },
    { 
      accessorKey: "member", 
      header: "Member",
      cell: (account: Account) => {
        return (
          <div>
            {account.member ? (
              <div>
                <div>{account.member.firstName} {account.member.lastName}</div>
                <div className="text-xs text-gray-500">ID: {account.member.memberId}</div>
              </div>
            ) : (
              "Unknown Member"
            )}
          </div>
        );
      }
    },
    { 
      accessorKey: "accountType", 
      header: "Account Type",
      cell: (account: Account) => {
        return account.accountType?.name || 'Unknown';
      }
    },
    { 
      accessorKey: "balance", 
      header: "Balance",
      cell: (account: Account) => formatCurrency(account.balance)
    },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: (account: Account) => (
        <Badge
          variant={account.status === "ACTIVE" ? "default" : "destructive"}
        >
          {account.status}
        </Badge>
      )
    },
    { 
      accessorKey: "createDate", 
      header: "Date Created",
      cell: (account: Account) => {
        return account.createDate 
          ? new Date(account.createDate).toLocaleDateString() 
          : "Unknown";
      }
    },
    { 
      accessorKey: "accountId", 
      header: "Actions",
      cell: (account: Account) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(account)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditAccount(account)}
          >
            Edit
          </Button>
          {account.status === "ACTIVE" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSuspendAccount(account)}
              className="text-amber-600 border-amber-600 hover:bg-amber-50"
            >
              Suspend
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActivateAccount(account)}
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
            >
              Activate
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteAccount(account)}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Handle new account submission
  const onSubmitAdd = async (values: NewAccountFormValues) => {
    setIsAddLoading(true);
    try {
      const accountData: CreateAccountRequest = {
        memberId: parseInt(values.memberId),
        accountTypeId: parseInt(values.accountTypeId),
        name: `Account for Member #${values.memberId}`,
        shortDescription: "Created via admin dashboard",
        initialBalance: values.initialDeposit || 0
      };
      
      await accountService.createAccount(accountData);
      toast({
        title: "Success",
        description: "Account has been created successfully.",
        variant: "default",
      });
      fetchAccounts();
      setShowAddForm(false);
      newAccountForm.reset();
    } catch (error) {
      console.error("Failed to create account:", error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddLoading(false);
    }
  };

  // Handler to open the add account form
  const handleAddAccount = () => {
    newAccountForm.reset({
      memberId: "",
      accountTypeId: "",
      initialDeposit: 0
    });
    setShowAddForm(true);
  };

  // Handle delete confirmation
  const onConfirmDelete = async () => {
    if (!selectedAccount) return;
    
    try {
      await accountService.deleteAccount(selectedAccount.accountId);
      toast({
        title: "Account Deleted",
        description: "The account has been deleted successfully.",
        variant: "default",
      });
      fetchAccounts();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Accounts Management
            </h1>
            <p className="text-gray-500">View and manage all SACCO accounts</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Accounts List</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchAccounts}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⭮</span>
                      Loading...
                    </>
                  ) : (
                    "Refresh"
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddAccount}
                >
                  Add Account
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={accountColumns}
              data={accounts}
              keyField="accountId"
              loading={loading}
              searchable={true}
              pagination={true}
              emptyMessage="No accounts found"
            />
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Account Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected account
              </DialogDescription>
            </DialogHeader>
            {selectedAccount && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h3 className="font-medium text-gray-500">
                      Account Number
                    </h3>
                    <p>{selectedAccount.accountNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Member</h3>
                    <p>
                      {selectedAccount.member && (
                        <>
                          {selectedAccount.member.firstName} {selectedAccount.member.lastName}
                          <span className="block text-xs text-gray-500">ID: {selectedAccount.member.memberId}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Account Type</h3>
                    <p>
                      {selectedAccount.accountType?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Balance</h3>
                    <p>{formatCurrency(selectedAccount.balance)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Status</h3>
                    <Badge
                      variant={
                        selectedAccount.status === "ACTIVE"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {selectedAccount.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Date Created</h3>
                    <p>
                      {selectedAccount.createDate ? 
                        new Date(selectedAccount.createDate).toLocaleDateString() : 
                        "N/A"
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>
                Update account information below.
              </DialogDescription>
            </DialogHeader>
            <Form {...accountForm}>
              <form onSubmit={accountForm.handleSubmit(onSubmitEdit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={accountForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="shortDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter short description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
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
                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                            <SelectItem value="DORMANT">Dormant</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <span className="animate-spin mr-2">⭮</span>
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

        {/* Suspend Account Dialog */}
        <Dialog open={showSuspendForm} onOpenChange={setShowSuspendForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Suspend Account</DialogTitle>
              <DialogDescription>
                Provide a reason for suspending this account.
              </DialogDescription>
            </DialogHeader>
            <Form {...suspensionForm}>
              <form onSubmit={suspensionForm.handleSubmit(onSubmitSuspend)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={suspensionForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter reason for suspension" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={suspensionForm.control}
                    name="suspendedUntil"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Suspended Until (Optional)</FormLabel>
                        <DatePicker
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={false}
                          placeholder="Choose suspension end date"
                        />
                        <FormDescription>
                          If not specified, suspension will be indefinite.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowSuspendForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSuspendLoading} variant="destructive">
                    {isSuspendLoading ? (
                      <>
                        <span className="animate-spin mr-2">⭮</span>
                        Suspending...
                      </>
                    ) : (
                      "Suspend Account"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Account Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new account.
              </DialogDescription>
            </DialogHeader>
            <Form {...newAccountForm}>
              <form onSubmit={newAccountForm.handleSubmit(onSubmitAdd)} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={newAccountForm.control}
                    name="memberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingMembers ? (
                              <SelectItem value="loading" disabled>
                                Loading members...
                              </SelectItem>
                            ) : members.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No members found
                              </SelectItem>
                            ) : (
                              members.map((member) => (
                                <SelectItem key={member.memberId} value={member.memberId.toString()}>
                                  {member.firstName} {member.lastName} (ID: {member.memberId})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newAccountForm.control}
                    name="accountTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingAccountTypes ? (
                              <SelectItem value="loading" disabled>
                                Loading account types...
                              </SelectItem>
                            ) : accountTypes.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No account types found
                              </SelectItem>
                            ) : (
                              accountTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()}>
                                  {type.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newAccountForm.control}
                    name="initialDeposit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Deposit (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter initial deposit"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            value={field.value || ''}
                          />
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
                        <span className="animate-spin mr-2">⭮</span>
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the account "{selectedAccount?.accountNumber}". 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirmDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Accounts;
