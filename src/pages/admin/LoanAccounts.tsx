import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { loanService } from "@/services/loanService";
import { memberService } from "@/services/memberService";
import { format } from "date-fns";
import { DataTable, Column } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Wallet, TrendingUp, Clock, CheckCircle, XCircle, Loader2, Download } from "lucide-react";

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
  const [exportLoading, setExportLoading] = useState(false);

  // Export handler
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('format', 'csv');
      if (filterSearch) params.append('search', filterSearch);
      if (filterDate) {
        params.append('startDate', filterDate);
        params.append('endDate', filterDate);
      }
      params.append('filename', `loan-accounts-${new Date().toISOString().split('T')[0]}.csv`);
      
      const response = await fetch(
        `https://sacco-app-production.up.railway.app/api/v1/loan-accounts/export?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'accept': '*/*',
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loan-accounts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Success",
          description: "Loan accounts exported successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to export loan accounts.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while exporting.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

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
    {header: "Phone Number", accessorKey: "mobileNumber", cell: (acc) => (<span className="font-medium">{acc?.mobileNumber || '--'}</span>)},
    { header: "Principal", accessorKey: "principalAmount", sortable: true },
    { header: "Interest Rate", accessorKey: "interestRate", sortable: true, cell: (acc) => `${acc.interestRate}%` },
    { header: "Status", accessorKey: "status", sortable: true, cell: (acc) => (
      <Badge variant={
        acc.status === 'ACTIVE' ? 'default' :
        acc.status === 'PENDING_DISBURSEMENT' ? 'secondary' :
        acc.status === 'CLOSED' ? 'outline' : 'destructive'
      }>
        {acc.status.replace(/_/g, ' ')}
      </Badge>
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
      <div className="container mx-auto px-2 py-3 sm:px-4 sm:py-4 md:py-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Loan Accounts</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              View and manage all loan accounts, including disbursed and pending accounts.
            </p>
          </div>
          <Button onClick={handleExport} disabled={exportLoading} className="flex items-center gap-2 w-full sm:w-auto">
            <Download className="h-4 w-4" />
            {exportLoading ? "Exporting..." : "Export CSV"}
          </Button>
        </div>

        {/* KPI Section */}
        <Accordion type="single" collapsible defaultValue="kpis" className="w-full">
          <AccordionItem value="kpis">
            <AccordionTrigger className="text-lg font-semibold">
              Loan Account KPIs
            </AccordionTrigger>
            <AccordionContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading KPIs...</span>
                </div>
              ) : accountStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Principal */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Total Principal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">KES {Number(accountStats.totalPrincipal || 0).toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total loan principal amount
                      </p>
                    </CardContent>
                  </Card>

                  {/* Total Outstanding */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Total Outstanding
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">KES {Number(accountStats.totalOutstanding || 0).toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Total outstanding balance
                      </p>
                    </CardContent>
                  </Card>

                  {/* By Status */}
                  {accountStats.byStatus && accountStats.byStatus.length > 0 && (
                    <>
                      {accountStats.byStatus.map((status: any) => (
                        <Card key={status.status}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                              {status.status === 'PENDING_DISBURSEMENT' && <Clock className="h-4 w-4 inline mr-1" />}
                              {status.status === 'ACTIVE' && <CheckCircle className="h-4 w-4 inline mr-1" />}
                              {status.status === 'CLOSED' && <XCircle className="h-4 w-4 inline mr-1" />}
                              {status.status.replace(/_/g, ' ')}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{status.count}</div>
                            <div className="space-y-1 mt-2">
                              <p className="text-xs text-muted-foreground">
                                Principal: KES {Number(status.principalSum || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Outstanding: KES {Number(status.outstandingSum || 0).toLocaleString()}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No KPI data available
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Loan Accounts Table */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>All Loan Accounts</CardTitle>
            <CardDescription>Filter and manage loan accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filter Form */}
            <form className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6" onSubmit={handleFilterSubmit}>
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <Input id="search" type="text" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} placeholder="Search accounts..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minAmount">Min Amount</Label>
                <Input id="minAmount" type="number" value={filterMinAmount} onChange={e => setFilterMinAmount(e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount">Max Amount</Label>
                <Input id="maxAmount" type="number" value={filterMaxAmount} onChange={e => setFilterMaxAmount(e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="secondary" disabled={searchLoading} className="w-full">
                  {searchLoading ? "Filtering..." : "Apply Filters"}
                </Button>
              </div>
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
                <div className="space-y-2">
                  <Label htmlFor="disburse-amount">Amount</Label>
                  <Input
                    id="disburse-amount"
                    type="number"
                    value={disburseAmount}
                    onChange={e => setDisburseAmount(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disburse-remarks">Remarks</Label>
                  <Input
                    id="disburse-remarks"
                    value={disburseRemarks}
                    onChange={e => setDisburseRemarks(e.target.value)}
                    placeholder="Enter any remarks..."
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
