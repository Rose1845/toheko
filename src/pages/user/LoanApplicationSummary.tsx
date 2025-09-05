import React, { useState, useEffect } from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { 
  CheckCircle, 
  Clock, 
  Search, 
  XCircle, 
  DollarSign, 
  FileText, 
  TrendingUp,
  RefreshCw
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
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Loan Application Summary</h1>
            <p className="text-sm text-muted-foreground">
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
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/user/loan-application')}
            >
              <FileText className="h-4 w-4 mr-2" />
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
          <div className="space-y-6">
            {/* Total Summary Card */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Total Applications Overview
                </CardTitle>
                <CardDescription>
                  You have submitted a total of {getTotalApplications()} loan applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {getTotalApplications()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Loan Applications
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {statusConfig.map((config) => {
                const Icon = config.icon;
                const count = statusSummary[config.key];
                
                return (
                  <Card 
                    key={config.key}
                    className={`${config.borderColor} border-2 ${config.bgColor} hover:shadow-md transition-shadow`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Icon className={`h-6 w-6 ${config.color}`} />
                        <Badge variant={config.badgeVariant} className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${config.color} mb-1`}>
                          {count}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {config.label}
                        </p>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="bg-white rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              config.key === 'pending' ? 'bg-yellow-400' :
                              config.key === 'underReview' ? 'bg-blue-400' :
                              config.key === 'approved' ? 'bg-green-400' :
                              config.key === 'rejected' ? 'bg-red-400' :
                              'bg-purple-400'
                            } ${
                              getTotalApplications() > 0 
                                ? count === getTotalApplications() ? 'w-full' :
                                  count >= getTotalApplications() * 0.75 ? 'w-3/4' :
                                  count >= getTotalApplications() * 0.5 ? 'w-1/2' :
                                  count >= getTotalApplications() * 0.25 ? 'w-1/4' :
                                  count > 0 ? 'w-1/12' : 'w-0'
                                : 'w-0'
                            }`}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          {getTotalApplications() > 0 
                            ? `${Math.round((count / getTotalApplications()) * 100)}%`
                            : '0%'
                          } of total
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>
                  Manage your loan applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => navigate('/user/loan-application')}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">New Application</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => navigate('/user/loans')}
                  >
                    <Search className="h-6 w-6" />
                    <span className="text-sm">View Applications</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => navigate('/user/loan-account-history')}
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-sm">Loan Accounts</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={fetchStatusSummary}
                  >
                    <RefreshCw className="h-6 w-6" />
                    <span className="text-sm">Refresh Summary</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status Details */}
            {getTotalApplications() > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Application Status Details</CardTitle>
                  <CardDescription>
                    Detailed breakdown of your loan application statuses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statusConfig.map((config) => {
                      const count = statusSummary[config.key];
                      const percentage = getTotalApplications() > 0 
                        ? (count / getTotalApplications()) * 100 
                        : 0;
                      
                      if (count === 0) return null;
                      
                      return (
                        <div key={config.key} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <config.icon className={`h-5 w-5 ${config.color}`} />
                            <div>
                              <p className="font-medium">{config.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {count} application{count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={config.badgeVariant}>
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
