import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseService } from "@/services/expenseService";
import { expenseCategoryService } from "@/services/expenseCategoryService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import ExpenseCategoryForm from "@/components/expenses/ExpenseCategoryForm";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const Expenses = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingExpense, setRejectingExpense] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");


  // Expense Categories Query
  const { data: categoriesData } = useQuery({
    queryKey: ["expense-categories", 0, 100],
    queryFn: () => expenseCategoryService.getCategories(0, 100),
    staleTime: 60_000,
  });
  const categories = categoriesData?.content ?? [];

  // Expenses Query
  const { data, isLoading } = useQuery({
    queryKey: ["expenses", page],
    queryFn: () => expenseService.getExpenses(page, 10),
    placeholderData: (prev) => prev,
  });

  // Mutations
  const createMut = useMutation({
    mutationFn: (payload: any) => expenseService.createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Success", description: "Expense created" });
      setShowForm(false);
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.message || "Failed",
        variant: "destructive",
      }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: any) => expenseService.updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Success", description: "Expense updated" });
      setShowForm(false);
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
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Success", description: "Expense deleted" });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description: err?.message || "Failed",
        variant: "destructive",
      }),
  });

  const approveMut = useMutation({
    mutationFn: ({
      id,
      action,
      rejectionReason,
    }: {
      id: number;
      action: "APPROVE" | "REJECT";
      rejectionReason?: string;
    }) =>
      expenseService.approveExpense(
        id,
        action,
        Number(localStorage.getItem("userId") ?? 0),
        rejectionReason
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast({ title: "Success", description: "Expense action processed" });
    },
    onError: (err: any) => {
      const serverMessage =
        err?.response?.data?.message || err?.message || "Failed";
      toast({
        title: "Error",
        description: serverMessage,
        variant: "destructive",
      });
    },
  });



  // Table Rows
  const rows = (data?.content ?? []).map((e: any) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    category: categories.find((c: any) => c.id === e.categoryId)?.name ?? String(e.categoryId),
    date: e.expenseDate,
    status: e.approvalStatus,
    raw: e,
  }));

  // Table Columns
  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Title", accessorKey: "title" },
    { header: "Category", accessorKey: "category" },
    { header: "Amount", accessorKey: "amount" },
    { header: "Date", accessorKey: "date" },
    {
      header: "Status", accessorKey: "status",
      cell: (row: any) => {
        let colorClass = "bg-gray-100 text-gray-800";
        if (row.status === "APPROVED") colorClass = "bg-green-100 text-green-800";
        else if (row.status === "REJECTED") colorClass = "bg-red-100 text-red-800";
        else if (row.status === "PENDING_APPROVAL") colorClass = "bg-yellow-100 text-yellow-800";
        return (<span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {row.status.replaceAll("_", " ")}
        </span>
        );
      }
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(row.raw);
              setShowForm(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteMut.mutate(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          {row.status === "PENDING_APPROVAL" && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() =>
                  approveMut.mutate({ id: row.id, action: "APPROVE" })
                }
              >
                Approve
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRejectingExpense(row.raw);
                  setShowRejectModal(true);
                }}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    }


  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Expenses</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage SACCO expenses and track spending categories
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DataTable data={rows} columns={columns} keyField="id" emptyMessage="No expenses found" />
            )}
          </CardContent>
        </Card>

        {/* Expense Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Expense" : "Add Expense"}</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              categories={categories}
              initialData={editing}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
              onSubmit={(payload) => {
                if (editing) updateMut.mutate({ id: editing.id, payload });
                else createMut.mutate(payload);
              }}
            />
            <DialogFooter />
          </DialogContent>
        </Dialog>
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reject Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please provide a reason for rejecting expense <strong>{rejectingExpense?.title}</strong>.
              </p>
              <textarea
                className="w-full border rounded p-2"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
              />
            </div>
            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (rejectingExpense) {
                    approveMut.mutate({
                      id: rejectingExpense.id,
                      action: "REJECT",
                      rejectionReason: rejectReason,
                    });
                  }
                  setRejectReason("");
                  setRejectingExpense(null);
                  setShowRejectModal(false);
                }}
              >
                Submit Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
};

export default Expenses;
