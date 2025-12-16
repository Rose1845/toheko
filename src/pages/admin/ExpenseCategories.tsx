import React from "react";
import ExpenseCategoryList from "@/components/expenses/ExpenseCategoryList";
import DashboardLayout from "./DashboardLayout";

const ExpenseCategoriesPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <ExpenseCategoryList />
      </div>
    </DashboardLayout>
  );
};

export default ExpenseCategoriesPage;
