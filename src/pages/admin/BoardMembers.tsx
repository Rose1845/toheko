import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Trash, Plus, Loader2, Users } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "./DashboardLayout";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BoardMember, BoardMemberRequest } from "@/types/api";
import { boardMemberService } from "@/services/boardMemberService";
import { memberService } from "@/services/memberService";

// Form schema for validation
const formSchema = z.object({
  id: z.number().optional(),
  memberId: z.coerce.number().min(1, "Member ID is required"),
  position: z.string().min(2, "Position is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "SUSPENDED"]),
});

type FormValues = z.infer<typeof formSchema>;

const BoardMembers = () => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(
    null
  );
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memberId: 0,
      position: "",
      startDate: "",
      endDate: "",
      status: "ACTIVE",
    },
  });

  // Fetch board members with query parameters
  const {
    data: boardMembers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["boardMembers"],
    queryFn: async () => {
      try {
        return await boardMemberService.getAllBoardMembers();
      } catch (error) {
        console.error("Failed to fetch board members:", error);
        return [] as BoardMember[];
      }
    },
  });

  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: memberService.getAllMembers,
  });

  const enrichedBoardMembers = useMemo(() => {
    if (!boardMembers || !members) return [];
    return boardMembers.map((bm) => {
      const member = members.find((m) => m.memberId === bm.memberId);
      return {
        ...bm,
        fullName: member
          ? `${member.firstName} ${member.lastName}`
          : "Unknown Member",
      };
    });
  }, [boardMembers, members]);

  const handleAddNew = () => {
    form.reset({
      id: undefined,
      memberId: 0,
      position: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      status: "ACTIVE",
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (member: BoardMember) => {
    form.reset({
      id: member.id,
      memberId: member.memberId,
      position: member.position,
      startDate: member.createDate ? member.createDate.split(' ')[0] : new Date().toISOString().split("T")[0],
      endDate: member.endDate || "",
      status: member.status,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = (member: BoardMember) => {
    setSelectedMember(member);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;

    try {
      await boardMemberService.deleteBoardMember(selectedMember.id);
      toast({
        title: "Success",
        description: "Board member deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting board member:", error);
      toast({
        title: "Error",
        description: "Failed to delete board member",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedMember(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const boardMemberData: BoardMemberRequest = {
        id: values.id || 0,
        memberId: values.memberId,
        position: values.position,
        createdAt: values.startDate,
        endDate: values.endDate || undefined,
        status: values.status,
      };

      if (isEditing) {
        await boardMemberService.updateBoardMember(boardMemberData);
        toast({
          title: "Success",
          description: "Board member updated successfully",
        });
      } else {
        await boardMemberService.createBoardMember(boardMemberData);
        toast({
          title: "Success",
          description: "Board member added successfully",
        });
      }

      setShowForm(false);
      form.reset();
      refetch();
    } catch (error) {
      console.error("Error saving board member:", error);
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to update board member"
          : "Failed to add board member",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "SUSPENDED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Define columns for DataTable
  const columns: Column<BoardMember & { fullName?: string }>[] = [
    {
      header: "ID",
      accessorKey: "id",
      sortable: true,
    },
    {
      header: "Name",
      accessorKey: "fullName",
      sortable: true,
      cell: (boardMember) => (
        <span className="font-medium">{boardMember.fullName}</span>
      ),
    },
    {
      header: "Position",
      accessorKey: "position",
      sortable: true,
    },
    {
      header: "Created",
      accessorKey: "createDate",
      sortable: true,
      cell: (boardMember) => (
        <div className="flex flex-col">
          <span>{format(new Date(boardMember.createDate), "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(boardMember.createDate), "hh:mm a")}
          </span>
        </div>
      ),
    },
    {
      header: "Last Updated",
      accessorKey: "lastModified",
      sortable: true,
      cell: (boardMember) => (
        <div className="flex flex-col">
          <span>{format(new Date(boardMember.lastModified), "MMM dd, yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(boardMember.lastModified), "hh:mm a")}
          </span>
        </div>
      ),
    },
    {
      header: "Start Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (boardMember) => (
        <span>
          {boardMember.createdAt
            ? format(new Date(boardMember.createdAt), "PPP")
            : "N/A"}
        </span>
      ),
    },
    {
      header: "End Date",
      accessorKey: "endDate",
      sortable: true,
      cell: (boardMember) => (
        <span>
          {boardMember.endDate
            ? format(new Date(boardMember.endDate), "PPP")
            : "Current"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (boardMember) => (
        <Badge
          className={`px-2 py-1 rounded-full ${getStatusColor(
            boardMember.status
          )}`}
        >
          {boardMember.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (boardMember) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(boardMember);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(boardMember);
            }}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Board Members</CardTitle>
              <CardDescription>
                Manage the SACCO board members and their positions
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Board Member
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading board members...</span>
              </div>
            ) : enrichedBoardMembers.length === 0 ? (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No board members found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get started by adding a new board member.
                </p>
                <Button
                  onClick={handleAddNew}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Board Member
                </Button>
              </div>
            ) : (
              <DataTable
                data={enrichedBoardMembers}
                columns={columns}
                keyField="id"
                pagination={true}
                searchable={true}
                pageSize={10}
                pageSizeOptions={[5, 10, 25, 50]}
                emptyMessage="No board members found"
                loading={isLoading}
                onRowClick={(boardMember) => handleEdit(boardMember)}
              />
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Board Member" : "Add New Board Member"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update the board member's information below."
                  : "Add a new board member by filling in the information below."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="memberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {members?.map((member) => (
                              <SelectItem
                                key={member.memberId}
                                value={member.memberId.toString()}
                              >
                                {member.firstName} {member.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Chairperson" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{isEditing ? "Update" : "Add"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this board member? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <p className="font-medium">{selectedMember?.fullName}</p>
              <p className="text-sm text-muted-foreground">
                Position: {selectedMember?.position}
              </p>
              <p className="text-sm text-muted-foreground">
                Created: {selectedMember?.createDate ? 
                  format(new Date(selectedMember.createDate), "MMM dd, yyyy") : 
                  "N/A"}
              </p>
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default BoardMembers;