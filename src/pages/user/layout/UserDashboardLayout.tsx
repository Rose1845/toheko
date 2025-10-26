import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CreditCard,
  PiggyBank,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Wallet,
  History,
  Building2,
  TrendingUp,
} from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";
import UserDashboardHeader from "./UserDashboardHeader";

interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarState, setSidebarState] = useState({
    collapsed: false,
    isMobile: false,
    isOpen: true,
  });

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarState(prev => ({ ...prev, isMobile: true, isOpen: false }));
      } else {
        setSidebarState(prev => ({ ...prev, isMobile: false, isOpen: true }));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/user/dashboard" },
    { label: "Payments", icon: <Wallet size={20} />, path: "/user/payments" },
    { label: "Payment History", icon: <History size={20} />, path: "/user/payment-history" },
    { label: "Loans", icon: <CreditCard size={20} />, path: "/user/loans" },
    { label: "Loan Accounts", icon: <Building2 size={20} />, path: "/user/loan-account-history" },
    { label: "Loan Summary", icon: <TrendingUp size={20} />, path: "/user/loan-application-summary" },
    { label: "Apply for Loan", icon: <FileText size={20} />, path: "/user/loan-application" },
    { label: "Savings", icon: <PiggyBank size={20} />, path: "/user/savings" },
    { label: "Statements", icon: <FileText size={20} />, path: "/user/statements" },
    { label: "Profile", icon: <User size={20} />, path: "/user/profile" },
    { label: "Settings", icon: <Settings size={20} />, path: "/user/settings" },
  ];

  const handleLogout = () => {
    authService.logout();
    toast.success("You have been logged out successfully");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarState.isOpen ? "translate-x-0" : "-translate-x-full"} 
                ${sidebarState.collapsed && !sidebarState.isMobile ? "w-16" : "w-56"} 
                fixed left-0 top-0 z-20 h-screen flex flex-col border-r bg-background p-3 
                transition-all duration-300 ease-in-out md:translate-x-0`}
      >
        <div className="flex h-12 items-center border-b pb-2 justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sacco-500 to-success-500 flex items-center justify-center text-white font-bold text-base">
              M
            </div>
            {!sidebarState.collapsed && <h1 className="text-lg font-semibold ml-2 truncate">Member Portal</h1>}
          </div>
          {!sidebarState.isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarState(prev => ({ ...prev, collapsed: !prev.collapsed }))} 
              className="h-9 w-9">
              {sidebarState.collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          )}
        </div>

        <nav className="flex-1 py-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                title={sidebarState.collapsed ? item.label : ""}
              >
                <span className={`flex-shrink-0 ${!sidebarState.collapsed ? "mr-2" : "mx-auto"}`}>{item.icon}</span>
                {!sidebarState.collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t pt-2">
          <Button
            variant="ghost"
            className={`w-full flex items-center justify-${sidebarState.collapsed ? "center" : "start"} px-2 py-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive`}
            onClick={handleLogout}
            title={sidebarState.collapsed ? "Logout" : ""}
          >
            <LogOut className={`h-5 w-5 ${!sidebarState.collapsed ? "mr-2" : ""}`} />
            {!sidebarState.collapsed && <span className="truncate">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarState.isOpen && sidebarState.isMobile && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Content area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
                   ${sidebarState.isOpen && !sidebarState.isMobile
                       ? sidebarState.collapsed ? "md:ml-20" : "md:ml-64"
                       : "ml-0"
                   }`}
      >
        <UserDashboardHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarState.isOpen} />
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default UserDashboardLayout;
