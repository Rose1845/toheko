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

const MemberManagement = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
            <Members />
      </div>
    </DashboardLayout>
  );
};

export default MemberManagement;
