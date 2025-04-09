
import { Link, useLocation } from "react-router-dom";
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
  UserCog
} from "lucide-react";

const SidebarLink = ({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default function DashboardSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r bg-background p-4">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <PiggyBank className="h-6 w-6" />
          <span className="text-lg">SACCO Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 py-4 overflow-y-auto">
        <div className="pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Dashboard
          </p>
        </div>
        <SidebarLink to="/admin/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Overview" active={isActive("/admin/dashboard")} />
        
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Members
          </p>
        </div>
        <SidebarLink to="/admin/members" icon={<Users className="h-5 w-5" />} label="Members" active={isActive("/admin/members")} />
        <SidebarLink to="/admin/next-of-kin" icon={<UserPlus className="h-5 w-5" />} label="Next of Kin" active={isActive("/admin/next-of-kin")} />
        <SidebarLink to="/admin/board-members" icon={<UserCog className="h-5 w-5" />} label="Board Members" active={isActive("/admin/board-members")} />
        
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Financial
          </p>
        </div>
        <SidebarLink to="/admin/loans" icon={<CreditCard className="h-5 w-5" />} label="Loans" active={isActive("/admin/loans")} />
        <SidebarLink to="/admin/accounts" icon={<PiggyBank className="h-5 w-5" />} label="Accounts" active={isActive("/admin/accounts")} />
        <SidebarLink to="/admin/account-types" icon={<BookOpen className="h-5 w-5" />} label="Account Types" active={isActive("/admin/account-types")} />
        <SidebarLink to="/admin/savings" icon={<PiggyBank className="h-5 w-5" />} label="Savings" active={isActive("/admin/savings")} />
        <SidebarLink to="/admin/payments" icon={<Receipt className="h-5 w-5" />} label="Payments" active={isActive("/admin/payments")} />
        
        <div className="pt-4 pb-2">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            System
          </p>
        </div>
        <SidebarLink to="/admin/roles" icon={<Shield className="h-5 w-5" />} label="Roles" active={isActive("/admin/roles")} />
        <SidebarLink to="/admin/permissions" icon={<Shield className="h-5 w-5" />} label="Permissions" active={isActive("/admin/permissions")} />
      </nav>
      <div className="mt-auto border-t pt-2 space-y-1">
        <SidebarLink to="/admin/settings" icon={<Settings className="h-5 w-5" />} label="Settings" active={isActive("/admin/settings")} />
        <Link
          to="/logout"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
}
