import React from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PiggyBank, TrendingUp, ArrowUpCircle, AreaChart } from 'lucide-react';

// Dummy savings data
const dummySavings = [
  {
    id: 1,
    accountNumber: 'SV-2025-1042',
    type: 'Regular Savings',
    balance: 85000,
    interestRate: 5.2,
    lastTransactionDate: '2025-07-01',
    lastTransactionAmount: 5000,
  },
  {
    id: 2,
    accountNumber: 'SV-2025-1086',
    type: 'Fixed Deposit',
    balance: 150000,
    interestRate: 8.5,
    lastTransactionDate: '2025-06-15',
    lastTransactionAmount: 50000,
  }
];

// Dummy recent transactions
const dummyTransactions = [
  {
    id: 1,
    date: '2025-07-01',
    description: 'Deposit - M-PESA',
    amount: 5000,
    type: 'credit'
  },
  {
    id: 2,
    date: '2025-06-20',
    description: 'Interest Credit',
    amount: 720,
    type: 'credit'
  },
  {
    id: 3,
    date: '2025-06-15',
    description: 'Deposit - Fixed Deposit',
    amount: 50000,
    type: 'credit'
  },
  {
    id: 4,
    date: '2025-06-05',
    description: 'Deposit - M-PESA',
    amount: 5000,
    type: 'credit'
  },
];

const Savings = () => {
  return (
    <UserDashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">My Savings</h1>
            <p className="text-sm text-muted-foreground">View and manage your savings accounts</p>
          </div>
          <Button className="flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Make Deposit
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Savings</p>
                  <h3 className="text-2xl font-bold">KES 235,000</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Earned Interest (YTD)</p>
                  <h3 className="text-2xl font-bold">KES 8,450</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Projected Year-End</p>
                  <h3 className="text-2xl font-bold">KES 275,300</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <AreaChart className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Savings Accounts */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Savings Accounts</CardTitle>
              <CardDescription className="text-xs">Your active savings accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Interest Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummySavings.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.accountNumber}</TableCell>
                      <TableCell>{account.type}</TableCell>
                      <TableCell>KES {account.balance.toLocaleString()}</TableCell>
                      <TableCell>{account.interestRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Recent Transactions */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <CardDescription className="text-xs">Your recent savings activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.date}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'credit' ? '+' : '-'} KES {transaction.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="outline" size="sm" className="ml-auto">View All Transactions</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default Savings;
