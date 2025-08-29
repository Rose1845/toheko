import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { loanService } from "@/services/loanService";
import { memberService } from "@/services/memberService";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/pages/admin/DashboardLayout";

const LoanAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchAccountsAndMembers = async () => {
      setLoading(true);
      try {
        const [accountsResponse, membersResponse] = await Promise.all([
          loanService.getAllLoanAccounts(page, pageSize),
          memberService.getAllMembers()
        ]);
        const accountsData = accountsResponse.content || accountsResponse.data?.content || [];
        setAccounts(accountsData);
        setMembers(membersResponse || []);
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

  const filteredAccounts = statusFilter === "ALL"
    ? accounts
    : accounts.filter(acc => acc.status === statusFilter);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Loan Accounts
          </h1>
          <p className="text-gray-500">
            View and manage all loan accounts, including disbursed and pending accounts.
          </p>
        </div>
        <Card className="shadow-sm">
          {/* <CardHeader>
            <CardTitle>Loan Accounts</CardTitle>
          </CardHeader> */}
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                Loading...
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center py-10">No loan accounts found.</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account No</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Disbursed At</TableHead>
                      <TableHead>Maturity Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map(acc => (
                      <TableRow key={acc.id}>
                        <TableCell>{acc.accountNo}</TableCell>
                        <TableCell>{getMemberName(acc.memberId)}</TableCell>
                        <TableCell>{acc.principalAmount}</TableCell>
                        <TableCell>{acc.interestRate}%</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded border text-xs font-semibold ${getStatusClass(acc.status)}`}>
                            {acc.status}
                          </span>
                        </TableCell>
                        <TableCell>{acc.phase}</TableCell>
                        <TableCell>{acc.disbursedAt ? format(new Date(acc.disbursedAt), "dd/MM/yyyy") : "--"}</TableCell>
                        <TableCell>{acc.maturityDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LoanAccounts;
