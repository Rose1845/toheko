import React from 'react';
import LoaneeDashboardLayout from './layout/LoaneeDashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Moon, Sun, Palette, Lock, Eye, Smartphone, Mail } from 'lucide-react';

const LoaneeSettings = () => {
  return (
    <LoaneeDashboardLayout>
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
                      <Label className="text-sm">Theme</Label>
                      <div className="text-xs text-muted-foreground">
                        Choose between dark and light mode
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <Switch id="theme-toggle" />
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="accent-color" className="text-sm">Accent Color</Label>
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
                    <Label htmlFor="font-size" className="text-sm">Font Size</Label>
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
                  <Button size="sm">Save Preferences</Button>
                </CardFooter>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Display Options</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Configure how information is displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Compact Mode</Label>
                      <div className="text-xs text-muted-foreground">
                        Show more content with less spacing
                      </div>
                    </div>
                    <Switch id="compact-mode" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Show Animations</Label>
                      <div className="text-xs text-muted-foreground">
                        Enable UI animations and transitions
                      </div>
                    </div>
                    <Switch id="animations" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Notification Preferences</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Choose how you want to be notified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <Label className="text-sm">Email Notifications</Label>
                        <div className="text-xs text-muted-foreground">
                          Receive updates via email
                        </div>
                      </div>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <Label className="text-sm">SMS Notifications</Label>
                        <div className="text-xs text-muted-foreground">
                          Receive updates via SMS
                        </div>
                      </div>
                    </div>
                    <Switch id="sms-notifications" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <Label className="text-sm">Push Notifications</Label>
                        <div className="text-xs text-muted-foreground">
                          Browser push notifications
                        </div>
                      </div>
                    </div>
                    <Switch id="push-notifications" defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Save Preferences</Button>
                </CardFooter>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Notification Types</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Select which notifications to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Application Updates</Label>
                    <Switch id="app-updates" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Loan Approvals</Label>
                    <Switch id="loan-approvals" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Payment Reminders</Label>
                    <Switch id="payment-reminders" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Promotional Offers</Label>
                    <Switch id="promotional" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Privacy Settings</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Control your privacy preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <Label className="text-sm">Profile Visibility</Label>
                        <div className="text-xs text-muted-foreground">
                          Make profile visible to others
                        </div>
                      </div>
                    </div>
                    <Switch id="profile-visibility" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <Label className="text-sm">Two-Factor Authentication</Label>
                        <div className="text-xs text-muted-foreground">
                          Add extra security to your account
                        </div>
                      </div>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Save Settings</Button>
                </CardFooter>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Data & Privacy</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Manage your data preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Activity Tracking</Label>
                    <Switch id="activity-tracking" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Analytics Cookies</Label>
                    <Switch id="analytics" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Marketing Cookies</Label>
                    <Switch id="marketing" />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="w-full">Download My Data</Button>
                  <Button variant="destructive" size="sm" className="w-full">Delete Account</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LoaneeDashboardLayout>
  );
};

export default LoaneeSettings;
