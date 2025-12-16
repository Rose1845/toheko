import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseCategoryService } from "@/services/expenseCategoryService";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import ExpenseCategoryForm from "./ExpenseCategoryForm";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExpenseCategory } from "@/types/api";

const ExpenseCategoryList: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ExpenseCategory | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["expense-categories", 0, 100],
    queryFn: () => expenseCategoryService.getCategories(0, 100),
  });
  const categories = data?.content ?? [];

  const createMut = useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      expenseCategoryService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast({ title: "Success", description: "Category created" });
      setShowCreate(false);
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.message || "Failed",
        variant: "destructive",
      }),
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: { name: string; description?: string };
    }) => expenseCategoryService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast({ title: "Success", description: "Category updated" });
      setEditing(null);
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.message || "Failed",
        variant: "destructive",
      }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => expenseCategoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
      toast({ title: "Success", description: "Category deleted" });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.message || "Failed",
        variant: "destructive",
      }),
  });

  const rows = categories.map((c: ExpenseCategory) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    raw: c,
  }));

  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Name", accessorKey: "name" },
    { header: "Description", accessorKey: "description" },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (r: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(r.raw)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteMut.mutate(r.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <CardTitle className="text-lg sm:text-xl">Expense Categories</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage SACCO expense categories for better organization
          </CardDescription>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            keyField="id"
            emptyMessage="No categories"
          />
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <ExpenseCategoryForm
            onSubmit={(payload) => createMut.mutate(payload)}
            onCancel={() => setShowCreate(false)}
          />
          <DialogFooter />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editing && (
            <ExpenseCategoryForm
              initial={editing}
              onSubmit={(payload) =>
                updateMut.mutate({ id: editing.id, payload })
              }
              onCancel={() => setEditing(null)}
            />
          )}
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ExpenseCategoryList;
