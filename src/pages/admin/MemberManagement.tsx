import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/pages/admin/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

// Import components from existing pages
import Members from "./Members";
import BoardMembers from "./BoardMembers";
import NextOfKinManagement from "./NextOfKinManagement";

const MemberManagement = () => {
  const [activeTab, setActiveTab] = useState<"members" | "boardMembers" | "nextOfKin">("members");
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                Manage SACCO members, board members, and next of kin records
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="members"
              value={activeTab}
              onValueChange={(value: "members" | "boardMembers" | "nextOfKin") => setActiveTab(value)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="boardMembers">Board Members</TabsTrigger>
                <TabsTrigger value="nextOfKin">Next of Kin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="members" className="mt-4">
                <Members isTabbed={true} />
              </TabsContent>
              
              <TabsContent value="boardMembers" className="mt-4">
                <BoardMembers isTabbed={true} />
              </TabsContent>
              
              <TabsContent value="nextOfKin" className="mt-4">
                <NextOfKinManagement isTabbed={true} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MemberManagement;
