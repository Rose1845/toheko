import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserDashboardLayout from "./layout/UserDashboardLayout";
import { CreditCard, PiggyBank, Calendar, Activity, Wallet, TrendingUp, Loader2, AlertCircle, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { userPaymentService, PaymentKPIs, Account } from "@/services/user-services/userPaymentService";
import { userLoanService, LoanApplicationStatusSummary } from "@/services/user-services/userLoanService";
import { format } from "date-fns";

interface JwtPayload {
  sub: string;
  userId: number;
  role: string;
}

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [paymentKPIs, setPaymentKPIs] = useState<PaymentKPIs | null>(null);
  const [loanSummary, setLoanSummary] = useState<LoanApplicationStatusSummary | null>(null);

  const getUserId = (): number | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.userId;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const userId = getUserId();
      if (!userId) {
        setError("Unable to get user information");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [accountsData, kpisData, loanData] = await Promise.allSettled([
          userPaymentService.getMemberAccounts(userId),
          userPaymentService.getPaymentKPIs(userId),
          userLoanService.getLoanApplicationStatusSummary(userId),
        ]);

        if (accountsData.status === "fulfilled") {
          setAccounts(accountsData.value || []);
        }
        if (kpisData.status === "fulfilled") {
          setPaymentKPIs(kpisData.value);
        }
        if (loanData.status === "fulfilled") {
          setLoanSummary(loanData.value);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate total savings from accounts - memoized for performance
  const totalSavings = useMemo(() => 
    accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0), 
    [accounts]
  );

  // Calculate active loans (approved + disbursed) - memoized for performance
  const activeLoans = useMemo(() => 
    loanSummary ? (loanSummary.approved + loanSummary.disbursed) : 0,
    [loanSummary]
  );

  // Calculate pending applications - memoized for performance
  const pendingApplications = useMemo(() => 
    loanSummary ? (loanSummary.pending + loanSummary.underReview) : 0,
    [loanSummary]
  );

  // Format last payment date - memoized for performance
  const lastPaymentDate = useMemo(() => 
    paymentKPIs?.lastPaymentAt
      ? format(new Date(paymentKPIs.lastPaymentAt), "MMM dd, yyyy")
      : "No payments",
    [paymentKPIs?.lastPaymentAt]
  );

  return (
    <UserDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold mb-2">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Welcome to the TohekoSACCO member portal
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-12 text-destructive">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Savings</p>
                      <h3 className="text-lg sm:text-2xl font-bold truncate">
                        KES {totalSavings.toLocaleString()}
                      </h3>
                    </div>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 ml-2">
                      <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Active Loans</p>
                      <h3 className="text-lg sm:text-2xl font-bold">{activeLoans}</h3>
                    </div>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ml-2">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Pending Apps</p>
                      <h3 className="text-lg sm:text-2xl font-bold">{pendingApplications}</h3>
                    </div>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 ml-2">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Payments</p>
                      <h3 className="text-lg sm:text-2xl font-bold">{paymentKPIs?.completedCount || 0}</h3>
                    </div>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 ml-2">
                      <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Paid</p>
                    <h3 className="text-base sm:text-xl font-bold text-green-600">
                      KES {(paymentKPIs?.completedAmount || 0).toLocaleString()}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending Amount</p>
                    <h3 className="text-base sm:text-xl font-bold text-amber-600">
                      KES {(paymentKPIs?.pendingAmount || 0).toLocaleString()}
                    </h3>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2 lg:col-span-1">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">Last Payment</p>
                    <h3 className="text-base sm:text-xl font-bold">{lastPaymentDate}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loan Application Summary */}
            {loanSummary && (
              <Card className="mb-6 sm:mb-8">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    Loan Applications Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                    <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-yellow-600">{loanSummary.pending}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">{loanSummary.underReview}</p>
                      <p className="text-xs text-muted-foreground">Under Review</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-green-600">{loanSummary.approved}</p>
                      <p className="text-xs text-muted-foreground">Approved</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-red-600">{loanSummary.rejected}</p>
                      <p className="text-xs text-muted-foreground">Rejected</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg col-span-2 sm:col-span-1">
                      <p className="text-lg sm:text-2xl font-bold text-purple-600">{loanSummary.disbursed}</p>
                      <p className="text-xs text-muted-foreground">Disbursed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Accounts Summary */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">My Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  {accounts.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No accounts found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {accounts.slice(0, 4).map((account) => (
                        <div key={account.accountId} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{account.name}</p>
                            <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">KES {account.balance.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              account.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {account.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/user/loan-application">
                      <Card className="cursor-pointer hover:bg-muted/50 transition-colors border border-muted h-full">
                        <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <CreditCard className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="text-xs sm:text-sm font-medium">Apply for Loan</div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/user/payments">
                      <Card className="cursor-pointer hover:bg-muted/50 transition-colors border border-muted h-full">
                        <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Wallet className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="text-xs sm:text-sm font-medium">Make Payment</div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/user/statements">
                      <Card className="cursor-pointer hover:bg-muted/50 transition-colors border border-muted h-full">
                        <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Activity className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="text-xs sm:text-sm font-medium">View Statements</div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/user/profile">
                      <Card className="cursor-pointer hover:bg-muted/50 transition-colors border border-muted h-full">
                        <CardContent className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <UserCircle className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="text-xs sm:text-sm font-medium">Update Profile</div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </UserDashboardLayout>
  );
};

export default UserDashboard;
