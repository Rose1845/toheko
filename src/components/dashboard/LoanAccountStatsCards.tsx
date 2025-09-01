import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, BarChart2 } from "lucide-react";

interface LoanAccountStatsCardsProps {
  stats: any;
}

const mainStats = [
  {
    label: "Total Principal",
    valueKey: "totalPrincipal",
    color: "from-blue-50 to-blue-100",
    icon: <BarChart2 className="h-6 w-6 text-blue-500" />,
    textColor: "text-blue-700",
    isCurrency: true,
  },
  {
    label: "Total Outstanding",
    valueKey: "totalOutstanding",
    color: "from-green-50 to-green-100",
    icon: <BarChart2 className="h-6 w-6 text-green-500" />,
    textColor: "text-green-700",
    isCurrency: true,
  },
];

const statusColors: Record<string, string> = {
  PENDING_DISBURSEMENT: "from-yellow-50 to-yellow-100 text-yellow-700",
  DISBURSEMENT_QUEUED: "from-purple-50 to-purple-100 text-purple-700",
  ACTIVE: "from-green-50 to-green-100 text-green-700",
  CLOSED: "from-gray-50 to-gray-100 text-gray-700",
  DEFAULTED: "from-red-50 to-red-100 text-red-700",
  WRITTEN_OFF: "from-red-50 to-red-100 text-red-700",
};

const LoanAccountStatsCards: React.FC<LoanAccountStatsCardsProps> = ({ stats }) => {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
      {mainStats.map((card) => (
        <Card key={card.label} className={`min-w-[180px] bg-gradient-to-r ${card.color} shadow-sm p-2`}>
          <CardContent className="flex items-center gap-2 py-2">
            {card.icon}
            <div>
              <div className={`text-base font-bold ${card.textColor}`}>{card.isCurrency ? `KES ${Number(stats?.[card.valueKey] ?? 0).toLocaleString()}` : stats?.[card.valueKey] ?? "--"}</div>
              <div className={`text-xs ${card.textColor}`}>{card.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
      {stats?.byStatus?.map((item: any) => (
        <Card key={item.status} className={`min-w-[180px] bg-gradient-to-r ${statusColors[item.status] || "from-blue-50 to-blue-100 text-blue-700"} shadow-sm p-2`}>
          <CardContent className="flex items-center gap-2 py-2">
            <Badge className="h-6 w-6" />
            <div>
              <div className="text-base font-bold">{item.count} Accounts</div>
              <div className="text-xs">{item.status.replace(/_/g, " ")}</div>
              <div className="text-xs font-semibold">Principal: KES {Number(item.principalSum).toLocaleString()}</div>
              <div className="text-xs font-semibold">Outstanding: KES {Number(item.outstandingSum).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoanAccountStatsCards;
