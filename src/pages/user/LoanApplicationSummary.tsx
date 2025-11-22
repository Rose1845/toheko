import React, { useState, useEffect } from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  CheckCircle, 
  Clock, 
  Search, 
  XCircle, 
  DollarSign, 
  FileText, 
  TrendingUp,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { userLoanService, LoanApplicationStatusSummary } from '@/services/user-services/userLoanService';
import { useNavigate } from 'react-router-dom';

// JWT token interface
interface TohekoJwtPayload {
  sub: string;
  userId: number;
  role: string;
  exp?: number;
  iat?: number;
}

const LoanApplicationSummary = () => {
  const [statusSummary, setStatusSummary] = useState<LoanApplicationStatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  // Fetch loan application status summary
  const fetchStatusSummary = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const summary = await userLoanService.getLoanApplicationStatusSummary(userId);
      setStatusSummary(summary);
      setError('');
    } catch (error) {
      console.error('Error fetching loan application status summary:', error);
      setError('Failed to load loan application summary');
      toast.error('Failed to load loan application summary');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchStatusSummary();
  }, []);

  // Calculate totals
  const getTotalApplications = () => {
    if (!statusSummary) return 0;
    return Object.values(statusSummary).reduce((total, count) => total + count, 0);
  };

  // Status configuration with icons and colors
  const statusConfig = [
    {
      key: 'pending' as keyof LoanApplicationStatusSummary,
      label: 'Pending',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      badgeVariant: 'secondary' as const
    },
    {
      key: 'underReview' as keyof LoanApplicationStatusSummary,
      label: 'Under Review',
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      badgeVariant: 'outline' as const
    },
    {
      key: 'approved' as keyof LoanApplicationStatusSummary,
      label: 'Approved',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      badgeVariant: 'default' as const
    },
    {
      key: 'rejected' as keyof LoanApplicationStatusSummary,
      label: 'Rejected',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      badgeVariant: 'destructive' as const
    },
    {
      key: 'disbursed' as keyof LoanApplicationStatusSummary,
      label: 'Disbursed',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      badgeVariant: 'default' as const
    }
  ];

  return (
    <UserDashboardLayout>
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold">Loan Application Summary</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Overview of your loan applications and their current status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatusSummary}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1.5" />
              )}
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/user/loan-application')}
            >
              <FileText className="h-3 w-3 mr-1.5" />
              Apply for Loan
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={fetchStatusSummary}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : statusSummary ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Total Summary Card */}
            {/* <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Total Applications Overview
                </CardTitle>
                <CardDescription className="text-xs">
                  You have submitted a total of {getTotalApplications()} loan applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-2">
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {getTotalApplications()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total Loan Applications
                  </p>
                </div>
              </CardContent>
            </Card> */}

            {/* Status Breakdown - Collapsible Accordion */}
            <Accordion type="single" collapsible defaultValue="status-breakdown">
              <AccordionItem value="status-breakdown" className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Application Status Breakdown</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {statusConfig.map((config) => {
                      const Icon = config.icon;
                      const count = statusSummary[config.key];
                      const percentage = getTotalApplications() > 0 
                        ? (count / getTotalApplications()) * 100 
                        : 0;
                      
                      return (
                        <Card 
                          key={config.key}
                          className={`${config.borderColor} border ${config.bgColor} shadow-sm hover:shadow transition-shadow`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Icon className={`h-6 w-6 ${config.color}`} />
                              <Badge 
                                variant={config.badgeVariant} 
                                className="text-[10px] px-2 py-0.5"
                              >
                                {config.label}
                              </Badge>
                            </div>

                            <div className="text-center mb-3">
                              <div className={`text-3xl font-bold ${config.color} mb-0.5`}>
                                {count}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {config.label}
                              </p>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="mt-3">
                              <div className="bg-white/50 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    config.key === 'pending' ? 'bg-yellow-500' :
                                    config.key === 'underReview' ? 'bg-blue-500' :
                                    config.key === 'approved' ? 'bg-green-500' :
                                    config.key === 'rejected' ? 'bg-red-500' :
                                    'bg-purple-500'
                                  } ${
                                    percentage >= 100 ? 'w-full' :
                                    percentage >= 75 ? 'w-3/4' :
                                    percentage >= 67 ? 'w-2/3' :
                                    percentage >= 50 ? 'w-1/2' :
                                    percentage >= 33 ? 'w-1/3' :
                                    percentage >= 25 ? 'w-1/4' :
                                    percentage > 0 ? 'w-1/12' : 'w-0'
                                  }`}
                                ></div>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                                {percentage.toFixed(0)}% of total
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription className="text-xs">
                  Manage your loan applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-auto p-3 flex flex-col items-center gap-1.5"
                    onClick={() => navigate('/user/loan-application')}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-xs">New Application</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-auto p-3 flex flex-col items-center gap-1.5"
                    onClick={() => navigate('/user/loans')}
                  >
                    <Search className="h-5 w-5" />
                    <span className="text-xs">View Applications</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-auto p-3 flex flex-col items-center gap-1.5"
                    onClick={() => navigate('/user/loan-account-history')}
                  >
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs">Loan Accounts</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-auto p-3 flex flex-col items-center gap-1.5"
                    onClick={fetchStatusSummary}
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span className="text-xs">Refresh Summary</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status Details */}
            {getTotalApplications() > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Application Status Details</CardTitle>
                  <CardDescription className="text-xs">
                    Detailed breakdown of your loan application statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {statusConfig.map((config) => {
                      const count = statusSummary[config.key];
                      const percentage = getTotalApplications() > 0 
                        ? (count / getTotalApplications()) * 100 
                        : 0;
                      
                      if (count === 0) return null;
                      
                      return (
                        <div key={config.key} className="flex items-center justify-between p-2.5 rounded-lg border">
                          <div className="flex items-center gap-2.5">
                            <config.icon className={`h-4 w-4 ${config.color}`} />
                            <div>
                              <p className="text-sm font-medium">{config.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {count} application{count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={config.badgeVariant} className="text-[10px] px-2 py-0.5">
                              {percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No loan application data available</p>
              <Button onClick={() => navigate('/user/loan-application')}>
                Apply for Your First Loan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </UserDashboardLayout>
  );
};

export default LoanApplicationSummary;
