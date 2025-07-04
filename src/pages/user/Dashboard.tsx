import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserDashboardLayout from "./layout/UserDashboardLayout";
import { CreditCard, PiggyBank, Calendar, Activity, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  return (
    <UserDashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground mb-6">Welcome to the TohekoSACCO member portal</p>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active Loans</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Savings</p>
                  <h3 className="text-2xl font-bold">$0.00</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <PiggyBank className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Next Payment Due</p>
                  <h3 className="text-2xl font-bold">None</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Monthly Transactions</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No recent activity to display
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Actions */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors border border-muted">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="text-sm font-medium">Apply for Loan</div>
                  </CardContent>
                </Card>
                
                <Link to="/user/payments">
                  <Card className="cursor-pointer hover:bg-muted/50 transition-colors border border-muted">
                    <CardContent className="p-4 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-sm font-medium">Make Payment</div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors border border-muted">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-sm font-medium">View Statements</div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors border border-muted">
                  <CardContent className="p-4 flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-sm font-medium">Update Profile</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserDashboardLayout>
  );
};

export default UserDashboard;
