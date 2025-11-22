
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RecentActivities = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activities
        </CardTitle>
        <CardDescription>Latest activities across the platform</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[250px] flex items-center justify-center">
        {/* <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Recent activity feed will be displayed here once integrated with audit log API.
            This will show real-time member actions, transactions, and system events.
          </AlertDescription>
        </Alert> */}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
