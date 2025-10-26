import React, { useState } from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

// Dummy statements data
const dummyStatements = [
  {
    id: 1,
    title: 'July 2025 Account Statement',
    type: 'Monthly Statement',
    accountNumber: 'SV-2025-1042',
    date: '2025-07-01',
    fileSize: '245 KB',
    format: 'PDF'
  },
  {
    id: 2,
    title: 'June 2025 Account Statement',
    type: 'Monthly Statement',
    accountNumber: 'SV-2025-1042',
    date: '2025-06-01',
    fileSize: '267 KB',
    format: 'PDF'
  },
  {
    id: 3,
    title: 'May 2025 Account Statement',
    type: 'Monthly Statement',
    accountNumber: 'SV-2025-1042',
    date: '2025-05-01',
    fileSize: '189 KB',
    format: 'PDF'
  },
  {
    id: 4,
    title: 'Q2 2025 Account Summary',
    type: 'Quarterly Statement',
    accountNumber: 'SV-2025-1042',
    date: '2025-06-30',
    fileSize: '356 KB',
    format: 'PDF'
  },
  {
    id: 5,
    title: 'Loan Statement LN-2025-001',
    type: 'Loan Statement',
    accountNumber: 'LN-2025-001',
    date: '2025-06-30',
    fileSize: '210 KB',
    format: 'PDF'
  }
];

const Statements = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter statements based on selected type and search term
  const filteredStatements = dummyStatements.filter(statement => {
    const matchesType = selectedType === 'all' || statement.type.toLowerCase().includes(selectedType.toLowerCase());
    const matchesSearch = statement.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          statement.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <UserDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">Statements & Reports</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">View and download your account statements</p>
          </div>
        </div>

        {/* Filter and Search */}
        <Card className="mb-4 sm:mb-6 shadow-sm">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">Find Statements</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Filter and search for specific statements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="statement-type">Statement Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="statement-type" className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="monthly">Monthly Statements</SelectItem>
                    <SelectItem value="quarterly">Quarterly Statements</SelectItem>
                    <SelectItem value="loan">Loan Statements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <Select defaultValue="last3months">
                  <SelectTrigger id="date-range" className="w-full">
                    <SelectValue placeholder="Last 3 Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last3months">Last 3 Months</SelectItem>
                    <SelectItem value="last6months">Last 6 Months</SelectItem>
                    <SelectItem value="lastyear">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search by title or account..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                  <Filter className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Statements List */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg">Available Statements</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Click on a statement to download or view</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Mobile Cards View */}
            <div className="block md:hidden space-y-3">
              {filteredStatements.length > 0 ? filteredStatements.map((statement) => (
                <Card key={statement.id} className="p-4 border-l-4 border-l-blue-500">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-2 flex-1">
                        <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{statement.title}</p>
                          <p className="text-xs text-muted-foreground">{statement.type}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                        <span className="sr-only">Download</span>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Account</p>
                        <p className="font-medium font-mono text-xs">{statement.accountNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Date</p>
                        <p className="font-medium">{statement.date}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground text-xs">Format & Size</p>
                        <p className="font-medium">{statement.format} ({statement.fileSize})</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No statements found matching your criteria</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStatements.length > 0 ? filteredStatements.map((statement) => (
                    <TableRow key={statement.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span>{statement.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{statement.type}</TableCell>
                      <TableCell>{statement.accountNumber}</TableCell>
                      <TableCell>{statement.date}</TableCell>
                      <TableCell>{statement.format} ({statement.fileSize})</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Download</span>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No statements found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between py-3">
            <div className="text-xs text-muted-foreground">
              Showing {filteredStatements.length} of {dummyStatements.length} statements
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Request Custom Statement
            </Button>
          </CardFooter>
        </Card>
      </div>
    </UserDashboardLayout>
  );
};

export default Statements;
