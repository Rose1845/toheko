import React, { useState, useEffect } from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Calendar, ChevronLeft, ChevronRight, CreditCard, Download, Filter, Search, Wallet } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { userPaymentService, PaymentHistory, PaymentHistoryResponse } from '@/services/user-services/userPaymentService';

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

  // Fetch payment history
  const fetchPaymentHistory = async (page: number = 0) => {
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
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError('Failed to load payment history');
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  // Export payment history as CSV
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
      
      toast.success('Payment history exported successfully!');
    } catch (error) {
      console.error('Error exporting payment history:', error);
      toast.error('Failed to export payment history');
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
  }, []);

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Payment History</h1>
            <p className="text-sm text-muted-foreground">
              View all your payment transactions and their status
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Total: {totalElements} payments
            </div>
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

        {/* Payment History Table */}
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
                <p className="text-muted-foreground">No payment history found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table */}
                <div className="rounded-md border overflow-hidden">
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

export default PaymentHistoryPage;
