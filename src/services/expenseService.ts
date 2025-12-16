import apiClient from "./api";
import { Expense } from "@/types/api";

export const expenseService = {
  getExpenses: async (page = 0, size = 10, sort = "createdAt,DESC") => {
    const resp = await apiClient.get(`/api/v1/expenses?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`);
    return resp.data?.data ?? resp.data;
  },

  getExpenseById: async (id: number) => {
    const resp = await apiClient.get(`/api/v1/expenses/${id}`);
    return resp.data?.data ?? resp.data;
  },

  createExpense: async (payload: { title: string; description?: string; amount: number; categoryId?: number }) => {
    const userId = localStorage.getItem("userId");
    const headers: any = {};
    if (userId) headers.userId = String(userId);
    const resp = await apiClient.post("/api/v1/expenses", payload, { headers });
    return resp.data?.data ?? resp.data;
  },

  updateExpense: async (id: number, payload: { title: string; description?: string; amount: number; categoryId?: number }) => {
    const resp = await apiClient.put(`/api/v1/expenses/${id}`, payload);
    return resp.data?.data ?? resp.data;
  },

  deleteExpense: async (id: number) => {
    const resp = await apiClient.delete(`/api/v1/expenses/${id}`);
    return resp.data;
  },
  approveExpense: async (
    id: number,
    action: "APPROVE" | "REJECT",
    approverId: number,
    rejectionReason?: string
  ) => {
    return apiClient.post(`api/v1/expenses/${id}/approve`, {
      expenseId: id,
      action,
      approverId,
      rejectionReason: action === "REJECT" ? rejectionReason ?? "Not specified" : null,
    }, {
      headers: {
        "Content-Type": "application/json",
        userId: localStorage.getItem("userId") ?? "",
      },
    });
  },
    getExpenseKpis: async () => {
    const res = await apiClient.get("/api/v1/expense-kpi/range");
    return res.data;
  },
};