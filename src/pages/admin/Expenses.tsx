import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "./DashboardLayout";
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
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Layers,
  DollarSign,
} from "lucide-react";

/* =========================
   KPI CARD
========================= */
const KpiCard = ({
  icon: Icon,
  label,
  value,
  bg,
  iconColor,
  textColor,
}: any) => (
  <Card className={`${bg} shadow-sm`}>
    <CardContent className="flex items-center gap-3 py-4">
      <Icon className={`h-8 w-8 ${iconColor}`} />
      <div>
        <div className={`text-lg font-bold ${textColor}`}>
          {value ?? "--"}
        </div>
        <div className={`text-xs ${textColor}`}>{label}</div>
      </div>
    </CardContent>
  </Card>
);

const Expenses = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingExpense, setRejectingExpense] = useState<any | null>(null);

  /* =========================
     KPI QUERY
  ========================== */
  const { data: kpis } = useQuery({
    queryKey: ["expense-kpis"],
    queryFn: expenseService.getExpenseKpis,
    staleTime: 60_000,
  });

  /* =========================
     CATEGORIES
  ========================== */
  const { data: categoriesData } = useQuery({
    queryKey: ["expense-categories"],
    queryFn: () => expenseCategoryService.getCategories(0, 100),
  });
  const categories = categoriesData?.content ?? [];

  /* =========================
     EXPENSES
  ========================== */
  const { data, isLoading } = useQuery({
    queryKey: ["expenses", page],
    queryFn: () => expenseService.getExpenses(page, 10),
    keepPreviousData: true,
  });

  /* =========================
     HELPERS
  ========================== */
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["expense-kpis"] });
  };

  /* =========================
     MUTATIONS
  ========================== */
  const createMut = useMutation({
    mutationFn: expenseService.createExpense,
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Success", description: "Expense created" });
      setShowForm(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: any) =>
      expenseService.updateExpense(id, payload),
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Success", description: "Expense updated" });
      setShowForm(false);
      setEditing(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: expenseService.deleteExpense,
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Success", description: "Expense deleted" });
    },
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
      invalidateAll();
      toast({ title: "Success", description: "Expense processed" });
    },
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
      e.categoryId,
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
        const colors: any = {
          APPROVED: "bg-green-100 text-green-800",
          REJECTED: "bg-red-100 text-red-800",
          PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${colors[row.status]}`}
          >
            {row.status.replaceAll("_", " ")}
          </span>
        );
      },
    },
    {
      header: "Actions",
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

        {/* ================= KPI SUMMARY ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <KpiCard
            icon={DollarSign}
            label="Total Amount"
            value={kpis?.totalExpenses}
            bg="bg-gradient-to-r from-indigo-50 to-indigo-100"
            iconColor="text-indigo-500"
            textColor="text-indigo-700"
          />
          <KpiCard
            icon={Layers}
            label="Total Count"
            value={kpis?.totalCount}
            bg="bg-gradient-to-r from-blue-50 to-blue-100"
            iconColor="text-blue-500"
            textColor="text-blue-700"
          />
          <KpiCard
            icon={CheckCircle}
            label="Approved"
            value={kpis?.approvedExpenses}
            bg="bg-gradient-to-r from-green-50 to-green-100"
            iconColor="text-green-500"
            textColor="text-green-700"
          />
          <KpiCard
            icon={Clock}
            label="Pending"
            value={kpis?.pendingExpenses}
            bg="bg-gradient-to-r from-yellow-50 to-yellow-100"
            iconColor="text-yellow-500"
            textColor="text-yellow-700"
          />
          <KpiCard
            icon={XCircle}
            label="Rejected"
            value={kpis?.rejectedExpenses}
            bg="bg-gradient-to-r from-red-50 to-red-100"
            iconColor="text-red-500"
            textColor="text-red-700"
          />
        </div>

        {/* ================= CATEGORY KPIs ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(kpis?.expenseCountByCategory ?? {}).map(
            ([category, count]) => (
              <Card
                key={category}
                className="bg-gradient-to-r from-slate-50 to-slate-100"
              >
                <CardContent className="py-4">
                  <div className="text-sm font-medium capitalize text-slate-700">
                    {category}
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {count} expenses
                  </div>
                  <div className="text-xs text-slate-600">
                    Amount: {kpis?.expensesByCategory?.[category] ?? 0}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* ================= TABLE ================= */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Expenses</CardTitle>
              <CardDescription>Manage expenses</CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <Loader2 className="mx-auto animate-spin" />
            ) : (
              <DataTable data={rows} columns={columns} keyField="id" />
            )}
          </CardContent>
        </Card>

        {/* ================= FORMS ================= */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Expense" : "Add Expense"}
              </DialogTitle>
            </DialogHeader>
            <ExpenseForm
              categories={categories}
              initialData={editing}
              onCancel={() => setShowForm(false)}
              onSubmit={(payload) =>
                editing
                  ? updateMut.mutate({ id: editing.id, payload })
                  : createMut.mutate(payload)
              }
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Expense</DialogTitle>
            </DialogHeader>
            <textarea
              className="w-full border rounded p-2"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => {
                  approveMut.mutate({
                    id: rejectingExpense.id,
                    action: "REJECT",
                    rejectionReason: rejectReason,
                  });
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
