import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Edit, Trash2, User, Users, X, ChevronLeft, BarChart2, UserCheck, UserX, Clock, UserMinus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { memberService } from "@/services/memberService";
import { nextOfKinService } from "@/services/nextOfKinService";
import { Member, NextOfKin } from "@/types/api";
import { formatDateSafe } from "@/lib/utils";
import NextOfKinManagement from "@/pages/admin/NextOfKinManagement";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const memberFormSchema = z.object({
  memberId: z.number().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  nationalId: z.string().min(1, "National ID is required"),
  address: z.string().min(1, "Address is required"),
  countyCode: z.string().optional(),
  constituencyCode: z.string().optional(),
  wardCode: z.string().optional(),
  nextOfKins: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string().min(1, "Name is required"),
      relationship: z.string().min(1, "Relationship is required"),
      phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
      email: z.string().email("Invalid email").or(z.literal("")),
      address: z.string().optional(),
    })
  ),
});

type MemberFormValues = z.infer<typeof memberFormSchema>;

const Members = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [kpiStats, setKpiStats] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      address: "",
      countyCode: "",
      constituencyCode: "",
      wardCode: "",
      nextOfKins: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "nextOfKins",
  });

  const { data: members, isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: memberService.getAllMembers,
  });

  const memberMutation = useMutation({
    mutationFn: (data: { memberId?: number } & Omit<MemberFormValues, "nextOfKins"> & { dateOfBirth: string; status: string }) =>
      isEditing
        ? memberService.updateMember({
            memberId: data.memberId ?? 0,
            firstName: data.firstName!,
            lastName: data.lastName!,
            email: data.email!,
            phoneNumber: data.phoneNumber!,
            nationalId: data.nationalId!,
            address: data.address!,
            dateOfBirth: data.dateOfBirth,
            status: data.status,
            countyCode: data.countyCode,
            constituencyCode: data.constituencyCode,
            wardCode: data.wardCode
          })
        : memberService.createMember({
            memberId: 0,
            firstName: data.firstName!,
            lastName: data.lastName!,
            email: data.email!,
            phoneNumber: data.phoneNumber!,
            nationalId: data.nationalId!,
            address: data.address!,
            dateOfBirth: data.dateOfBirth,
            status: data.status,
            countyCode: data.countyCode,
            constituencyCode: data.constituencyCode,
            wardCode: data.wardCode
          }),
    onSuccess: (data) => {
      if (!isEditing) {
        form.setValue("memberId", data.id);
      }
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({
        title: "Success",
        description: "Member details saved successfully",
      });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save member",
        variant: "destructive",
      });
    },
  });

  const handleAddMember = () => {
    form.reset({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      address: "",
      countyCode: "",
      constituencyCode: "",
      wardCode: "",
      nextOfKins: [],
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditMember = (member: Member) => {
    form.reset({
      ...member,
      countyCode: member.countyCode || "",
      constituencyCode: member.constituencyCode || "",
      wardCode: member.wardCode || "",
      nextOfKins: member.nextOfKins || [],
    });
    setIsEditing(true);
    setShowForm(true);
    
    // Fetch location data if editing
    if (member.countyCode) {
      fetchConstituencies(member.countyCode);
    }
    if (member.constituencyCode) {
      fetchWards(member.constituencyCode);
    }
  };

  const onSubmitMember = (values: Omit<MemberFormValues, "nextOfKins">) => {
    memberMutation.mutate({
      ...values,
      dateOfBirth: (values as any).dateOfBirth || "",
      status: (values as any).status || "ACTIVE",
    });
  };

  const removeNextOfKin = (index: number) => {
    remove(index);
  };

  const columns = [
    { header: "ID", accessorKey: "memberId" },
    {
      header: "Name",
      accessorKey: "firstName",
      cell: (row: any) => `${row.firstName} ${row.lastName}`
    },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phoneNumber" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => (
        <Badge
          variant={row.status === "ACTIVE" ? "default" : row.status === "SUSPENDED" ? "destructive" : "secondary"}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Created",
      accessorKey: "createDate",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span>{formatDateSafe(row.createdAt, "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {formatDateSafe(row.createdAt, "hh:mm a")}
          </span>
        </div>
      ),
    },
    {
      header: "Last Updated",
      accessorKey: "lastModified",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span>{formatDateSafe(row.updatedAt, "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {formatDateSafe(row.updatedAt, "hh:mm a")}
          </span>
        </div>
      ),
    },
    { 
      header: "County", 
      accessorKey: "countyCode",
      cell: (row: any) => row.countyCode
        ? counties.find((c) => c.countyCode === row.countyCode)?.name || row.countyCode
        : "--"
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: any) => (
        <TooltipProvider>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => handleEditMember(row)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit member details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => openNextOfKinModal(row.memberId)}>
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage next of kin</p>
              </TooltipContent>
            </Tooltip>

            {((row.status || "").toString().toUpperCase() === "ACTIVE" || (row.status || "").toString().toUpperCase() === "PENDING") ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openActionDialog(row, "suspend")}
                  >
                    Suspend
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Suspend this member</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => openActionDialog(row, "reactivate")}
                  >
                    Reactivate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reactivate this member</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      ),
    },
  ];

  // Suspend / Reactivate action dialog state
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState<"suspend" | "reactivate" | null>(null);
  const [actionMember, setActionMember] = useState<Member | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const openActionDialog = (member: Member, type: "suspend" | "reactivate") => {
    setActionMember(member);
    setActionType(type);
    setActionReason("");
    setShowActionDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!actionMember || !actionType) return;
    if (!actionReason.trim()) {
      toast({ title: "Error", description: "Please provide a reason", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      let res: any;
      if (actionType === "suspend") {
        res = await memberService.suspendMember(actionMember.memberId, { reason: actionReason });
      } else {
        res = await memberService.reactivateMember({ memmberId: actionMember.memberId, activationReason: actionReason });
      }

      const respCode = res?.responseCode ?? res?.code ?? (res?.status ? String(res.status) : undefined);
      const isSuccess = respCode === "200" || respCode === 200 || respCode === "201" || respCode === 201;

      if (isSuccess) {
        queryClient.invalidateQueries({ queryKey: ["members"] });
        toast({ title: "Success", description: res?.message || (actionType === "suspend" ? "Member suspended" : "Member reactivated") });
        setShowActionDialog(false);
        setActionMember(null);
        setActionType(null);
        setActionReason("");
      } else {
        toast({ title: "Error", description: res?.message || "Action failed", variant: "destructive" });
      }
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message || "Action failed";
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  // Next of Kin modal state
  const [showNextOfKinModal, setShowNextOfKinModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const openNextOfKinModal = (memberId: number) => {
    setSelectedMemberId(memberId);
    setShowNextOfKinModal(true);
  };

  const closeNextOfKinModal = () => {
    setSelectedMemberId(null);
    setShowNextOfKinModal(false);
  };

  useEffect(() => {
    const fetchKpiStats = async () => {
      try {
        const data = await memberService.getMemberKpiStats();
        setKpiStats(data);
      } catch (error) {
        console.error("Error fetching KPI stats:", error);
      }
    };
    fetchKpiStats();
  }, []);

  // Location lists / loading
  const [counties, setCounties] = useState<{ countyCode: string; name: string }[]>([]);
  const [constituencies, setConstituencies] = useState<{ constituencyCode: string; name: string }[]>([]);
  const [wards, setWards] = useState<{ cawCode: string; name: string }[]>([]);
  const [loadingCounties, setLoadingCounties] = useState(false);
  const [loadingConstituencies, setLoadingConstituencies] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const LOC_PAGE_SIZE = 100;

  const fetchCounties = async () => {
    try {
      setLoadingCounties(true);
      const res: any = await memberService.getCounties?.(0, LOC_PAGE_SIZE) ?? await memberService.getLocationCounties?.({ page: 0, size: LOC_PAGE_SIZE });
      const json = res?.data ?? res ?? {};
      setCounties(Array.isArray(json.content) ? json.content : (json.content ?? []));
    } catch (e) {
      console.error("fetchCounties error", e);
      setCounties([]);
    } finally {
      setLoadingCounties(false);
    }
  };

  const fetchConstituencies = async (countyCode?: string | null) => {
    if (!countyCode) {
      setConstituencies([]);
      return;
    }
    try {
      setLoadingConstituencies(true);
      const res: any = await memberService.getConstituencies?.(countyCode, 0, LOC_PAGE_SIZE) ?? await memberService.getLocationConstituencies?.(countyCode);
      const json = res?.data ?? res ?? {};
      setConstituencies(Array.isArray(json.content) ? json.content : (json.content ?? []));
    } catch (e) {
      console.error("fetchConstituencies error", e);
      setConstituencies([]);
    } finally {
      setLoadingConstituencies(false);
    }
  };

  const fetchWards = async (constituencyCode?: string | null) => {
    if (!constituencyCode) {
      setWards([]);
      return;
    }
    try {
      setLoadingWards(true);
      const res: any = await memberService.getWards?.(constituencyCode, 0, LOC_PAGE_SIZE) ?? await memberService.getLocationWards?.(constituencyCode);
      const json = res?.data ?? res ?? {};
      setWards(Array.isArray(json.content) ? json.content : (json.content ?? []));
    } catch (e) {
      console.error("fetchWards error", e);
      setWards([]);
    } finally {
      setLoadingWards(false);
    }
  };

  useEffect(() => {
    fetchCounties();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <BarChart2 className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-lg font-bold">{kpiStats?.totalMembers ?? "--"}</div>
              <div className="text-xs text-blue-700">Total Members</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <UserCheck className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-lg font-bold">{kpiStats?.activeMembers ?? "--"}</div>
              <div className="text-xs text-green-700">Active Members</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-lg font-bold">{kpiStats?.pendingMembers ?? "--"}</div>
              <div className="text-xs text-yellow-700">Pending Members</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-50 to-red-100 shadow-sm">
          <CardContent className="flex items-center gap-3 py-4">
            <UserMinus className="h-8 w-8 text-red-500" />
            <div>
              <div className="text-lg font-bold">{kpiStats?.suspendedMembers ?? "--"}</div>
              <div className="text-xs text-red-700">Suspended Members</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">Members</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Manage SACCO members and their next of kin
            </CardDescription>
          </div>
          <Button onClick={handleAddMember} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={members || []}
              columns={columns}
              keyField="memberId"
              emptyMessage="No members found"
            />
          )}
        </CardContent>
      </Card>

      {/* Member Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Member" : "Add New Member"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <div className="space-y-6 pt-2">
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nationalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>National ID</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <FormField control={form.control} name="countyCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>County</FormLabel>
                      <FormControl>
                        <Select value={field.value ?? ""} onValueChange={(val) => {
                          field.onChange(val || undefined);
                          form.setValue("constituencyCode", undefined);
                          form.setValue("wardCode", undefined);
                          setConstituencies([]);
                          setWards([]);
                          if (val) fetchConstituencies(val);
                        }}>
                          <SelectTrigger className="w-full" disabled={loadingCounties}>
                            <SelectValue placeholder={loadingCounties ? "Loading..." : "Select county"} />
                          </SelectTrigger>
                          <SelectContent>
                            {counties.map(c => <SelectItem key={c.countyCode} value={c.countyCode}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="constituencyCode" render={({ field }) => {
                    const countySelected = !!form.getValues().countyCode;
                    return (
                      <FormItem>
                        <FormLabel>Constituency</FormLabel>
                        <FormControl>
                          <Select value={field.value ?? ""} onValueChange={(val) => {
                            field.onChange(val || undefined);
                            form.setValue("wardCode", undefined);
                            setWards([]);
                            if (val) fetchWards(val);
                          }}>
                            <SelectTrigger className="w-full" disabled={!countySelected || loadingConstituencies}>
                              <SelectValue placeholder={!countySelected ? "Select county first" : (loadingConstituencies ? "Loading..." : "Select constituency")} />
                            </SelectTrigger>
                            <SelectContent>
                              {constituencies.map(c => <SelectItem key={c.constituencyCode} value={c.constituencyCode}>{c.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }} />

                  <FormField control={form.control} name="wardCode" render={({ field }) => {
                    const constituencySelected = !!form.getValues().constituencyCode;
                    return (
                      <FormItem>
                        <FormLabel>Ward</FormLabel>
                        <FormControl>
                          <Select value={field.value ?? ""} onValueChange={(val) => field.onChange(val || undefined)}>
                            <SelectTrigger className="w-full" disabled={!constituencySelected || loadingWards}>
                              <SelectValue placeholder={!constituencySelected ? "Select constituency first" : (loadingWards ? "Loading..." : "Select ward")} />
                            </SelectTrigger>
                            <SelectContent>
                              {wards.map(w => <SelectItem key={w.cawCode} value={w.cawCode}>{w.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }} />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmitMember)}
                  disabled={memberMutation.isPending}
                >
                  {memberMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Update Member" : "Save Member Details"}
                </Button>
                {isEditing && (
                  <Button
                    type="button"
                    onClick={() => {
                      const id = form.getValues().memberId;
                      if (id) {
                        setShowForm(false);
                        openNextOfKinModal(Number(id));
                      } else {
                        toast({ title: "Error", description: "Member ID missing", variant: "destructive" });
                      }
                    }}
                  >
                    Edit Next of Kin
                  </Button>
                )}
              </DialogFooter>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Suspend / Reactivate Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="sm:max-w-[400px] max-w-full">
          <DialogHeader>
            <DialogTitle>
              {actionType === "suspend" ? "Suspend Member" : "Reactivate Member"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {actionType === "suspend"
                ? "Suspending a member will deactivate their account. You can reactivate it later."
                : "Reactivating a member will restore their account access."}
            </p>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={4}
                placeholder="Enter reason here..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setShowActionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              variant={actionType === "suspend" ? "destructive" : "default"}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "suspend" ? "Suspend Member" : "Reactivate Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Next of Kin modal */}
      {showNextOfKinModal && selectedMemberId != null && (
        <NextOfKinManagement
          open={showNextOfKinModal}
          memberId={selectedMemberId}
          onClose={closeNextOfKinModal}
        />
      )}
    </div>
  );
};

export default Members;