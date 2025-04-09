import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Trash, Plus, Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardLayout from "./DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// Form schema for validation
const formSchema = z.object({
  id: z.number().optional(),
  memberId: z.coerce.number().min(1, "Member ID is required"),
  position: z.string().min(2, "Position is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  status: z.string().min(1, "Status is required"),
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

  // Fetch board members
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
      startDate: member.createdAt,
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
        createdAt: values.createdAt,
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
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Board Members
            </h1>
            <p className="text-gray-500 mt-1">
              Manage SACCO board members and their positions
            </p>
          </div>
          <Button className="flex items-center gap-2" onClick={handleAddNew}>
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Board Members Directory</CardTitle>
            <CardDescription>
              View and manage all board members and their positions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                Error loading board members. Please try again.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Member ID</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Start Date</TableHead>
                      {/* <TableHead>End Date</TableHead> */}
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boardMembers && boardMembers.length > 0 ? (
                      boardMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.id}</TableCell>
                          <TableCell>{member.memberId}</TableCell>
                          <TableCell className="font-medium">
                            {member.position}
                          </TableCell>
                          <TableCell>
                            {format(new Date(member.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          {/* <TableCell>
                            {member.endDate
                              ? format(new Date(member.endDate), "MMM d, yyyy")
                              : "-"}
                          </TableCell> */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusColor(member.status)}
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive/80"
                              onClick={() => handleDelete(member)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No board members found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
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
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter member ID"
                          {...field}
                        />
                      </FormControl>
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
                        <Input placeholder="Enter position title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave blank if this is a current position
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
