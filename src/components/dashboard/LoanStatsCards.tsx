import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, Badge } from "lucide-react";

interface LoanStatsCardsProps {
  loanStats: any;
}

const allStats = [
  {
    label: "Total Applications",
    valueKey: "totalApplications",
    color: "from-blue-50 to-blue-100",
    icon: <Plus className="h-6 w-6 text-blue-500" />,
    textColor: "text-blue-700",
  },
  {
    label: "Pending",
    valueKey: "totalPending",
    color: "from-yellow-50 to-yellow-100",
    icon: <Loader2 className="h-6 w-6 text-yellow-500" />,
    textColor: "text-yellow-700",
  },
  {
    label: "Approved",
    valueKey: "totalApproved",
    color: "from-green-50 to-green-100",
    icon: <Badge className="h-6 w-6 text-green-500" />,
    textColor: "text-green-700",
  },
  {
    label: "Disbursed",
    valueKey: "totalDisbursed",
    color: "from-green-50 to-green-100",
    icon: <Badge className="h-6 w-6 text-green-700" />,
    textColor: "text-green-700",
  },
  {
    label: "Under Review",
    valueKey: "totalUnderReview",
    color: "from-purple-50 to-purple-100",
    icon: <Badge className="h-6 w-6 text-purple-500" />,
    textColor: "text-purple-700",
  },
  {
    label: "Rejected",
    valueKey: "totalRejected",
    color: "from-red-50 to-red-100",
    icon: <Badge className="h-6 w-6 text-red-500" />,
    textColor: "text-red-700",
  },
  {
    label: "Amount Applied",
    valueKey: "totalAmountApplied",
    color: "from-blue-50 to-blue-100",
    icon: <Plus className="h-6 w-6 text-blue-700" />,
    textColor: "text-blue-700",
    isCurrency: true,
  },
  {
    label: "Amount Approved",
    valueKey: "totalAmountApproved",
    color: "from-green-50 to-green-100",
    icon: <Plus className="h-6 w-6 text-green-700" />,
    textColor: "text-green-700",
    isCurrency: true,
  },
  {
    label: "Amount Rejected",
    valueKey: "totalAmountRejected",
    color: "from-red-50 to-red-100",
    icon: <Plus className="h-6 w-6 text-red-700" />,
    textColor: "text-red-700",
    isCurrency: true,
  },
  {
    label: "Average Loan Amount",
    valueKey: "averageLoanAmount",
    color: "from-gray-50 to-gray-100",
    icon: <Plus className="h-6 w-6 text-gray-700" />,
    textColor: "text-gray-700",
    isCurrency: true,
  },
  {
    label: "Highest Loan Amount",
    valueKey: "highestLoanAmount",
    color: "from-yellow-50 to-yellow-100",
    icon: <Plus className="h-6 w-6 text-yellow-700" />,
    textColor: "text-yellow-700",
    isCurrency: true,
  },
  {
    label: "Lowest Loan Amount",
    valueKey: "lowestLoanAmount",
    color: "from-yellow-50 to-yellow-100",
    icon: <Plus className="h-6 w-6 text-yellow-700" />,
    textColor: "text-yellow-700",
    isCurrency: true,
  },
  {
    label: "With Guarantor",
    valueKey: "applicationsWithGuarantor",
    color: "from-purple-50 to-purple-100",
    icon: <Badge className="h-6 w-6 text-purple-700" />,
    textColor: "text-purple-700",
  },
  {
    label: "With Collateral",
    valueKey: "applicationsWithCollateral",
    color: "from-blue-50 to-blue-100",
    icon: <Badge className="h-6 w-6 text-blue-700" />,
    textColor: "text-blue-700",
  },
  {
    label: "Penalty Applicable",
    valueKey: "applicationsWithPenaltyApplicable",
    color: "from-red-50 to-red-100",
    icon: <Badge className="h-6 w-6 text-red-700" />,
    textColor: "text-red-700",
  },
  {
    label: "With Next of Kin",
    valueKey: "applicationsWithNextOfKin",
    color: "from-green-50 to-green-100",
    icon: <Badge className="h-6 w-6 text-green-700" />,
    textColor: "text-green-700",
  },
];

const LoanStatsCards: React.FC<LoanStatsCardsProps> = ({ loanStats }) => {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {allStats.map((card) => (
        <Card key={card.label} className={`min-w-[180px] bg-gradient-to-r ${card.color} shadow-sm p-2`}>
          <CardContent className="flex items-center gap-2 py-2">
            {card.icon}
            <div>
              <div className={`text-base font-bold ${card.textColor}`}>{card.isCurrency ? `KES ${Number(loanStats?.[card.valueKey] ?? 0).toLocaleString()}` : loanStats?.[card.valueKey] ?? "--"}</div>
              <div className={`text-xs ${card.textColor}`}>{card.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoanStatsCards;
