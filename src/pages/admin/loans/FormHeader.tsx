import { Card, CardContent } from "@/components/ui/card";

const FormHeader = () => {
  const stats = [
    { title: "Available Loan Types", value: 3, icon: "FileText", color: "blue" },
    { title: "Active Members", value: 3, icon: "Users", color: "green" },
    { title: "Processing Time", value: "24h", icon: "CheckCircle", color: "purple" },
  ];

  return (
    <>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Loan Application Center</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Apply for your loan quickly and securely. Our streamlined process ensures fast approval and competitive rates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className={`bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-${stat.color}-100`}>{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                {/* Icon would be rendered here */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default FormHeader;