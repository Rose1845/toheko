import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { jwtDecode } from "jwt-decode";
import { 
  FileText, 
  Clock, 
  ClipboardList,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import LoaneeDashboardLayout from "./layout/LoaneeDashboardLayout";

interface DecodedToken {
  sub: string;
  role: string[];
  exp: number;
}

const LoaneeDashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<{ email: string; role: string[] } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to continue");
      navigate("/loanee/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      if (!decoded.role.includes("LOANEE")) {
        toast.error("Unauthorized access");
        navigate("/loanee/login");
        return;
      }
      setUserInfo({ email: decoded.sub, role: decoded.role });
    } catch (error) {
      toast.error("Invalid session");
      localStorage.removeItem("token");
      navigate("/loanee/login");
    }
  }, [navigate]);

  if (!userInfo) {
    return null;
  }

  return (
    <LoaneeDashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {userInfo.email.split('@')[0]}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your loan applications here.</p>
          </div>
          <Button 
            onClick={() => navigate("/loanee/loan-application")}
          >
            <FileText className="mr-2 h-4 w-4" />
            Apply for Loan
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Under review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Successful</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Not approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Apply for Loan
              </CardTitle>
              <CardDescription>Submit a new loan application</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/loanee/loan-application")}>
                Start Application
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                My Applications
              </CardTitle>
              <CardDescription>View all your loan applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" onClick={() => navigate("/loanee/applications")}>
                View Applications
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your latest loan applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4 text-gray-300" />
              <p className="font-medium">No applications yet</p>
              <p className="text-sm mt-1">Start by applying for a loan</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => navigate("/loanee/loan-application")}
              >
                Apply Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </LoaneeDashboardLayout>
  );
};

export default LoaneeDashboard;
