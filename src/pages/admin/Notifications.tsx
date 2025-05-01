import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "./DashboardLayout";
import { DataTable, Column } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle2, Loader2, RefreshCw, Trash2 } from "lucide-react";

// Define notification types
type NotificationType = "system" | "user" | "action";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: string;
  sender?: string;
  actionUrl?: string;
}

const Notifications = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "system" | "user" | "action">("all");
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Loan Application",
      message: "John Doe has submitted a new loan application for review.",
      type: "user",
      isRead: false,
      timestamp: "2025-04-28T11:30:00",
      sender: "John Doe",
      actionUrl: "/admin/loans",
    },
    {
      id: 2,
      title: "System Update Completed",
      message: "The system has been successfully updated to version 2.3.0.",
      type: "system",
      isRead: true,
      timestamp: "2025-04-28T10:15:00",
    },
    {
      id: 3,
      title: "New Member Registration",
      message: "Jane Smith has registered as a new member.",
      type: "user",
      isRead: false,
      timestamp: "2025-04-28T09:45:00",
      sender: "Jane Smith",
      actionUrl: "/admin/members",
    },
    {
      id: 4,
      title: "Payment Processed",
      message: "A payment of KES 5,000 has been processed for loan #12345.",
      type: "action",
      isRead: false,
      timestamp: "2025-04-27T16:20:00",
      actionUrl: "/admin/payments",
    },
    {
      id: 5,
      title: "Database Backup Completed",
      message: "Automatic database backup has been completed successfully.",
      type: "system",
      isRead: true,
      timestamp: "2025-04-27T02:00:00",
    },
    {
      id: 6,
      title: "Account Suspension",
      message: "Member account for Michael Johnson has been suspended due to inactivity.",
      type: "action",
      isRead: true,
      timestamp: "2025-04-26T14:35:00",
      actionUrl: "/admin/members",
    },
    {
      id: 7,
      title: "Loan Approved",
      message: "Loan application #54321 has been approved by the loan committee.",
      type: "action",
      isRead: false,
      timestamp: "2025-04-26T11:10:00",
      actionUrl: "/admin/loans",
    },
    {
      id: 8,
      title: "Security Alert",
      message: "Multiple failed login attempts detected from IP 192.168.1.1.",
      type: "system",
      isRead: false,
      timestamp: "2025-04-25T23:15:00",
    },
    {
      id: 9,
      title: "Member Profile Updated",
      message: "Sarah Wilson has updated her contact information.",
      type: "user",
      isRead: true,
      timestamp: "2025-04-25T15:40:00",
      sender: "Sarah Wilson",
      actionUrl: "/admin/members",
    },
    {
      id: 10,
      title: "Savings Goal Reached",
      message: "Robert Brown has reached his savings goal of KES 100,000.",
      type: "user",
      isRead: true,
      timestamp: "2025-04-25T10:05:00",
      sender: "Robert Brown",
      actionUrl: "/admin/savings",
    },
  ]);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    return notification.type === activeTab;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Handle marking notification as read
  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      setLoading(false);
      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    }, 500);
  };

  // Handle clearing all notifications
  const handleClearAll = () => {
    setLoading(true);
    setTimeout(() => {
      setNotifications([]);
      setLoading(false);
      toast({
        title: "All notifications cleared",
        description: "All notifications have been cleared.",
      });
    }, 500);
  };

  // Define columns for DataTable
  const columns: Column<Notification>[] = [
    {
      header: "Status",
      accessorKey: "isRead",
      sortable: true,
      cell: (notification) => (
        <div className="flex justify-center">
          {!notification.isRead ? (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">New</Badge>
          ) : (
            <span className="text-muted-foreground">Read</span>
          )}
        </div>
      ),
    },
    {
      header: "Type",
      accessorKey: "type",
      sortable: true,
      cell: (notification) => {
        let badgeClass = "";
        let icon = null;
        
        switch (notification.type) {
          case "system":
            badgeClass = "bg-purple-100 text-purple-800 hover:bg-purple-100";
            break;
          case "user":
            badgeClass = "bg-green-100 text-green-800 hover:bg-green-100";
            break;
          case "action":
            badgeClass = "bg-amber-100 text-amber-800 hover:bg-amber-100";
            break;
        }
        
        return (
          <Badge className={badgeClass}>
            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: "Title",
      accessorKey: "title",
      sortable: true,
      cell: (notification) => (
        <div className="font-medium">
          {notification.title}
        </div>
      ),
    },
    {
      header: "Message",
      accessorKey: "message",
      cell: (notification) => (
        <div className="max-w-md truncate">
          {notification.message}
        </div>
      ),
    },
    {
      header: "Time",
      accessorKey: "timestamp",
      sortable: true,
      cell: (notification) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(notification.timestamp)}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (notification) => (
        <div className="flex space-x-2 justify-end">
          {!notification.isRead && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAsRead(notification.id);
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Mark Read
            </Button>
          )}
          {notification.actionUrl && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={notification.actionUrl}>View</a>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center">
            <Bell className="mr-2 h-6 w-6" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            View and manage all your system notifications
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                You have {notifications.filter(n => !n.isRead).length} unread notifications
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={loading || notifications.every(n => n.isRead)}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Mark All Read
              </Button>
              <Button
                variant="outline"
                onClick={handleClearAll}
                disabled={loading || notifications.length === 0}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as any)}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({notifications.filter(n => !n.isRead).length})
                </TabsTrigger>
                <TabsTrigger value="system">
                  System ({notifications.filter(n => n.type === "system").length})
                </TabsTrigger>
                <TabsTrigger value="user">
                  User ({notifications.filter(n => n.type === "user").length})
                </TabsTrigger>
                <TabsTrigger value="action">
                  Action ({notifications.filter(n => n.type === "action").length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading notifications...</span>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-10">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No notifications found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {activeTab === "all" 
                        ? "You don't have any notifications yet." 
                        : `You don't have any ${activeTab} notifications.`}
                    </p>
                  </div>
                ) : (
                  <DataTable
                    data={filteredNotifications}
                    columns={columns}
                    keyField="id"
                    pagination={true}
                    searchable={true}
                    pageSize={10}
                    pageSizeOptions={[5, 10, 25, 50]}
                    emptyMessage="No notifications found"
                    loading={loading}
                    onRowClick={(notification) => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id);
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
