
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const data = [
  {
    name: 'Jan',
    savings: 2400000,
    loans: 1400000,
    payments: 1800000,
  },
  {
    name: 'Feb',
    savings: 2700000,
    loans: 1600000,
    payments: 2100000,
  },
  {
    name: 'Mar',
    savings: 3000000,
    loans: 1900000,
    payments: 2400000,
  },
  {
    name: 'Apr',
    savings: 2800000,
    loans: 2100000,
    payments: 2300000,
  },
  {
    name: 'May',
    savings: 3300000,
    loans: 2400000,
    payments: 2700000,
  },
  {
    name: 'Jun',
    savings: 3500000,
    loans: 2700000,
    payments: 2900000,
  },
];

// Modified function to ensure it always returns a string
const formatYAxis = (value: number): string => {
  if (value === 0) return '0';
  if (value >= 1000000) return `${value / 1000000}M`;
  if (value >= 1000) return `${value / 1000}K`;
  return value.toString(); // Convert number to string to match expected return type
};

const PerformanceChart = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Financial Performance</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip 
              formatter={(value: number) => [`KSH ${value.toLocaleString()}`, undefined]} 
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#0087ff"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="loans" 
              stroke="#ff4500" 
              strokeWidth={2} 
            />
            <Line 
              type="monotone" 
              dataKey="payments" 
              stroke="#00af5f" 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
