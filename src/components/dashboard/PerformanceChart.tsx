
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { loanService } from '@/services/loanService';
import { paymentService } from '@/services/paymentService';
import { memberService } from '@/services/memberService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PerformanceChart = () => {
  const [loading, setLoading] = useState(true);
  const [loanData, setLoanData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [memberData, setMemberData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [loans, payments, members] = await Promise.all([
          loanService.getLoanDashboardSummary(),
          paymentService.getPaymentKpis(),
          memberService.getMemberKpiStats()
        ]);
        setLoanData(loans.body);
        setPaymentData(payments);
        setMemberData(members);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Performance
          </CardTitle>
          <CardDescription>Current system statistics and trends</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Prepare loan status data for bar chart
  const loanStatusData = [
    { name: 'Pending', value: loanData?.totalPending || 0, fill: '#FFBB28' },
    { name: 'Under Review', value: loanData?.totalUnderReview || 0, fill: '#0088FE' },
    { name: 'Approved', value: loanData?.totalApproved || 0, fill: '#00C49F' },
    { name: 'Rejected', value: loanData?.totalRejected || 0, fill: '#FF8042' },
    { name: 'Disbursed', value: loanData?.totalDisbursed || 0, fill: '#8884d8' }
  ].filter(item => item.value > 0);

  // Prepare payment status data for pie chart
  const paymentStatusData = [
    { name: 'Completed', value: paymentData?.completedCount || 0 },
    { name: 'Pending', value: paymentData?.pendingCount || 0 },
    { name: 'Failed', value: paymentData?.failedCount || 0 }
  ].filter(item => item.value > 0);

  // Prepare member status data for pie chart
  const memberStatusData = memberData?.byStatus?.filter((s: any) => s.count > 0) || [];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Financial Performance
        </CardTitle>
        <CardDescription>Current system statistics and distributions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loan Applications Status Bar Chart */}
        {loanStatusData.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Loan Applications by Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={loanStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => [value, 'Count']}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment and Member Status - Side by Side Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Status Distribution */}
          {paymentStatusData.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Payment Status</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Member Status Distribution */}
          {memberStatusData.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Member Status</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={memberStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                  >
                    {memberStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Amount Applied</p>
            <p className="text-lg font-bold text-blue-600">
              KES {formatCurrency(loanData?.totalAmountApplied || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Payments</p>
            <p className="text-lg font-bold text-green-600">
              KES {formatCurrency(paymentData?.totalRequested || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="text-lg font-bold text-purple-600">
              {paymentData?.stkSuccessRate?.toFixed(1) || 0}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
