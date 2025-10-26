import React, { useState } from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, MapPin, FileEdit, KeyRound, Bell } from 'lucide-react';

// Dummy profile data
const dummyProfile = {
  firstName: 'John',
  lastName: 'Mwangi',
  email: 'john.mwangi@example.com',
  phone: '+254 712 345 678',
  memberSince: '2022-05-10',
  membershipNumber: 'TH-20220510-001',
  idNumber: '12345678',
  address: '123 Moi Avenue',
  city: 'Nairobi',
  postalCode: '00100',
  occupation: 'Software Developer',
  employer: 'Tech Solutions Ltd',
  employmentStatus: 'Full-time',
  nextOfKin: 'Jane Mwangi',
  nextOfKinRelation: 'Spouse',
  nextOfKinContact: '+254 723 456 789'
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <UserDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">My Profile</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">View and update your personal information</p>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 text-sm w-full sm:w-auto"
          >
            {isEditing ? (
              <>Cancel Editing</>
            ) : (
              <>
                <FileEdit className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
        
        <Tabs defaultValue="personal" className="mb-4 sm:mb-6">
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Personal Info</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm">
              <KeyRound className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Member Profile Card */}
              <Card className="lg:col-span-1 shadow-sm">
                <CardHeader className="pb-2 text-center">
                  <div className="flex justify-center mb-2">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xl sm:text-2xl bg-primary/10 text-primary">
                        {dummyProfile.firstName[0]}{dummyProfile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-base sm:text-lg">{dummyProfile.firstName} {dummyProfile.lastName}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Active Member
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4 opacity-70" />
                      <span>{dummyProfile.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4 opacity-70" />
                      <span>{dummyProfile.phone}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 opacity-70" />
                      <span>Member since {new Date(dummyProfile.memberSince).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4 opacity-70" />
                      <span>{dummyProfile.membershipNumber}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Personal Details */}
              <Card className="md:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" /> Personal Details
                  </CardTitle>
                  <CardDescription>Your personal and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        defaultValue={dummyProfile.firstName} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        defaultValue={dummyProfile.lastName} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        defaultValue={dummyProfile.email} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        defaultValue={dummyProfile.phone} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number</Label>
                      <Input 
                        id="idNumber" 
                        defaultValue={dummyProfile.idNumber} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address" 
                        defaultValue={dummyProfile.address} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        defaultValue={dummyProfile.city} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input 
                        id="postalCode" 
                        defaultValue={dummyProfile.postalCode} 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={isEditing ? "flex justify-end pt-4 border-t" : "hidden"}>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
              
              {/* Employment Information */}
              <Card className="md:col-span-3 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Employment Information
                  </CardTitle>
                  <CardDescription>Your occupation and employer details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input 
                        id="occupation" 
                        defaultValue={dummyProfile.occupation} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employer">Employer</Label>
                      <Input 
                        id="employer" 
                        defaultValue={dummyProfile.employer} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employmentStatus">Employment Status</Label>
                      <Input 
                        id="employmentStatus" 
                        defaultValue={dummyProfile.employmentStatus} 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={isEditing ? "flex justify-end pt-4 border-t" : "hidden"}>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
              
              {/* Next of Kin */}
              <Card className="md:col-span-3 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" /> Next of Kin
                  </CardTitle>
                  <CardDescription>Your emergency contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="nextOfKin">Full Name</Label>
                      <Input 
                        id="nextOfKin" 
                        defaultValue={dummyProfile.nextOfKin} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinRelation">Relationship</Label>
                      <Input 
                        id="nextOfKinRelation" 
                        defaultValue={dummyProfile.nextOfKinRelation} 
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextOfKinContact">Contact</Label>
                      <Input 
                        id="nextOfKinContact" 
                        defaultValue={dummyProfile.nextOfKinContact} 
                        disabled={!isEditing} 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={isEditing ? "flex justify-end pt-4 border-t" : "hidden"}>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <KeyRound className="h-5 w-5" /> Security Settings
                </CardTitle>
                <CardDescription>Manage your account security and password</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Update Password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" /> Notification Preferences
                </CardTitle>
                <CardDescription>Manage how you receive updates and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="emailNotifications" defaultChecked />
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="smsNotifications" defaultChecked />
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="pushNotifications" />
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="marketingEmails" />
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UserDashboardLayout>
  );
};

export default Profile;
