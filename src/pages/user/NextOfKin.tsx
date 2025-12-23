import React, { useState, useEffect } from 'react';
import UserDashboardLayout from './layout/UserDashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Eye,
  Loader2,
  Phone, 
  Mail, 
  MapPin, 
  User,
  Heart,
  IdCard,
  Calendar
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '@/services/api';
import { format } from 'date-fns';

interface JwtPayload {
  sub: string;
  userId: number;
  role: string;
}

interface NextOfKinMember {
  memberId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  memberNo: string;
}

interface NextOfKin {
  nextOfKinId: number;
  firstName: string;
  lastName: string;
  otherNames: string | null;
  nationalId: string | null;
  gender: string | null;
  address: string | null;
  email: string | null;
  phoneNumber: string | null;
  dob: string | null;
  status: string | null;
  birthCertificateNo: string | null;
  relationship: string;
  nationality: string | null;
  createDate: string;
  lastModified: string | null;
  member: NextOfKinMember;
}

const NextOfKin = () => {
  const [nextOfKinList, setNextOfKinList] = useState<NextOfKin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKin, setSelectedKin] = useState<NextOfKin | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Get user ID from JWT token
  const getUserId = (): number | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.userId;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  };

  // Fetch next of kin list
  const fetchNextOfKin = async () => {
    const userId = getUserId();
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get<NextOfKin[]>(`/api/v1/next-of-kin/member/${userId}`);
      setNextOfKinList(response.data || []);
    } catch (error) {
      console.error('Error fetching next of kin:', error);
      setNextOfKinList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextOfKin();
  }, []);

  const handleView = (kin: NextOfKin) => {
    setSelectedKin(kin);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Next of Kin
          </h1>
          <p className="text-muted-foreground mt-1">
            View your registered next of kin contacts
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Next of Kin</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading...</span>
              </div>
            ) : nextOfKinList.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Next of Kin Found</h3>
                <p className="text-muted-foreground">
                  You have not added any next of kin contacts yet.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>National ID</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nextOfKinList.map((kin) => (
                      <TableRow key={kin.nextOfKinId}>
                        <TableCell className="font-medium">
                          {kin.firstName} {kin.lastName}
                          {kin.otherNames && ` ${kin.otherNames}`}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {kin.relationship}
                          </span>
                        </TableCell>
                        <TableCell>{kin.phoneNumber || 'N/A'}</TableCell>
                        <TableCell>{kin.email || 'N/A'}</TableCell>
                        <TableCell>{kin.nationalId || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(kin)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Next of Kin Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedKin && (
              <div className="space-y-6">
                {/* Header with name and relationship */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold text-primary">
                      {selectedKin.firstName.charAt(0)}{selectedKin.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedKin.firstName} {selectedKin.lastName}
                      {selectedKin.otherNames && ` ${selectedKin.otherNames}`}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span className="capitalize">{selectedKin.relationship}</span>
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedKin.phoneNumber && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone Number</p>
                        <p className="text-sm font-medium">{selectedKin.phoneNumber}</p>
                      </div>
                    </div>
                  )}

                  {selectedKin.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">{selectedKin.email}</p>
                      </div>
                    </div>
                  )}

                  {selectedKin.nationalId && (
                    <div className="flex items-start gap-3">
                      <IdCard className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">National ID</p>
                        <p className="text-sm font-medium">{selectedKin.nationalId}</p>
                      </div>
                    </div>
                  )}

                  {selectedKin.gender && (
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p className="text-sm font-medium">{selectedKin.gender}</p>
                      </div>
                    </div>
                  )}

                  {selectedKin.address && (
                    <div className="flex items-start gap-3 col-span-full">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{selectedKin.address}</p>
                      </div>
                    </div>
                  )}

                  {selectedKin.nationality && (
                    <div className="flex items-start gap-3">
                      <div className="h-4 w-4 text-muted-foreground mt-0.5">🌍</div>
                      <div>
                        <p className="text-xs text-muted-foreground">Nationality</p>
                        <p className="text-sm font-medium">{selectedKin.nationality}</p>
                      </div>
                    </div>
                  )}

                  {selectedKin.dob && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date of Birth</p>
                        <p className="text-sm font-medium">{formatDate(selectedKin.dob)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with dates */}
                <div className="pt-4 border-t text-xs text-muted-foreground">
                  <p>Added on {formatDate(selectedKin.createDate)}</p>
                  {selectedKin.lastModified && (
                    <p>Last updated {formatDate(selectedKin.lastModified)}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </UserDashboardLayout>
  );
};

export default NextOfKin;
