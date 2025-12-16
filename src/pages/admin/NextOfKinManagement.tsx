import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nextOfKinService } from "@/services/nextOfKinService";
import { memberService } from "@/services/memberService";
import { NextOfKin, NextOfKinRequestDTO, Member } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, UserPlus, Loader2, Users, Trash2, AlertTriangle } from "lucide-react";

const formatPhoneNumber = (phone: string): string => {
  const cleaned = (phone || "").replace(/\D/g, "");
  if (cleaned.startsWith("07") || cleaned.startsWith("01")) return `254${cleaned.substring(1)}`;
  return cleaned;
};

const nextOfKinFormSchema = z.object({
  memberId: z.number({ required_error: "Member is required" }).min(1, "Please select a member"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  otherNames: z.string().optional(),
  nationalId: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"], { required_error: "Gender is required" }),
  address: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z
    .string()
    .optional()
    .refine((value) => {
      const cleaned = value.replace(/\D/g, "");
      return cleaned.length === 10 || cleaned.length === 12;
    }, { message: "Phone number must be 10 digits (07...) or 12 digits (254...)" }),
  dob: z.string().optional(),
  birthCertificateNo: z.string().optional(),
  relationship: z.string().min(2, "Relationship must be at least 2 characters"),
  nationality: z.string().optional(),
});

type NextOfKinFormValues = z.infer<typeof nextOfKinFormSchema>;

type Props = {
  open: boolean;
  memberId: number | null;
  onClose: () => void;
};

const NextOfKinManagement: React.FC<Props> = ({ open, memberId, onClose }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedNextOfKin, setSelectedNextOfKin] = useState<NextOfKin | null>(null);
  const [nextOfKinToDelete, setNextOfKinToDelete] = useState<NextOfKin | null>(null);
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [existingNextOfKinsForMember, setExistingNextOfKinsForMember] = useState<NextOfKin[]>([]);
  const [existingLoading, setExistingLoading] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NextOfKinFormValues>({
    resolver: zodResolver(nextOfKinFormSchema),
    defaultValues: {
      memberId: 0,
      firstName: "",
      lastName: "",
      otherNames: "",
      nationalId: "",
      gender: "Male",
      address: "",
      email: "",
      phoneNumber: "",
      dob: "",
      birthCertificateNo: "",
      relationship: "",
      nationality: "",
    },
  });

  const { data: members } = useQuery<Member[]>({
    queryKey: ["members"],
    queryFn: memberService.getAllMembers,
  });

  const fetchExistingNextOfKins = async (mId: number | null) => {
    if (!mId || mId <= 0) {
      setExistingNextOfKinsForMember([]);
      return;
    }
    try {
      setExistingLoading(true);
      const list = await nextOfKinService.getNextOfKinsByMember(mId);
      setExistingNextOfKinsForMember(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch existing next of kin", err);
      setExistingNextOfKinsForMember([]);
    } finally {
      setExistingLoading(false);
    }
  };

  useEffect(() => {
    if (open && memberId && memberId > 0) {
      form.reset({ ...form.getValues(), memberId });
      fetchExistingNextOfKins(memberId);
    } else if (!open) {
      setShowEditForm(false);
      setShowDeleteConfirm(false);
      setSelectedNextOfKin(null);
      setExistingNextOfKinsForMember([]);
      form.reset();
    }
  }, [open, memberId]);

  const createMutation = useMutation({
    mutationFn: (data: NextOfKinRequestDTO) => nextOfKinService.createNextOfKin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nextOfKins"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      if (form.getValues().memberId) fetchExistingNextOfKins(form.getValues().memberId);
      toast({ title: "Success", description: "Next of kin added successfully." });
      form.reset({ ...form.getValues(), firstName: "", lastName: "", otherNames: "", nationalId: "", email: "", phoneNumber: "", relationship: "", address: "", gender: "Male" });
    },
    onError: (error: any) => {
      console.error("Error creating next of kin:", error);
      toast({ title: "Error", description: error.response?.data?.message || "Failed to add next of kin.", variant: "destructive" });
    },
    onSettled: () => setIsAddLoading(false),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: NextOfKinRequestDTO }) => nextOfKinService.updateNextOfKin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nextOfKins"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      if (form.getValues().memberId) fetchExistingNextOfKins(form.getValues().memberId);
      toast({ title: "Success", description: "Next of kin updated successfully." });
      setShowEditForm(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error("Error updating next of kin:", error);
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update next of kin.", variant: "destructive" });
    },
    onSettled: () => setIsEditLoading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => nextOfKinService.deleteNextOfKin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nextOfKins"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      if (form.getValues().memberId) fetchExistingNextOfKins(form.getValues().memberId);
      toast({ title: "Success", description: "Next of kin deleted successfully." });
      setShowDeleteConfirm(false);
      setNextOfKinToDelete(null);
    },
    onError: (error: any) => {
      console.error("Error deleting next of kin:", error);
      toast({ title: "Error", description: error.response?.data?.message || "Failed to delete next of kin.", variant: "destructive" });
    },
    onSettled: () => setIsDeleteLoading(false),
  });

  const handleEditNextOfKin = (nextOfKin: NextOfKin) => {
    form.reset({
      memberId: nextOfKin.member?.memberId || memberId || 0,
      firstName: nextOfKin.firstName || "",
      lastName: nextOfKin.lastName || "",
      otherNames: nextOfKin.otherNames || "",
      nationalId: nextOfKin.nationalId || "",
      gender: (nextOfKin.gender as "Male" | "Female" | "Other") || "Male",
      address: nextOfKin.address || "",
      email: nextOfKin.email || "",
      phoneNumber: nextOfKin.phoneNumber || "",
      dob: nextOfKin.dob || "",
      birthCertificateNo: nextOfKin.birthCertificateNo || "",
      relationship: nextOfKin.relationship || "",
      nationality: nextOfKin.nationality || "",
    });
    setSelectedNextOfKin(nextOfKin);
    setShowEditForm(true);
  };

  const handleConfirmDelete = (nextOfKin: NextOfKin) => {
    setNextOfKinToDelete(nextOfKin);
    setShowDeleteConfirm(true);
  };

  const handleDeleteNextOfKin = async () => {
    if (!nextOfKinToDelete) return;
    setIsDeleteLoading(true);
    deleteMutation.mutate(nextOfKinToDelete.nextOfKinId);
  };

  const onSubmitAdd = async (values: NextOfKinFormValues) => {
    setIsAddLoading(true);
    const formattedPhone = formatPhoneNumber(values.phoneNumber);
    const nextOfKinRequest: NextOfKinRequestDTO = {
      memberId: values.memberId,
      firstName: values.firstName,
      lastName: values.lastName,
      nationalId: values.nationalId,
      gender: values.gender,
      address: values.address,
      email: values.email,
      phoneNumber: formattedPhone,
      relationship: values.relationship,
    };
    createMutation.mutate(nextOfKinRequest);
  };

  const onSubmitEdit = async (values: NextOfKinFormValues) => {
    if (!selectedNextOfKin) return;
    setIsEditLoading(true);
    const formattedPhone = formatPhoneNumber(values.phoneNumber);
    const nextOfKinRequest: NextOfKinRequestDTO = {
      memberId: values.memberId,
      firstName: values.firstName,
      lastName: values.lastName,
      otherNames: values.otherNames || undefined,
      nationalId: values.nationalId,
      gender: values.gender,
      address: values.address,
      email: values.email,
      phoneNumber: formattedPhone,
      relationship: values.relationship,
    };
    updateMutation.mutate({ id: selectedNextOfKin.nextOfKinId, data: nextOfKinRequest });
  };

  return (
    <>
      {/* Main Add/List Modal */}
      <Dialog open={open && !showEditForm} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-[700px] bg-white p-6 rounded-lg shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              Manage Next of Kin
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-1">
              View and manage next of kin for this member
            </DialogDescription>
          </DialogHeader>

          {existingLoading ? (
            <div className="py-8 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading next of kin...</span>
            </div>
          ) : (
            <>
              {existingNextOfKinsForMember.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Existing Next of Kin</h4>
                  <div className="space-y-2">
                    {existingNextOfKinsForMember.map((nok) => (
                      <div key={nok.nextOfKinId} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{`${(nok.firstName || "")} ${(nok.lastName || "")}`.trim() || "Unnamed"}</div>
                          <div className="text-xs text-muted-foreground mt-1">{nok.relationship || "-"}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-xs mr-2">
                            <div>{nok.phoneNumber || "-"}</div>
                            <div className="text-muted-foreground">{nok.email || "-"}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditNextOfKin(nok)} 
                              className="h-8 px-2"
                            >
                              <Edit className="h-4 w-4 mr-1" />Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleConfirmDelete(nok)} 
                              className="h-8 px-2"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Next of Kin</h4>
                <Form {...form}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">First Name</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="relationship" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Relationship</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                          <FormControl><Input {...field} placeholder="07xxxxxxxx" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Email</FormLabel>
                          <FormControl><Input type="email" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="nationalId" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">National ID</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Gender</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="nationality" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Nationality</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Address</FormLabel>
                        <FormControl><Textarea {...field} rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <DialogFooter className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={onClose}>Close</Button>
                      <Button onClick={form.handleSubmit(onSubmitAdd)} disabled={isAddLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isAddLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : <><UserPlus className="mr-2 h-4 w-4" />Add Next of Kin</>}
                      </Button>
                    </DialogFooter>
                  </div>
                </Form>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center">
              <Edit className="h-6 w-6 text-blue-600 mr-2" />Edit Next of Kin
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="relationship" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nationalId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>National ID</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nationality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Textarea {...field} rows={3} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditForm(false)}>Cancel</Button>
                <Button onClick={form.handleSubmit(onSubmitEdit)} disabled={isEditLoading}>
                  {isEditLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{nextOfKinToDelete ? `${nextOfKinToDelete.firstName} ${nextOfKinToDelete.lastName}` : ""}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setNextOfKinToDelete(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteNextOfKin} disabled={isDeleteLoading}>
              {isDeleteLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : <><Trash2 className="h-4 w-4 mr-2" />Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NextOfKinManagement;