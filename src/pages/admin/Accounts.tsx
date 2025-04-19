import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { accountService } from "@/services/accountService";
import { Account } from "@/types/api";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Accounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccounts = async () => {
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

    fetchAccounts();
  }, [toast]);

  const handleViewDetails = (account: Account) => {
    setSelectedAccount(account);
    setShowDetails(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `KSH ${amount.toLocaleString()}`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Accounts Management
          </h1>
          <p className="text-gray-500">View and manage all SACCO accounts</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Accounts List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading accounts...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.accountNumber}</TableCell>
                      <TableCell>{account.memberId}</TableCell>
                      <TableCell>{account.accountType}</TableCell>
                      <TableCell>{formatCurrency(account.balance)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            account.status === "ACTIVE"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(account.dateCreated).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(account)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Account ID</h3>
                    <p>{selectedAccount.id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">
                      Account Number
                    </h3>
                    <p>{selectedAccount.accountNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Member ID</h3>
                    <p>{selectedAccount.memberId}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Account Type</h3>
                    <p>{selectedAccount.accountType}</p>
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
                      {new Date(
                        selectedAccount.dateCreated
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Accounts;
