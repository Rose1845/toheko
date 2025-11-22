/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarState, setSidebarState] = useState({
    collapsed: false,
    isMobile: false,
    isOpen: true,
  });

  // Create a custom event to listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = (event: CustomEvent) => {
      setSidebarState(event.detail);
    };

    // Add event listener for sidebar state changes
    window.addEventListener("sidebarStateChange" as any, handleSidebarChange);

    // Cleanup
    return () => {
      window.removeEventListener(
        "sidebarStateChange" as any,
        handleSidebarChange
      );
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gray-50">
        <DashboardSidebar />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0
                     ${
                       sidebarState.isOpen && !sidebarState.isMobile
                         ? sidebarState.collapsed
                           ? "md:ml-20"
                           : "md:ml-64"
                         : "ml-0"
                     }`}
        >
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
