import apiClient from "./api";

export const expenseCategoryService = {
  getCategories: async (page = 0, size = 10, sort = "createdAt,DESC") => {
    const resp = await apiClient.get(
      `/api/v1/expense-categories?page=${page}&size=${size}&sort=${encodeURIComponent(
        sort
      )}`
    );
    return resp.data?.data ?? resp.data;
  },

  getCategoryById: async (id: number) => {
    const resp = await apiClient.get(`/api/v1/expense-categories/${id}`);
    return resp.data?.data ?? resp.data;
  },

  createCategory: async (
    payload: { name: string; description?: string }
  ) => {
    const userId = localStorage.getItem("userId");
    const headers: any = {};
    if (userId) headers.userId = String(userId);
    const resp = await apiClient.post(
      "/api/v1/expense-categories",
      payload,
      { headers }
    );
    return resp.data?.data ?? resp.data;
  },

  updateCategory: async (id: number, payload: { name: string; description?: string }) => {
    const resp = await apiClient.put(
      `/api/v1/expense-categories/${id}`,
      payload
    );
    return resp.data?.data ?? resp.data;
  },

  deleteCategory: async (id: number) => {
    const resp = await apiClient.delete(`/api/v1/expense-categories/${id}`);
    return resp.data;
  },
};