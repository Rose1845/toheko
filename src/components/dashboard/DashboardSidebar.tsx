import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  PiggyBank,
  Settings,
  LogOut,
  BookOpen,
  Receipt,
  UserPlus,
  Shield,
  UserCog,
  Menu,
  ChevronLeft,
  ChevronDown,
  Wallet,
  CreditCard as CreditCardIcon,
} from "lucide-react";

const SidebarLink = ({
  to,
  icon,
  label,
  active,
  collapsed,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}) => (
  <Link
    to={to}
    className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}
  >
    {icon}
    {!collapsed && <span>{label}</span>}
  </Link>
);

const SidebarSubmenu = ({
  icon,
  label,
  collapsed,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 rounded-md px-3 py-2 transition-colors
                   text-muted-foreground hover:bg-muted hover:text-foreground`}
      >
        <div className="flex items-center gap-3">
          {icon}
          {!collapsed && <span>{label}</span>}
        </div>
        {!collapsed && (
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {(isOpen || collapsed) && (
        <div className={`pl-${collapsed ? "0" : "8"} space-y-1 mt-1`}>
          {children}
        </div>
      )}
    </div>
  );
};

export default function DashboardSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Emit sidebar state changes to the layout
  useEffect(() => {
    const sidebarState = {
      collapsed,
      isMobile,
      isOpen: sidebarOpen,
    };
    // Create and dispatch a custom event with the sidebar state
    const event = new CustomEvent("sidebarStateChange", {
      detail: sidebarState,
    });
    window.dispatchEvent(event);
  }, [collapsed, isMobile, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-30 md:hidden bg-background p-2 rounded-md border shadow-sm"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                  ${collapsed && !isMobile ? "w-20" : "w-64"} 
                  fixed left-0 top-0 z-20 h-screen flex flex-col border-r bg-background p-4 
                  transition-all duration-300 ease-in-out md:translate-x-0`}
      >
        <div className="flex h-14 items-center border-b px-4 justify-between">
          {!collapsed && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <PiggyBank className="h-6 w-6" />
              <span className="text-lg">SACCO Admin</span>
            </Link>
          )}
          {collapsed && <PiggyBank className="h-6 w-6 mx-auto" />}

          <button
            onClick={toggleCollapse}
            className="hidden md:block text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft
              className={`h-5 w-5 transition-transform duration-200 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <nav className="flex-1 space-y-1 py-4 overflow-y-auto">
          <div className="pb-2">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dashboard
              </p>
            )}
          </div>
          <SidebarLink
            to="/admin/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Overview"
            active={isActive("/admin/dashboard")}
            collapsed={collapsed}
          />

          <div className="pt-4 pb-2">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Members
              </p>
            )}
          </div>
          <SidebarLink
            to="/admin/member-management"
            icon={<Users className="h-5 w-5" />}
            label="Members"
            active={isActive("/admin/member-management")}
            collapsed={collapsed}
          />
          {/* <SidebarLink
            to="/admin/next-of-kin"
            icon={<UserPlus className="h-5 w-5" />}
            label="Next of Kin"
            active={isActive("/admin/next-of-kin")}
            collapsed={collapsed}
          />
          <SidebarLink
            to="/admin/board-members"
            icon={<UserCog className="h-5 w-5" />}
            label="Board Members"
            active={isActive("/admin/board-members")}
            collapsed={collapsed}
          /> */}

          <div className="pt-4 pb-2">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Financial
              </p>
            )}
          </div>
          <SidebarSubmenu
            icon={<CreditCard className="h-5 w-5" />}
            label="Loans"
            collapsed={collapsed}
          >
            <SidebarLink
              to="/admin/loans"
              icon={<CreditCard className="h-5 w-5" />}
              label="All Loans"
              active={isActive("/admin/loans")}
              collapsed={collapsed}
            />
            <SidebarLink
              to="/admin/loan-products"
              icon={<CreditCard className="h-5 w-5" />}
              label="Loan Product"
              active={isActive("/admin/loan-products")}
              collapsed={collapsed}
            />
            <SidebarLink
              to="/admin/loan-penalties"
              icon={<CreditCard className="h-5 w-5" />}
              label="Penalty"
              active={isActive("/admin/loan-pemalties")}
              collapsed={collapsed}
            />
            <SidebarLink
              to="/admin/loan-repayments"
              icon={<Receipt className="h-5 w-5" />}
              label="Repayments"
              active={isActive("/admin/loan-repayments")}
              collapsed={collapsed}
            />
            <SidebarLink
              to="/admin/loan-schedules"
              icon={<BookOpen className="h-5 w-5" />}
              label="Schedules"
              active={isActive("/admin/loan-schedules")}
              collapsed={collapsed}
            />
            <SidebarLink
              to="/admin/loan-disbursements"
              icon={<Wallet className="h-5 w-5" />}
              label="Disbursement"
              active={isActive("/admin/loan-disbursements")}
              collapsed={collapsed}
            />
          </SidebarSubmenu>

          <SidebarLink
            to="/admin/accounts"
            icon={<PiggyBank className="h-5 w-5" />}
            label="Accounts"
            active={isActive("/admin/accounts")}
            collapsed={collapsed}
          />
          <SidebarLink
            to="/admin/account-types"
            icon={<BookOpen className="h-5 w-5" />}
            label="Account Types"
            active={isActive("/admin/account-types")}
            collapsed={collapsed}
          />
          <SidebarLink
            to="/admin/savings"
            icon={<PiggyBank className="h-5 w-5" />}
            label="Savings"
            active={isActive("/admin/savings")}
            collapsed={collapsed}
          />

          <SidebarSubmenu
            icon={<Receipt className="h-5 w-5" />}
            label="Payments"
            collapsed={collapsed}
          >
            <SidebarLink
              to="/admin/payments"
              icon={<Receipt className="h-5 w-5" />}
              label="All Payments"
              active={isActive("/admin/payments")}
              collapsed={collapsed}
            />
            <SidebarLink
              to="/admin/payment-types"
              icon={<CreditCardIcon className="h-5 w-5" />}
              label="Payment Types"
              active={isActive("/admin/payment-types")}
              collapsed={collapsed}
            />
            <SidebarLink
              to="/admin/payment-modes"
              icon={<Wallet className="h-5 w-5" />}
              label="Payment Modes"
              active={isActive("/admin/payment-modes")}
              collapsed={collapsed}
            />
          </SidebarSubmenu>

          <div className="pt-4 pb-2">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                System
              </p>
            )}
          </div>
          <SidebarLink
            to="/admin/roles"
            icon={<Shield className="h-5 w-5" />}
            label="Roles"
            active={isActive("/admin/roles")}
            collapsed={collapsed}
          />
          <SidebarLink
            to="/admin/settings"
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            active={isActive("/admin/settings")}
            collapsed={collapsed}
          />
        </nav>

        <div className="mt-auto border-t pt-2 space-y-1">
          <Link
            to="/logout"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </Link>
        </div>
      </div>

      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-10 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
