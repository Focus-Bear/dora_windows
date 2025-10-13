import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PRsDataByTime } from "@/lib/dataService";

interface PRChartProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export default function PRChart({ filter, onFilterChange }: PRChartProps) {
  // Mock PR data for demonstration - in real implementation, this would come from API
  const mockPRData = PRsDataByTime();

  const chartData = mockPRData[filter as keyof typeof mockPRData] || mockPRData["7d"];

  const filterButtons = [
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "All Time", value: "all" },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-800 to-emerald-700 dark:from-slate-100 dark:to-emerald-300 bg-clip-text text-transparent">PR Merge Analysis</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">📊 Average merge time trends</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50/50 via-teal-50/50 to-green-50/50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-green-900/20 p-1.5 rounded-xl border border-emerald-100/50 dark:border-emerald-800/50 backdrop-blur-sm">
            <div className="flex space-x-1">
              {filterButtons.map((btn) => (
                <Button
                  key={btn.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => onFilterChange(btn.value)}
                  data-testid={`filter-pr-${btn.value}`}
                  className={`
                    relative transition-all duration-300 ease-in-out font-medium
                    ${filter === btn.value 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-105' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:text-slate-800 dark:hover:text-slate-100'
                    }
                  `}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="prGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.7}/>
                </linearGradient>
                <filter id="barShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.3"/>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.3}
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                dataKey="period" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                fontWeight={500}
                axisLine={false}
                tickLine={false}
                tick={{ dy: 8 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                fontWeight={500}
                axisLine={false}
                tickLine={false}
                tick={{ dx: -8 }}
                domain={[0, (dataMax: number) => {
                  const max = Math.max(...chartData.map(d => d.avgMergeTime), 0);
                  if (max <= 10) return 10;
                  if (max <= 20) return 20;
                  if (max <= 50) return 50;
                  if (max <= 100) return 100;
                  return Math.ceil(max / 50) * 50;
                }]}
                tickCount={6}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                  backdropFilter: "blur(8px)",
                  fontSize: "13px",
                  fontWeight: "500"
                }}
                labelStyle={{ 
                  color: "hsl(var(--foreground))", 
                  fontWeight: "600",
                  marginBottom: "4px"
                }}
                formatter={(value: any) => [`${value} hours`, 'Avg Merge Time']}
                labelFormatter={(label: any) => `${label}`}
              />
              <Bar
                dataKey="avgMergeTime"
                fill="url(#prGradient)"
                radius={[8, 8, 4, 4]}
                filter="url(#barShadow)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
