import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  History,
  Clock,
  DollarSign,
  HelpCircle,
  Bell,
  Wallet,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

interface LoaneeDashboardLayoutProps {
  children: React.ReactNode;
}

const LoaneeDashboardLayout: React.FC<LoaneeDashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarState, setSidebarState] = useState({
    collapsed: false,
    isMobile: false,
    isOpen: true,
  });
  const [userEmail, setUserEmail] = useState<string>("");

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

    // Get user email from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.sub || "");
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuSections = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/loanee-dashboard" },
      ]
    },
    {
      title: "Loans",
      items: [
        { label: "Apply for Loan", icon: <FileText size={18} />, path: "/loanee/apply-loan", badge: "New" },
        { label: "My Loans", icon: <CreditCard size={18} />, path: "/loanee/my-loans" },
        { label: "Loan Status", icon: <Clock size={18} />, path: "/loanee/loan-status" },
        { label: "Repayment Schedule", icon: <DollarSign size={18} />, path: "/loanee/repayment-schedule" },
      ]
    },
    {
      title: "Payments",
      items: [
        { label: "Make Payment", icon: <Wallet size={18} />, path: "/loanee/make-payment" },
        { label: "Payment History", icon: <History size={18} />, path: "/loanee/payment-history" },
      ]
    },
    {
      title: "Account",
      items: [
        { label: "Profile", icon: <User size={18} />, path: "/loanee/profile" },
        { label: "Settings", icon: <Settings size={18} />, path: "/loanee/settings" },
        { label: "Help & Support", icon: <HelpCircle size={18} />, path: "/loanee/support" },
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("You have been logged out successfully");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      {/* Mobile Overlay */}
      {sidebarState.isMobile && sidebarState.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarState.isOpen ? "translate-x-0" : "-translate-x-full"}
                ${sidebarState.collapsed && !sidebarState.isMobile ? "w-16" : "w-60"}
                fixed left-0 top-0 z-20 h-screen flex flex-col border-r bg-background
                transition-all duration-300 ease-in-out md:translate-x-0 shadow-sm`}
      >
        {/* Header */}
        <div className="flex h-14 items-center border-b px-3 justify-between">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              L
            </div>
            {!sidebarState.collapsed && (
              <div className="ml-3">
                <h1 className="text-sm font-semibold leading-none">TohekoSACCO</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Loanee Portal</p>
              </div>
            )}
          </div>
          {!sidebarState.isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarState(prev => ({ ...prev, collapsed: !prev.collapsed }))}
              className="h-8 w-8 text-muted-foreground hover:text-foreground">
              {sidebarState.collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? "mt-6" : ""}>
              {!sidebarState.collapsed && (
                <h3 className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => sidebarState.isMobile && toggleSidebar()}
                      className={`flex items-center px-2 py-2 text-sm rounded-lg transition-all duration-150 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      title={sidebarState.collapsed ? item.label : ""}
                    >
                      <span className={`flex-shrink-0 ${!sidebarState.collapsed ? "mr-3" : "mx-auto"}`}>
                        {item.icon}
                      </span>
                      {!sidebarState.collapsed && (
                        <span className="flex-1">{item.label}</span>
                      )}
                      {!sidebarState.collapsed && item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs bg-green-100 text-green-700 hover:bg-green-100">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t p-3">
          {!sidebarState.collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{userEmail}</p>
                  <p className="text-xs text-muted-foreground">Loanee</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs h-8"
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="w-full h-10"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarState.collapsed && !sidebarState.isMobile ? "md:ml-16" : "md:ml-60"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1" />
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LoaneeDashboardLayout;
