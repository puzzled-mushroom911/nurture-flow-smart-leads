
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for usage stats
const usageData = [
  { day: "Mon", messages: 12, analysis: 24 },
  { day: "Tue", messages: 19, analysis: 37 },
  { day: "Wed", messages: 15, analysis: 25 },
  { day: "Thu", messages: 27, analysis: 43 },
  { day: "Fri", messages: 32, analysis: 49 },
  { day: "Sat", messages: 8, analysis: 16 },
  { day: "Sun", messages: 5, analysis: 11 }
];

export function UsageChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={usageData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Legend />
              <Line
                name="Generated Messages"
                type="monotone"
                dataKey="messages"
                stroke="#2563EB"
                activeDot={{ r: 6 }}
                strokeWidth={2}
              />
              <Line
                name="Lead Analysis"
                type="monotone"
                dataKey="analysis"
                stroke="#8B5CF6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
