
import React, { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from '@/pages/admin/DashboardLayout';
import { paymentService } from '@/services/paymentService';
import { Payment } from '@/types/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await paymentService.getAllPayments();
        setPayments(data);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast({
          title: 'Error fetching payments',
          description: 'There was an error loading the payments. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Payments Management</h1>
          <p className="text-gray-500">View and manage all SACCO payments</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Payments List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading payments...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.referenceNumber}</TableCell>
                      <TableCell>{payment.memberId}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(payment)}>
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Complete information about the selected payment
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-500">Reference Number</h3>
                    <p>{selectedPayment.referenceNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Payment Date</h3>
                    <p>{new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Member ID</h3>
                    <p>{selectedPayment.memberId}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Amount</h3>
                    <p>{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Payment Type ID</h3>
                    <p>{selectedPayment.paymentTypeId}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Mode of Payment ID</h3>
                    <p>{selectedPayment.modeOfPaymentId}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-500">Status</h3>
                    <Badge 
                      variant={selectedPayment.status === 'COMPLETED' ? 'default' : 'secondary'}
                    >
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>
                {selectedPayment.description && (
                  <div>
                    <h3 className="font-medium text-gray-500">Description</h3>
                    <p>{selectedPayment.description}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
