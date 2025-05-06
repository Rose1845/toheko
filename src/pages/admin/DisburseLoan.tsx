/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

type DisbursementData = {
  disbursementCode: string;
  loanApplicationId: number;
  amount: number;
  disbursementDate: string;
  status: string;
  paymentReference: string;
  paymentMethod: string;
  bankAccount: string;
  mobileNumber: string;
  disbursedBy: number;
  remarks: string;
  isActive: boolean;
};

const DisburseLoan = ({
  loanApplicationId,
  disbursedBy,
}: {
  loanApplicationId: number;
  disbursedBy: number;
}) => {
  const [form, setForm] = useState<
    Omit<DisbursementData, "loanApplicationId" | "disbursedBy">
  >({
    disbursementCode: "",
    amount: 0,
    disbursementDate: new Date().toISOString().slice(0, 10),
    status: "PENDING",
    paymentReference: "",
    paymentMethod: "",
    bankAccount: "",
    mobileNumber: "",
    remarks: "",
    isActive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.disbursementCode || !form.amount || !form.paymentMethod) {
      toast({
        title: "Validation Error",
        description:
          "Disbursement Code, Amount, and Payment Method are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(
        "https://sacco-app-production.up.railway.app/api/v1/disbursements",
        {
          ...form,
          loanApplicationId,
          disbursedBy,
        }
      );

      toast({
        title: "Disbursement Successful",
        description: "The loan disbursement was processed successfully.",
      });
    } catch (error) {
      console.error("Disbursement error:", error);
      toast({
        title: "Error",
        description: "Failed to process disbursement.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded shadow max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold">Disburse Loan</h2>

      {[
        { label: "Disbursement Code", name: "disbursementCode" },
        { label: "Amount", name: "amount", type: "number" },
        { label: "Disbursement Date", name: "disbursementDate", type: "date" },
        { label: "Payment Reference", name: "paymentReference" },
        { label: "Payment Method", name: "paymentMethod" },
        { label: "Bank Account", name: "bankAccount" },
        { label: "Mobile Number", name: "mobileNumber" },
        { label: "Remarks", name: "remarks" },
      ].map(({ label, name, type = "text" }) => (
        <div key={name}>
          <label className="block text-sm font-medium">{label}</label>
          <input
            type={type}
            name={name}
            value={(form as any)[name]}
            onChange={handleChange}
            className="mt-1 p-2 w-full border border-gray-300 rounded"
          />
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded"
        >
          <option value="PENDING">Pending</option>
          <option value="DISBURSED">Disbursed</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
        />
        <label className="text-sm">Is Active</label>
      </div>

      <Button onClick={handleSubmit}>Submit Disbursement</Button>
    </div>
  );
};

export default DisburseLoan;
