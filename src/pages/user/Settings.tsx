import React from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Moon, Sun, Globe, UserRound, Palette, Lock, Eye } from 'lucide-react';

const Settings = () => {
  return (
    <UserDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">Settings</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Customize your account preferences</p>
          </div>
        </div>
        
        <Tabs defaultValue="appearance" className="mb-4 sm:mb-6">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="appearance" className="text-xs sm:text-sm">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Appearance</span>
              <span className="sm:hidden">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="text-xs sm:text-sm">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Privacy</span>
              <span className="sm:hidden">Privacy</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Theme Settings</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Customize how the dashboard looks for you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Theme</Label>
                      <div className="text-sm text-muted-foreground">
                        Choose between dark and light mode
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sun className="h-5 w-5 text-muted-foreground" />
                      <Switch id="theme-toggle" />
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <Select defaultValue="blue">
                      <SelectTrigger id="accent-color">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="pink">Pink</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="font-size">Font Size</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="font-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Display Options</CardTitle>
                  <CardDescription>Customize what you see in your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-view">Compact View</Label>
                      <div className="text-sm text-muted-foreground">
                        Show more content with less spacing
                      </div>
                    </div>
                    <Switch id="compact-view" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sidebar-collapsed">Auto-collapse Sidebar</Label>
                      <div className="text-sm text-muted-foreground">
                        Automatically collapse sidebar on smaller screens
                      </div>
                    </div>
                    <Switch id="sidebar-collapsed" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="animations">UI Animations</Label>
                      <div className="text-sm text-muted-foreground">
                        Enable animations throughout the interface
                      </div>
                    </div>
                    <Switch id="animations" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Apply Changes</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Notification Settings</CardTitle>
                <CardDescription>Control when and how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive account updates via email
                    </div>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive text alerts for important updates
                    </div>
                  </div>
                  <Switch id="sms-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="transaction-alerts">Transaction Alerts</Label>
                    <div className="text-sm text-muted-foreground">
                      Get notified for all transactions
                    </div>
                  </div>
                  <Switch id="transaction-alerts" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment-reminders">Payment Reminders</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive reminders about upcoming payments
                    </div>
                  </div>
                  <Switch id="payment-reminders" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Marketing Communications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive offers and updates from Toheko SACCO
                    </div>
                  </div>
                  <Switch id="marketing-emails" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Notification Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Privacy & Security</CardTitle>
                <CardDescription>Manage your privacy and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <div className="text-sm text-muted-foreground">
                      Secure your account with 2FA
                    </div>
                  </div>
                  <Switch id="two-factor" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="login-alerts">Login Alerts</Label>
                    <div className="text-sm text-muted-foreground">
                      Get notified of any login attempts
                    </div>
                  </div>
                  <Switch id="login-alerts" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="browser-sessions">Remember Browser Sessions</Label>
                    <div className="text-sm text-muted-foreground">
                      Stay logged in on this device
                    </div>
                  </div>
                  <Switch id="browser-sessions" defaultChecked />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="session-timeout">Session Timeout</Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="session-timeout">
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="never">Never timeout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" /> View Login History
                  </Button>
                  <Button>Save Security Settings</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UserDashboardLayout>
  );
};

export default Settings;
