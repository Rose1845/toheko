import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  return (
    <UserDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">My Loans</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">View and manage your active loans</p>
          </div>
          <Button 
            className="flex items-center gap-2 text-sm"
            onClick={() => navigate('/user/loan-application')}
          >
            <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Apply for Loan</span>
            <span className="sm:hidden">Apply</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium">Total Loans</p>
                  <h3 className="text-xl sm:text-2xl font-bold">2</h3>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium">Total Borrowed</p>
                  <h3 className="text-xl sm:text-2xl font-bold">KES 65,000</h3>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium">Outstanding Balance</p>
                  <h3 className="text-xl sm:text-2xl font-bold">KES 47,500</h3>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Loans Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">Active Loans</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your current active loans and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-3">
              {dummyLoans.map((loan) => (
                <Card key={loan.id} className="p-4 border-l-4 border-l-blue-500">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{loan.loanNumber}</p>
                        <p className="text-xs text-muted-foreground">{loan.type}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {loan.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Principal</p>
                        <p className="font-medium">KES {loan.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Balance</p>
                        <p className="font-medium">KES {loan.balance.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Interest Rate</p>
                        <p className="font-medium">{loan.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Progress</p>
                        <p className="font-medium">{Math.round(((loan.amount - loan.balance) / loan.amount) * 100)}% paid</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
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
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 py-3">
            <div className="text-xs text-muted-foreground text-center sm:text-left">
              Showing 2 of 2 loans
            </div>
            <Button variant="outline" size="sm" className="text-xs">View All Loans</Button>
          </CardFooter>
        </Card>
      </div>
    </UserDashboardLayout>
  );
};

export default Loans;
