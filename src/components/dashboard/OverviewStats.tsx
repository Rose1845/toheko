
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { memberService } from '@/services/memberService';
import { loanService } from '@/services/loanService';
import { paymentService } from '@/services/paymentService';
import { Users, DollarSign, FileText, CreditCard, Loader2, UserCheck, UserX, Clock, CheckCircle, XCircle, AlertCircle, Wallet, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const OverviewStats = () => {
  const [loading, setLoading] = useState(true);
  const [memberKpis, setMemberKpis] = useState<any>(null);
  const [loanKpis, setLoanKpis] = useState<any>(null);
  const [paymentKpis, setPaymentKpis] = useState<any>(null);
  const [loanAccountKpis, setLoanAccountKpis] = useState<any>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setLoading(true);
        const [members, loans, payments, loanAccounts] = await Promise.all([
          memberService.getMemberKpiStats(),
          loanService.getLoanDashboardSummary(),
          paymentService.getPaymentKpis(),
          loanService.getLoanAccountKpi()
        ]);
        setMemberKpis(members);
        setLoanKpis(loans.body);
        setPaymentKpis(payments);
        setLoanAccountKpis(loanAccounts);
      } catch (error) {
        console.error('Error fetching KPIs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchKpis();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => `KES ${Number(amount || 0).toLocaleString()}`;

  return (
    <div className="space-y-4">
      {/* Members KPI Accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="members" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3 w-full">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Member Registration KPIs</div>
                <div className="text-xs text-muted-foreground">Total: {memberKpis?.totalMembers || 0} members</div>
              </div>
              <Badge variant="outline" className="ml-auto mr-2">{memberKpis?.activeMembers || 0} Active</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{memberKpis?.totalMembers || 0}</div>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{memberKpis?.activeMembers || 0}</div>
                </CardContent>
              </Card>
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-muted-foreground">Pending</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{memberKpis?.pendingMembers || 0}</div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <UserX className="h-4 w-4 text-gray-600" />
                    <span className="text-xs text-muted-foreground">Inactive</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-600">{memberKpis?.inactiveMembers || 0}</div>
                </CardContent>
              </Card>
            </div>
            {memberKpis?.byStatus && memberKpis.byStatus.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-2">Status Breakdown</div>
                <div className="flex flex-wrap gap-2">
                  {memberKpis.byStatus.map((status: any, idx: number) => (
                    <Badge key={idx} variant={status.count > 0 ? "default" : "outline"} className="text-xs">
                      {status.status}: {status.count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Loan Applications KPI Accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="loans" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3 w-full">
              <FileText className="h-5 w-5 text-green-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Loan Application Dashboard</div>
                <div className="text-xs text-muted-foreground">Total: {loanKpis?.totalApplications || 0} applications</div>
              </div>
              <Badge variant="outline" className="ml-auto mr-2">{formatCurrency(loanKpis?.totalAmountApplied || 0)}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4 pt-2">
              {/* Status Counts */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{loanKpis?.totalPending || 0}</div>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-muted-foreground">Under Review</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{loanKpis?.totalUnderReview || 0}</div>
                  </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Approved</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{loanKpis?.totalApproved || 0}</div>
                  </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-muted-foreground">Rejected</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{loanKpis?.totalRejected || 0}</div>
                  </CardContent>
                </Card>
                <Card className="border-purple-200 bg-purple-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-muted-foreground">Disbursed</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{loanKpis?.totalDisbursed || 0}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Amount Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-muted-foreground mb-1">Total Applied</div>
                  <div className="text-lg font-bold text-blue-600">{formatCurrency(loanKpis?.totalAmountApplied)}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs text-muted-foreground mb-1">Total Approved</div>
                  <div className="text-lg font-bold text-green-600">{formatCurrency(loanKpis?.totalAmountApproved)}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-xs text-muted-foreground mb-1">Total Rejected</div>
                  <div className="text-lg font-bold text-red-600">{formatCurrency(loanKpis?.totalAmountRejected)}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs text-muted-foreground mb-1">Average Amount</div>
                  <div className="text-lg font-bold text-purple-600">{formatCurrency(loanKpis?.averageLoanAmount)}</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-xs text-muted-foreground mb-1">Highest Amount</div>
                  <div className="text-lg font-bold text-amber-600">{formatCurrency(loanKpis?.highestLoanAmount)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-muted-foreground mb-1">Lowest Amount</div>
                  <div className="text-lg font-bold text-gray-600">{formatCurrency(loanKpis?.lowestLoanAmount)}</div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="pt-3 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-2">Additional Statistics</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Guarantors: {loanKpis?.applicationsWithGuarantor || 0}</Badge>
                  <Badge variant="outline">Collateral: {loanKpis?.applicationsWithCollateral || 0}</Badge>
                  <Badge variant="outline">Penalty Applicable: {loanKpis?.applicationsWithPenaltyApplicable || 0}</Badge>
                  <Badge variant="outline">Next of Kin: {loanKpis?.applicationsWithNextOfKin || 0}</Badge>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Payments KPI Accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="payments" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3 w-full">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Payment KPIs</div>
                <div className="text-xs text-muted-foreground">Total: {paymentKpis?.totalCount || 0} transactions</div>
              </div>
              <Badge variant="outline" className="ml-auto mr-2">{paymentKpis?.stkSuccessRate?.toFixed(1) || 0}% Success</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4 pt-2">
              {/* Transaction Counts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{paymentKpis?.completedCount || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">{formatCurrency(paymentKpis?.completedAmount)}</div>
                  </CardContent>
                </Card>
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{paymentKpis?.pendingCount || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">{formatCurrency(paymentKpis?.pendingAmount)}</div>
                  </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-muted-foreground">Failed</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{paymentKpis?.failedCount || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">{formatCurrency(paymentKpis?.failedAmount)}</div>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{paymentKpis?.totalCount || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">{formatCurrency(paymentKpis?.totalRequested)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs text-muted-foreground mb-1">STK Success Rate</div>
                  <div className="text-lg font-bold text-green-600">{paymentKpis?.stkSuccessRate?.toFixed(2) || 0}%</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs text-muted-foreground mb-1">Reconcile Lag P50</div>
                  <div className="text-lg font-bold text-blue-600">{paymentKpis?.reconcileLagP50Sec || 0}s</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs text-muted-foreground mb-1">Reconcile Lag P95</div>
                  <div className="text-lg font-bold text-purple-600">{paymentKpis?.reconcileLagP95Sec || 0}s</div>
                </div>
              </div>

              {/* M-Pesa Result Codes */}
              {paymentKpis?.mpesaResultCodeCounts && Object.keys(paymentKpis.mpesaResultCodeCounts).length > 0 && (
                <div className="pt-3 border-t">
                  <div className="text-xs font-medium text-muted-foreground mb-2">M-Pesa Result Codes</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(paymentKpis.mpesaResultCodeCounts).map(([code, count]: [string, any]) => (
                      <Badge key={code} variant={code === "0" ? "default" : "destructive"}>
                        Code {code}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {paymentKpis?.lastPaymentAt && (
                <div className="pt-3 border-t">
                  <div className="text-xs text-muted-foreground">Last Payment: {new Date(paymentKpis.lastPaymentAt).toLocaleString()}</div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Loan Accounts KPI Accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="loan-accounts" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3 w-full">
              <Wallet className="h-5 w-5 text-amber-600" />
              <div className="flex-1 text-left">
                <div className="font-semibold">Loan Account KPIs</div>
                <div className="text-xs text-muted-foreground">Principal: {formatCurrency(loanAccountKpis?.totalPrincipal)}</div>
              </div>
              <Badge variant="outline" className="ml-auto mr-2">{formatCurrency(loanAccountKpis?.totalOutstanding)} Outstanding</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4 pt-2">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-muted-foreground">Total Principal</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(loanAccountKpis?.totalPrincipal)}</div>
                  </CardContent>
                </Card>
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-muted-foreground">Total Outstanding</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-600">{formatCurrency(loanAccountKpis?.totalOutstanding)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Breakdown */}
              {loanAccountKpis?.byStatus && loanAccountKpis.byStatus.length > 0 && (
                <div className="pt-3 border-t">
                  <div className="text-xs font-medium text-muted-foreground mb-3">Status Breakdown</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {loanAccountKpis.byStatus.map((status: any, idx: number) => (
                      <Card key={idx} className={status.count > 0 ? "border-l-4 border-l-primary" : "opacity-60"}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">{status.status.replace(/_/g, ' ')}</span>
                            <Badge variant={status.count > 0 ? "default" : "outline"}>{status.count}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-muted-foreground">Principal</div>
                              <div className="font-semibold">{formatCurrency(status.principalSum)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Outstanding</div>
                              <div className="font-semibold">{formatCurrency(status.outstandingSum)}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default OverviewStats;
