import React, { useState, useEffect } from 'react';
import LoaneeDashboardLayout from './layout/LoaneeDashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Calendar, MapPin, FileEdit, KeyRound, Loader2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { toast } from '@/components/ui/sonner';

// JWT token interface
interface TohekoJwtPayload {
  sub: string;
  userId: number;
  role: string;
  exp?: number;
  iat?: number;
}

// Loanee profile interface
interface LoaneeProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  idNumber?: string;
}

const LoaneeProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<LoaneeProfile | null>(null);

  // Get user info from JWT token
  const getUserInfo = (): { userId: number; email: string } | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded = jwtDecode<TohekoJwtPayload>(token);
      return {
        userId: decoded.userId,
        email: decoded.sub
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userInfo = getUserInfo();
        if (!userInfo) {
          setError('User session not found');
          setLoading(false);
          return;
        }

        // For loanees, we'll use the email from token as basic profile info
        // In a real app, you'd fetch from an API endpoint
        setProfileData({
          id: userInfo.userId,
          firstName: 'Loanee',
          lastName: 'User',
          email: userInfo.email,
          phoneNumber: '',
          address: '',
          occupation: ''
        });
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <LoaneeDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </LoaneeDashboardLayout>
    );
  }

  if (error || !profileData) {
    return (
      <LoaneeDashboardLayout>
        <div className="text-center py-10">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Unable to load profile</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error || 'No data available'}</p>
        </div>
      </LoaneeDashboardLayout>
    );
  }

  return (
    <LoaneeDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">My Profile</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">View and update your personal information</p>
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="w-full sm:w-auto"
          >
            {isEditing ? (
              <>Save Changes</>
            ) : (
              <><FileEdit className="mr-2 h-4 w-4" /> Edit Profile</>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Overview Card */}
          <Card className="lg:col-span-1 shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary/20">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback className="text-xl sm:text-2xl bg-primary/10 text-primary">
                    {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="mt-4 text-base sm:text-lg">
                {profileData.firstName} {profileData.lastName}
              </CardTitle>
              <CardDescription className="text-xs">Loanee Account</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                LOANEE
              </Badge>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{profileData.email}</span>
                </div>
                {profileData.phoneNumber && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{profileData.phoneNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg">Profile Details</CardTitle>
              <CardDescription className="text-xs">Your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="personal" className="text-xs sm:text-sm">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="security" className="text-xs sm:text-sm">
                    <KeyRound className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Security
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        disabled={!isEditing}
                        className="text-sm"
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        disabled={!isEditing}
                        className="text-sm"
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled
                        className="text-sm bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phoneNumber}
                        disabled={!isEditing}
                        className="text-sm"
                        onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address" className="text-xs">Address</Label>
                      <Input
                        id="address"
                        value={profileData.address || ''}
                        disabled={!isEditing}
                        className="text-sm"
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occupation" className="text-xs">Occupation</Label>
                      <Input
                        id="occupation"
                        value={profileData.occupation || ''}
                        disabled={!isEditing}
                        className="text-sm"
                        onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idNumber" className="text-xs">ID Number</Label>
                      <Input
                        id="idNumber"
                        value={profileData.idNumber || ''}
                        disabled={!isEditing}
                        className="text-sm"
                        onChange={(e) => setProfileData({...profileData, idNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Change Password</CardTitle>
                      <CardDescription className="text-xs">
                        Update your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
                        <Input id="currentPassword" type="password" className="text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                        <Input id="newPassword" type="password" className="text-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-xs">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" className="text-sm" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm">Update Password</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </LoaneeDashboardLayout>
  );
};

export default LoaneeProfile;
