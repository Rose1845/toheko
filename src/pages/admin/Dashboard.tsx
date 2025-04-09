
import React from 'react';
import DashboardLayout from '@/pages/admin/DashboardLayout';
import OverviewStats from '@/components/dashboard/OverviewStats';
import RecentActivities from '@/components/dashboard/RecentActivities';
import PerformanceChart from '@/components/dashboard/PerformanceChart';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome to the Mahissa SACCO management dashboard</p>
        </div>
        
        <OverviewStats />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <PerformanceChart />
          </div>
          <div className="lg:col-span-2">
            <RecentActivities />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
