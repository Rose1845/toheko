import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import LoanAccountStatsCards from "@/components/dashboard/LoanAccountStatsCards";
import { loanService } from "@/services/loanService";
import { memberService } from "@/services/memberService";
import { format } from "date-fns";
import { DataTable, Column } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const LoanAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [accountStats, setAccountStats] = useState<any>(null);
  const [showDisburseDialog, setShowDisburseDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [disburseLoading, setDisburseLoading] = useState(false);
  const [disburseAmount, setDisburseAmount] = useState(0);
  const [disburseRemarks, setDisburseRemarks] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccountsAndMembers = async () => {
      setLoading(true);
      try {
        const [accountsResponse, membersResponse, statsResponse] = await Promise.all([
          loanService.getAllLoanAccounts(page, pageSize, ""),
          memberService.getAllMembers(),
          loanService.getLoanAccountKpi()
        ]);
        const accountsData = accountsResponse.content || accountsResponse.data?.content || [];
        setAccounts(accountsData);
        setMembers(membersResponse || []);
        setAccountStats(statsResponse || null);
        // Set total pages if available
        if (accountsResponse.totalPages) setTotalPages(accountsResponse.totalPages);
        else if (accountsResponse.data?.totalPages) setTotalPages(accountsResponse.data.totalPages);
      } catch (error) {
        // Handle error (toast, etc.)
      } finally {
        setLoading(false);
      }
    };
    fetchAccountsAndMembers();
  }, [page, pageSize]);

  // Helper to get member name by id
  const getMemberName = (memberId: number) => {
    const member = members.find((m: any) => m.memberId === memberId);
    return member ? `${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}` : memberId;
  };

  // Helper to get status color classes
  const getStatusClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING_DISBURSEMENT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Disburse handler
  const handleOpenDisburseDialog = (account: any) => {
    setSelectedAccount(account);
    setDisburseAmount(account.principalAmount);
    setDisburseRemarks("");
    setShowDisburseDialog(true);
  };

  const handleDisburseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setDisburseLoading(true);
    try {
      const response = await loanService.disburseLoanAccount({
        loanAccountId: selectedAccount.id,
        amount: Number(disburseAmount),
        remarks: disburseRemarks,
      });
      if (response?.code === 200 || response?.code === 201) {
        toast({
          title: "Success",
          description:  response?.message || "Loan account disbursed successfully.",
        });
        const accountsResponse = await loanService.getAllLoanAccounts(page, pageSize, "");
        const accountsData = accountsResponse.content || accountsResponse.data?.content || [];
        setAccounts(accountsData);
        if (accountsResponse.totalPages) setTotalPages(accountsResponse.totalPages);
        else if (accountsResponse.data?.totalPages) setTotalPages(accountsResponse.data.totalPages);
        setShowDisburseDialog(false);
        setSelectedAccount(null);
        setDisburseAmount(0);
        setDisburseRemarks("");
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to disburse loan account.",
          variant: "destructive",
        });
      }
      // Optionally handle error or show error toast if code !== 200
    } catch (error) {
      // Handle error (toast, etc.)
    } finally {
      setDisburseLoading(false);
    }
  };

  // Filter form state for Loan Accounts
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  // Filter handler for Loan Accounts
  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLoading(true);
    try {
      const params: any = {
        page: page - 1,
        size: pageSize,
        q: filterSearch || undefined,
        minAmount: filterMinAmount || undefined,
        maxAmount: filterMaxAmount || undefined,
        date: filterDate || undefined,
      };
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      const urlParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) urlParams.append(key, String(value));
      });
      const response = await loanService.getAllLoanAccounts(urlParams.toString());
      const accountsData = response.content || response.data?.content || [];
      setAccounts(accountsData);
      if (response.totalPages) setTotalPages(response.totalPages);
      else if (response.data?.totalPages) setTotalPages(response.data.totalPages);
    } catch (error) {
      toast({ title: "Error", description: "Failed to filter loan accounts.", variant: "destructive" });
    } finally {
      setSearchLoading(false);
    }
  };

  const columns: Column<any>[] = [
    { header: "Account No", accessorKey: "accountNo", sortable: true },
    { header: "Member", accessorKey: "memberId", sortable: true, cell: (acc) => getMemberName(acc.memberId) },
    {header: "Phone Number", accessorKey: (acc) => acc.phoneNumber, cell: (acc) => (<span className="font-medium">{acc?.mobileNumber}</span>)},
    { header: "Principal", accessorKey: "principalAmount", sortable: true },
    { header: "Interest Rate", accessorKey: "interestRate", sortable: true, cell: (acc) => `${acc.interestRate}%` },
    { header: "Status", accessorKey: "status", sortable: true, cell: (acc) => (
      <span className={`px-2 py-1 rounded border text-xs font-semibold ${getStatusClass(acc.status)}`}>{acc.status}</span>
    ) },
    { header: "Phase", accessorKey: "phase", sortable: true },
    { header: "Disbursed At", accessorKey: "disbursedAt", sortable: true, cell: (acc) => acc.disbursedAt ? format(new Date(acc.disbursedAt), "dd/MM/yyyy") : "--" },
    { header: "Maturity Date", accessorKey: "maturityDate", sortable: true },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (acc) => (
        <Button
          size="sm"
          className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded px-3 py-1"
          onClick={() => handleOpenDisburseDialog(acc)}
        >
          Disburse
        </Button>
      ),
    },
  ];

  // Server-side search handler
  const handleSearch = async (searchValue: string) => {
    setSearchLoading(true);
    try {
      const params: any = {
        page: page - 1,
        size: pageSize,
      };
      if (searchValue) params.q = searchValue;
      const urlParams = new URLSearchParams();
      const accountsResponse = await loanService.getAllLoanAccounts(urlParams.toString());

      const accountsData = accountsResponse.content || accountsResponse.data?.content || [];
      setAccounts(accountsData);
      if (accountsResponse.totalPages) setTotalPages(accountsResponse.totalPages);
      else if (accountsResponse.data?.totalPages) setTotalPages(accountsResponse.data.totalPages);
    } catch (error) {
      // Handle error
    } finally {
      setSearchLoading(false);
    }
  };

  // Filter by status
  const filteredAccounts = statusFilter === "ALL"
    ? accounts
    : accounts.filter(acc => acc.status === statusFilter);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Loan Accounts
            </h1>
            <p className="text-gray-500">
              View and manage all loan accounts, including disbursed and pending accounts.
            </p>
          </div>
        </div>
        <LoanAccountStatsCards stats={accountStats} />
        <Card className="shadow-sm">
             <CardHeader>
                <CardTitle>Loan Accounts</CardTitle>
              </CardHeader>
          <CardContent>
            {/* Filter Form */}
            <form className="flex gap-4 mb-6 items-end" onSubmit={handleFilterSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <input type="text" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} className="border rounded px-2 py-1 w-40" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Min Amount</label>
                <input type="number" value={filterMinAmount} onChange={e => setFilterMinAmount(e.target.value)} className="border rounded px-2 py-1 w-32" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Amount</label>
                <input type="number" value={filterMaxAmount} onChange={e => setFilterMaxAmount(e.target.value)} className="border rounded px-2 py-1 w-32" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border rounded px-2 py-1 w-40" />
              </div>
              <Button type="submit" variant="secondary" disabled={searchLoading}>Filter</Button>
            </form>
            <DataTable
              data={filteredAccounts}
              columns={columns}
              keyField="id"
              pagination={false}
              searchable={false}
              pageSize={10}
              emptyMessage="No loan accounts found"
              loading={searchLoading}
              onSearch={handleSearch}
            />
            <div className="flex justify-between items-center mt-4">
              <div>
                <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <span className="mx-2">Page {page} of {totalPages}</span>
                <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
              <div>
                <label className="mr-2">Rows per page:</label>
                <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="border rounded px-2 py-1">
                  {[10, 20, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Disburse Dialog */}
        {showDisburseDialog && (
          <Dialog open={showDisburseDialog} onOpenChange={setShowDisburseDialog}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Disburse Loan Account</DialogTitle>
                <DialogDescription>
                  Enter disbursement details for account #{selectedAccount?.accountNo}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDisburseSubmit} className="space-y-4">
                <div>
                  <label>Amount</label>
                  <input
                    type="number"
                    value={disburseAmount}
                    onChange={e => setDisburseAmount(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1"
                    required
                  />
                </div>
                <div>
                  <label>Remarks</label>
                  <textarea
                    value={disburseRemarks}
                    onChange={e => setDisburseRemarks(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={disburseLoading}>
                    {disburseLoading ? "Processing..." : "Disburse"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LoanAccounts;
