
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { memberService } from '@/services/memberService';
import { loanService } from '@/services/loanService';
import { paymentService } from '@/services/paymentService';
import { Users, DollarSign, FileText, CreditCard, Loader2 } from 'lucide-react';

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Members',
      value: memberKpis?.totalMembers || 0,
      subtitle: `${memberKpis?.activeMembers || 0} Active, ${memberKpis?.pendingMembers || 0} Pending`,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Loan Applications',
      value: loanKpis?.totalApplications || 0,
      subtitle: `${loanKpis?.totalApproved || 0} Approved, ${loanKpis?.totalPending || 0} Pending`,
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'Total Payments',
      value: paymentKpis?.totalCount || 0,
      subtitle: `KES ${Number(paymentKpis?.totalRequested || 0).toLocaleString()} Requested`,
      icon: CreditCard,
      color: 'text-purple-600'
    },
    {
      title: 'Loan Accounts',
      value: loanAccountKpis?.byStatus?.reduce((sum: number, s: any) => sum + s.count, 0) || 0,
      subtitle: `KES ${Number(loanAccountKpis?.totalPrincipal || 0).toLocaleString()} Principal`,
      icon: DollarSign,
      color: 'text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
              <Icon className={`h-8 w-8 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OverviewStats;
