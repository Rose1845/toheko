import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseService } from "@/services/expenseService";
import { expenseCategoryService } from "@/services/expenseCategoryService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { Loader2, Plus, Edit, Trash2, BarChart2, Clock, CheckCircle, XCircle } from "lucide-react";
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

  const { data: kpiStats, isLoading: kpiLoading } = useQuery({
    queryKey: ["expense-kpis"],
    queryFn: expenseService.getExpenseKpis,
    staleTime: 60_000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["expense-categories", 0, 100],
    queryFn: () => expenseCategoryService.getCategories(0, 100),
    staleTime: 60_000,
  });
  const categories = categoriesData?.content ?? [];

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", page],
    queryFn: () => expenseService.getExpenses(page, 10),
    placeholderData: (prev) => prev,
  });

  const createMut = useMutation({
    mutationFn: expenseService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-kpis"] });
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
    mutationFn: ({ id, payload }: any) =>
      expenseService.updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-kpis"] });
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
    mutationFn: expenseService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-kpis"] });
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
      queryClient.invalidateQueries({ queryKey: ["expense-kpis"] });
      toast({ title: "Success", description: "Expense processed" });
    },
    onError: (err: any) =>
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || err?.message || "Failed",
        variant: "destructive",
      }),
  });

  /* =========================
     TABLE DATA
  ========================== */
  const rows = (data?.content ?? []).map((e: any) => ({
    id: e.id,
    title: e.title,
    amount: e.amount,
    category:
      categories.find((c: any) => c.id === e.categoryId)?.name ??
      String(e.categoryId),
    date: e.expenseDate,
    status: e.approvalStatus,
    raw: e,
  }));

  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Title", accessorKey: "title" },
    { header: "Category", accessorKey: "category" },
    { header: "Amount", accessorKey: "amount" },
    { header: "Date", accessorKey: "date" },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => {
        let colorClass = "bg-gray-100 text-gray-800";
        if (row.status === "APPROVED") colorClass = "bg-green-100 text-green-800";
        else if (row.status === "REJECTED") colorClass = "bg-red-100 text-red-800";
        else if (row.status === "PENDING_APPROVAL")
          colorClass = "bg-yellow-100 text-yellow-800";

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {row.status.replaceAll("_", " ")}
          </span>
        );
      },
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
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-6">

        {/* ================= KPI CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="flex items-center gap-3 py-4">
              <BarChart2 className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-lg font-bold">
                  {kpiLoading ? "--" : kpiStats?.totalCount}
                </div>
                <div className="text-xs text-blue-700">Total Expenses</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-lg font-bold">
                  {kpiLoading ? "--" : kpiStats?.approvedExpenses}
                </div>
                <div className="text-xs text-green-700">Approved</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
            <CardContent className="flex items-center gap-3 py-4">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-lg font-bold">
                  {kpiLoading ? "--" : kpiStats?.pendingExpenses}
                </div>
                <div className="text-xs text-yellow-700">Pending</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100">
            <CardContent className="flex items-center gap-3 py-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-lg font-bold">
                  {kpiLoading ? "--" : kpiStats?.rejectedExpenses}
                </div>
                <div className="text-xs text-red-700">Rejected</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================= EXPENSE TABLE ================= */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>
                Manage SACCO expenses and approvals
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
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
              <DataTable
                data={rows}
                columns={columns}
                keyField="id"
                emptyMessage="No expenses found"
              />
            )}
          </CardContent>
        </Card>

        {/* ================= FORMS ================= */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Expense" : "Add Expense"}
              </DialogTitle>
            </DialogHeader>
            <ExpenseForm
              categories={categories}
              initialData={editing}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
              onSubmit={(payload) =>
                editing
                  ? updateMut.mutate({ id: editing.id, payload })
                  : createMut.mutate(payload)
              }
            />
          </DialogContent>
        </Dialog>

        {/* ================= REJECT MODAL ================= */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Expense</DialogTitle>
            </DialogHeader>
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  approveMut.mutate({
                    id: rejectingExpense.id,
                    action: "REJECT",
                    rejectionReason: rejectReason,
                  });
                  setRejectReason("");
                  setRejectingExpense(null);
                  setShowRejectModal(false);
                }}
              >
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
};

export default Expenses;
