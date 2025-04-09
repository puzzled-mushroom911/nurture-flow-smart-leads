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
import { useQuery } from '@tanstack/react-query';
import { leadService } from '@/lib/services/leadService';
import { Loader2 } from 'lucide-react';

interface UsageData {
  day: string;
  messages: number;
  analysis: number;
}

export function UsageChart() {
  const { data: usageData, isLoading, error } = useQuery({
    queryKey: ['usage-stats'],
    queryFn: async () => {
      // In a real implementation, this would come from your backend
      // For now, we'll generate some sample data based on the current date
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      return days.map((day, index) => ({
        day,
        messages: Math.floor(Math.random() * 50),
        analysis: Math.floor(Math.random() * 100)
      }));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading usage data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center h-[300px] flex items-center justify-center text-destructive">
            Error loading usage data. Please try refreshing the page.
          </div>
        </CardContent>
      </Card>
    );
  }

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
