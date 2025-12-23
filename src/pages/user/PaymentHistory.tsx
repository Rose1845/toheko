import React, { useState, useEffect } from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Calendar, ChevronLeft, ChevronRight, CreditCard, Download, Filter, RefreshCw, Search, Wallet } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { userPaymentService, PaymentHistory, PaymentHistoryResponse, PaymentKPIs } from '@/services/user-services/userPaymentService';

// JWT token interface
interface TohekoJwtPayload {
  sub: string;
  userId: number;
  role: string;
  exp?: number;
  iat?: number;
}

const PaymentHistoryPage = () => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState('');

  // KPI state
  const [kpis, setKpis] = useState<PaymentKPIs | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [paymentModeFilter, setPaymentModeFilter] = useState('all');

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

  // Fetch Savings
  const fetchPaymentHistory = async (page: number = 0, showRefreshToast: boolean = false) => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const response = await userPaymentService.getPaymentHistory(userId, page, pageSize);
      setPaymentHistory(response.content);
      setFilteredHistory(response.content);
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setError('');

      if (showRefreshToast) {
        toast.success('Savings refreshed successfully!');
      }
    } catch (error) {
      console.error('Error fetching Savings:', error);
      setError('Failed to load Savings');
      toast.error('Failed to load Savings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment KPIs
  const fetchPaymentKPIs = async () => {
    try {
      setKpisLoading(true);
      const userId = getUserId();
      if (!userId) {
        setKpisError('User not authenticated');
        return;
      }

      const kpiData = await userPaymentService.getPaymentKPIs(userId);
      setKpis(kpiData);
      setKpisError('');
    } catch (error) {
      console.error('Error fetching payment KPIs:', error);
      setKpisError('Failed to load payment statistics');
    } finally {
      setKpisLoading(false);
    }
  };

  // Refresh Savings
  const refreshPaymentHistory = () => {
    fetchPaymentHistory(currentPage, true);
    fetchPaymentKPIs(); // Also refresh KPIs
  };

  // Export Savings as CSV
  const exportPaymentHistory = async () => {
    try {
      setExportLoading(true);
      const userId = getUserId();
      if (!userId) {
        toast.error('User not authenticated');
        return;
      }

      const blob = await userPaymentService.exportPaymentHistoryCSV(userId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Savings exported successfully!');
    } catch (error) {
      console.error('Error exporting Savings:', error);
      toast.error('Failed to export Savings');
    } finally {
      setExportLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = paymentHistory;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transactionReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.paymentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.modeOfPayment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.remarks && payment.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Payment type filter
    if (paymentTypeFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentType.toLowerCase() === paymentTypeFilter.toLowerCase());
    }

    // Payment mode filter
    if (paymentModeFilter !== 'all') {
      filtered = filtered.filter(payment => payment.modeOfPayment.toLowerCase() === paymentModeFilter.toLowerCase());
    }

    setFilteredHistory(filtered);
  }, [searchTerm, statusFilter, paymentTypeFilter, paymentModeFilter, paymentHistory]);

  // Load data on component mount
  useEffect(() => {
    fetchPaymentHistory();
    fetchPaymentKPIs();
  }, []);

  // Add keyboard shortcut for refresh
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        refreshPaymentHistory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchPaymentHistory(newPage);
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'rejected':
        return 'destructive';
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
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get unique values for filters
  const getUniqueValues = (key: keyof PaymentHistory) => {
    return Array.from(new Set(paymentHistory.map(payment => payment[key])))
      .filter(value => value !== null && value !== undefined)
      .map(value => String(value)) // Convert to string
      .sort();
  };

  return (
    <UserDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Savings</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View all your payment transactions and their status
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              Total: {totalElements} payments
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={refreshPaymentHistory}
                disabled={loading}
                variant="outline"
                size="sm"
                title="Refresh Savings (Ctrl+R)"
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
              <Button
                onClick={exportPaymentHistory}
                disabled={exportLoading || totalElements === 0}
                variant="outline"
                size="sm"
              >
                {exportLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Payment KPIs */}
        {kpisLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : kpisError ? (
          <Card className="mb-4 sm:mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-red-600 text-sm">{kpisError}</p>
            </CardContent>
          </Card>
        ) : kpis ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Completed Payments */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-green-700">Amount Saved </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-green-800">KES {kpis.completedAmount}</h3>
                    <p className="text-xs text-green-600">Total Payments: {kpis.completedCount}</p>

                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Payments */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-yellow-700">Pending</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-yellow-800">{kpis.pendingCount}</h3>
                    <p className="text-xs text-yellow-600">KES {kpis.pendingAmount.toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Failed Payments */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-red-700">Failed</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-red-800">{kpis.failedCount}</h3>
                    <p className="text-xs text-red-600">KES {kpis.failedAmount.toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-700">Success Rate</p>
                    <h3 className="text-xl sm:text-2xl font-bold text-blue-800">
                      {kpis.stkSuccessRate !== null && kpis.stkSuccessRate !== undefined 
                        ? `${kpis.stkSuccessRate.toFixed(1)}%` 
                        : '0.0%'}
                    </h3>
                    <p className="text-xs text-blue-600">STK Push</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
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
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Type</label>
                <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {getUniqueValues('paymentType').map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Mode Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Mode</label>
                <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    {getUniqueValues('modeOfPayment').map((mode) => (
                      <SelectItem key={mode} value={mode.toLowerCase()}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Savings Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Transactions
            </CardTitle>
            <CardDescription>
              Showing {filteredHistory.length} of {totalElements} transactions
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
                  onClick={() => fetchPaymentHistory(currentPage)}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No Savings found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Cards View */}
                <div className="block md:hidden space-y-3">
                  {filteredHistory.map((payment) => (
                    <Card key={payment.paymentId} className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-green-600 text-lg">
                              {formatAmount(payment.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(payment.paymentDate)}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(payment.status)}>
                            {payment.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Type</p>
                            <p className="capitalize">{payment.paymentType}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Mode</p>
                            <p className="capitalize">{payment.modeOfPayment}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Account</p>
                            <p className="font-mono text-xs">{payment.accountNumber}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Reference</p>
                            <p className="font-mono text-xs truncate">{payment.transactionReference}</p>
                          </div>
                        </div>

                        {payment.remarks && (
                          <div>
                            <p className="text-muted-foreground text-xs">Remarks</p>
                            <p className="text-sm">{payment.remarks}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((payment) => (
                        <TableRow key={payment.paymentId}>
                          <TableCell className="font-medium">
                            {formatDate(payment.paymentDate)}
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatAmount(payment.amount)}
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{payment.paymentType}</span>
                          </TableCell>
                          <TableCell>
                            <span className="capitalize">{payment.modeOfPayment}</span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {payment.accountNumber}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(payment.status)}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-[150px] truncate">
                            {payment.transactionReference}
                          </TableCell>
                          <TableCell className="max-w-[100px] truncate">
                            {payment.remarks || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Showing {(currentPage * pageSize) + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} transactions
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(0)}
                        disabled={currentPage === 0}
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1">
                        {(() => {
                          const pages = [];
                          const startPage = Math.max(0, currentPage - 2);
                          const endPage = Math.min(totalPages - 1, currentPage + 2);

                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={i === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(i)}
                                className="w-8 h-8 p-0"
                              >
                                {i + 1}
                              </Button>
                            );
                          }
                          return pages;
                        })()}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages - 1)}
                        disabled={currentPage === totalPages - 1}
                      >
                        Last
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

export default PaymentHistoryPage;
