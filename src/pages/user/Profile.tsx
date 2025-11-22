import React, { useState, useEffect } from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, MapPin, FileEdit, KeyRound, Bell, Loader2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { userMemberService, MemberDetails } from '@/services/user-services/userMemberService';
import { toast } from '@/components/ui/sonner';

// JWT token interface
interface TohekoJwtPayload {
  sub: string;
  userId: number;
  role: string;
  exp?: number;
  iat?: number;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [memberData, setMemberData] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user ID from JWT token
  const getUserId = (): number | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode<TohekoJwtPayload>(token);
      return decoded.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch member data on component mount
  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          setError('User session not found');
          setLoading(false);
          return;
        }

        const data = await userMemberService.getMemberDetails(userId);
        setMemberData(data);
      } catch (err) {
        console.error('Error fetching member data:', err);
        setError('Failed to load profile data');
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, []);

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </UserDashboardLayout>
    );
  }

  if (error || !memberData) {
    return (
      <UserDashboardLayout>
        <div className="text-center py-10">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Unable to load profile</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error || 'No data available'}</p>
        </div>
      </UserDashboardLayout>
    );
  }

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
                        {memberData.firstName?.[0]}{memberData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-base sm:text-lg">{memberData.firstName} {memberData.lastName}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline" className={
                      memberData.status === 'ACTIVE'
                        ? "bg-green-50 text-green-700 border-green-200"
                        : memberData.status === 'PENDING'
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }>
                      {memberData.status}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4 opacity-70" />
                      <span>{memberData.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4 opacity-70" />
                      <span>{memberData.phoneNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4 opacity-70" />
                      <span>Member since {new Date(memberData.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <User className="h-4 w-4 opacity-70" />
                      <span>{memberData.memberNo}</span>
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
                        defaultValue={memberData.firstName || ''}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        defaultValue={memberData.lastName || ''}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        defaultValue={memberData.email || ''}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        defaultValue={memberData.phoneNumber || ''}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number</Label>
                      <Input
                        id="idNumber"
                        defaultValue={memberData.nationalId || ''}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        defaultValue={memberData.address || ''}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        defaultValue={memberData.gender || ''}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        defaultValue={memberData.dob ? new Date(memberData.dob).toLocaleDateString() : ''}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={isEditing ? "flex justify-end pt-4 border-t" : "hidden"}>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
              
              {/* Additional Information */}
              <Card className="md:col-span-3 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Additional Information
                  </CardTitle>
                  <CardDescription>Other member details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        defaultValue={memberData.position || ''}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="otherNames">Other Names</Label>
                      <Input
                        id="otherNames"
                        defaultValue={memberData.otherNames || ''}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberNo">Member Number</Label>
                      <Input
                        id="memberNo"
                        defaultValue={memberData.memberNo || ''}
                        disabled={true}
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
