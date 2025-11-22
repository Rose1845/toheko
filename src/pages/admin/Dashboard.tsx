import React from "react";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import OverviewStats from "@/components/dashboard/OverviewStats";
import RecentActivities from "@/components/dashboard/RecentActivities";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BarChart3, Activity } from "lucide-react";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="px-2 py-3 sm:px-4 sm:py-4 md:py-6 space-y-4">
        <div className="mb-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Welcome to the TohekoSACCO management dashboard
          </p>
        </div>

        {/* KPI Stats */}
        <div>
          <Accordion type="single" collapsible defaultValue="kpi-stats">
            <AccordionItem value="kpi-stats" className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="font-semibold">Key Performance Indicators</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <OverviewStats />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </div>

        {/* Charts and Activities */}
        <div>
          <Accordion type="single" collapsible>
          <AccordionItem value="charts" className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="font-semibold">Performance & Activities</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pt-2">
                <div className="lg:col-span-3">
                  <PerformanceChart />
                </div>
                <div className="lg:col-span-2">
                  <RecentActivities />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
