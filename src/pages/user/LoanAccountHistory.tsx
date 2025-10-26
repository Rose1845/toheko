import React, { useState, useEffect } from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Calendar, ChevronLeft, ChevronRight, CreditCard, Filter, Search, Building2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { loanAccountService, LoanAccount, LoanAccountHistoryResponse } from '@/services/user-services/userLoanAccountService';

// JWT token interface
interface TohekoJwtPayload {
  sub: string;
  userId: number;
  role: string;
  exp?: number;
  iat?: number;
}

const LoanAccountHistory = () => {
  const [loanAccounts, setLoanAccounts] = useState<LoanAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<LoanAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');

  // Get user ID from JWT token
  const getUserId = (): number | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decoded = jwtDecode<TohekoJwtPayload>(token);
      return decoded.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch loan account history
  const fetchLoanAccountHistory = async (page: number = 0) => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const response = await loanAccountService.getLoanAccountHistory(userId, page, pageSize);
      setLoanAccounts(response.content);
      setFilteredAccounts(response.content);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setError('');
    } catch (error) {
      console.error('Error fetching loan account history:', error);
      setError('Failed to load loan account history');
      toast.error('Failed to load loan account history');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = loanAccounts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(account => 
        account.accountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.phase.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(account => account.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Phase filter
    if (phaseFilter !== 'all') {
      filtered = filtered.filter(account => account.phase.toLowerCase() === phaseFilter.toLowerCase());
    }

    setFilteredAccounts(filtered);
  }, [searchTerm, statusFilter, phaseFilter, loanAccounts]);

  // Load data on component mount
  useEffect(() => {
    fetchLoanAccountHistory();
  }, []);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchLoanAccountHistory(newPage);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'disbursed':
        return 'default';
      case 'pending_disbursement':
      case 'pending':
        return 'secondary';
      case 'closed':
      case 'completed':
        return 'outline';
      case 'defaulted':
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get phase badge variant
  const getPhaseBadgeVariant = (phase: string) => {
    switch (phase.toLowerCase()) {
      case 'active':
        return 'default';
      case 'virtual':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format amount
  const formatAmount = (amount: number, currency: string = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get unique values for filters
  const getUniqueValues = (key: keyof LoanAccount) => {
    return Array.from(new Set(loanAccounts.map(account => account[key])))
      .filter(value => value !== null && value !== undefined)
      .map(value => String(value))
      .sort();
  };

  return (
    <UserDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold">Loan Account History</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View all your loan accounts and their current status
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              Total: {totalElements} accounts
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {getUniqueValues('status').map((status) => (
                      <SelectItem key={status} value={status.toLowerCase()}>
                        {status.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phase Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Phase</label>
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All phases" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    {getUniqueValues('phase').map((phase) => (
                      <SelectItem key={phase} value={phase.toLowerCase()}>
                        {phase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Accounts Table */}
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
              Loan Accounts
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Showing {filteredAccounts.length} of {totalElements} loan accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => fetchLoanAccountHistory(currentPage)}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No loan accounts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Cards View */}
                <div className="block md:hidden space-y-3">
                  {filteredAccounts.map((account) => (
                    <Card key={account.id} className="p-4 border-l-4 border-l-blue-500">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium font-mono text-sm">{account.accountNo}</p>
                            <p className="text-xs text-muted-foreground">
                              Opened: {formatDate(account.openedAt)}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge variant={getStatusBadgeVariant(account.status)} className="text-xs">
                              {account.status.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant={getPhaseBadgeVariant(account.phase)} className="text-xs">
                              {account.phase}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Principal</p>
                            <p className="font-semibold">{formatAmount(account.principalAmount, account.currency)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Outstanding</p>
                            <p className="font-semibold text-orange-600">{formatAmount(account.outstandingPrincipal, account.currency)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Interest Rate</p>
                            <p className="font-medium">{account.interestRate > 0 ? `${account.interestRate}%` : '-'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Term</p>
                            <p className="font-medium">{account.termDays > 0 ? `${account.termDays} days` : '-'}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-muted-foreground text-xs">Maturity Date</p>
                          <p className="text-sm">{formatDate(account.maturityDate)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account No</TableHead>
                        <TableHead>Principal Amount</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Interest Rate</TableHead>
                        <TableHead>Term (Days)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead>Opened At</TableHead>
                        <TableHead>Maturity Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium font-mono text-sm">
                            {account.accountNo}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatAmount(account.principalAmount, account.currency)}
                          </TableCell>
                          <TableCell className="font-semibold text-orange-600">
                            {formatAmount(account.outstandingPrincipal, account.currency)}
                          </TableCell>
                          <TableCell>
                            {account.interestRate > 0 ? `${account.interestRate}%` : '-'}
                          </TableCell>
                          <TableCell>
                            {account.termDays > 0 ? account.termDays : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(account.status)}>
                              {account.status.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPhaseBadgeVariant(account.phase)}>
                              {account.phase}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(account.openedAt)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(account.maturityDate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Additional Info Cards for mobile view */}
                <div className="md:hidden space-y-4">
                  {filteredAccounts.map((account) => (
                    <Card key={account.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium font-mono text-sm">{account.accountNo}</p>
                            <p className="text-xs text-muted-foreground">Account Number</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={getStatusBadgeVariant(account.status)} className="text-xs">
                              {account.status.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant={getPhaseBadgeVariant(account.phase)} className="text-xs">
                              {account.phase}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold">{formatAmount(account.principalAmount, account.currency)}</p>
                            <p className="text-xs text-muted-foreground">Principal Amount</p>
                          </div>
                          <div>
                            <p className="font-semibold text-orange-600">{formatAmount(account.outstandingPrincipal, account.currency)}</p>
                            <p className="text-xs text-muted-foreground">Outstanding</p>
                          </div>
                          <div>
                            <p className="font-medium">{account.interestRate > 0 ? `${account.interestRate}%` : '-'}</p>
                            <p className="text-xs text-muted-foreground">Interest Rate</p>
                          </div>
                          <div>
                            <p className="font-medium">{account.termDays > 0 ? `${account.termDays} days` : '-'}</p>
                            <p className="text-xs text-muted-foreground">Term</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-muted-foreground">Opened: {formatDate(account.openedAt)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Maturity: {formatDate(account.maturityDate)}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage + 1} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserDashboardLayout>
  );
};

export default LoanAccountHistory;
