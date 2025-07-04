import React from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, PlusCircle } from 'lucide-react';

// Dummy loan data
const dummyLoans = [
  {
    id: 1,
    loanNumber: 'LN-2025-001',
    type: 'Personal Loan',
    amount: 50000,
    balance: 42500,
    interestRate: 14.5,
    startDate: '2025-01-15',
    endDate: '2026-01-15',
    status: 'Active',
  },
  {
    id: 2,
    loanNumber: 'LN-2024-089',
    type: 'Emergency Loan',
    amount: 15000,
    balance: 5000,
    interestRate: 12.0,
    startDate: '2024-11-10',
    endDate: '2025-11-10',
    status: 'Active',
  }
];

const Loans = () => {
  return (
    <UserDashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">My Loans</h1>
            <p className="text-sm text-muted-foreground">View and manage your active loans</p>
          </div>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Apply for Loan
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Loans</p>
                  <h3 className="text-2xl font-bold">2</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Borrowed</p>
                  <h3 className="text-2xl font-bold">KES 65,000</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Outstanding Balance</p>
                  <h3 className="text-2xl font-bold">KES 47,500</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Loans Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Active Loans</CardTitle>
            <CardDescription className="text-xs">Your current active loans and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loan Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell className="font-medium">{loan.loanNumber}</TableCell>
                    <TableCell>{loan.type}</TableCell>
                    <TableCell>KES {loan.amount.toLocaleString()}</TableCell>
                    <TableCell>KES {loan.balance.toLocaleString()}</TableCell>
                    <TableCell>{loan.interestRate}%</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {loan.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between py-3">
            <div className="text-xs text-muted-foreground">
              Showing 2 of 2 loans
            </div>
            <Button variant="outline" size="sm">View All Loans</Button>
          </CardFooter>
        </Card>
      </div>
    </UserDashboardLayout>
  );
};

export default Loans;
