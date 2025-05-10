import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/admin/Dashboard";
import Members from "./pages/admin/Members";
import Loans from "./pages/admin/Loans";
import Accounts from "./pages/admin/Accounts";
import AccountTypes from "./pages/admin/AccountTypes";
import Payments from "./pages/admin/Payments";
import PaymentTypes from "./pages/admin/PaymentTypes";
import PaymentModes from "./pages/admin/PaymentModes";
import NextOfKinManagement from "./pages/admin/NextOfKinManagement";
import MemberManagement from "./pages/admin/MemberManagement";
import Settings from "./pages/admin/Settings";
import Notifications from "./pages/admin/Notifications";
import NotFound from "./pages/NotFound";
import Permissions from "./pages/admin/Permissions";
import BoardMembers from "./pages/admin/BoardMembers";
import Savings from "./pages/admin/Savings";
import Roles from "./pages/admin/Roles";
import RepaymentSchedule from "./pages/admin/RepaymentSchedule";
import Repayments from "./pages/admin/Repayments";
import Disbursements from "./pages/admin/Disbursements";
import ProtectedRoute from "./components/ProtectedRoute";
import LoanProducts from "./pages/admin/LoanProducts";
import LoanPenalties from "./pages/admin/LoanPenalties";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/members" element={<Members />} />
            <Route
              path="/admin/member-management"
              element={<MemberManagement />}
            />
            <Route path="/admin/loans" element={<Loans />} />
            <Route path="/admin/loan-products" element={<LoanProducts />} />
            <Route path="/admin/loan-penalties" element={<LoanPenalties />} />

            <Route
              path="/admin/loan-schedules"
              element={<RepaymentSchedule />}
            />
            <Route path="/admin/loan-repayments" element={<Repayments />} />
            <Route
              path="/admin/loan-disbursements"
              element={<Disbursements />}
            />
            <Route path="/admin/accounts" element={<Accounts />} />
            <Route path="/admin/account-types" element={<AccountTypes />} />
            <Route path="/admin/payments" element={<Payments />} />
            <Route path="/admin/payment-types" element={<PaymentTypes />} />
            <Route path="/admin/payment-modes" element={<PaymentModes />} />
            <Route
              path="/admin/next-of-kin"
              element={<NextOfKinManagement />}
            />
            <Route path="/admin/permissions" element={<Permissions />} />
            <Route path="/admin/board-members" element={<BoardMembers />} />
            <Route path="/admin/savings" element={<Savings />} />
            <Route path="/admin/roles" element={<Roles />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/notifications" element={<Notifications />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
