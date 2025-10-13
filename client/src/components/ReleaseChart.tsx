import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { ReleaseTimeline } from "@shared/schema";
import { getReleaseTimeline } from "@/lib/dataService";

interface ReleaseChartProps {
  filter: number;
  onFilterChange: (filter: number) => void;
}

export default function ReleaseChart({ filter, onFilterChange }: ReleaseChartProps) {
  const [timeline, setTimeline] = useState<ReleaseTimeline[]>([]);
  
  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const data = await getReleaseTimeline(filter === -1 ? undefined : filter);
        setTimeline(data);
      } catch (error) {
        console.error('Error loading timeline:', error);
      }
    };
    
    loadTimeline();
  }, [filter]);

  const chartData = timeline.slice(0, filter === -1 ? undefined : filter).reverse();

  // Function to calculate uniform tick intervals
  const getUniformTicks = (values: number[], desired = 6) => {
    const max = Math.max(0, ...values);
    if (max === 0) return { ticks: [0, 1], maxTick: 1 };
    
    const target = Math.max(1, max);
    const rawStep = target / (desired - 1);
    const pow10 = 10 ** Math.floor(Math.log10(rawStep));
    const candidates = [1, 2, 5, 10].map(m => m * pow10);
    const step = candidates.find(s => rawStep <= s) ?? candidates[candidates.length - 1];
    const maxTick = Math.ceil(target / step) * step;
    const count = Math.floor(maxTick / step) + 1;
    const ticks = Array.from({ length: count }, (_, i) => i * step);
    
    return { ticks, maxTick };
  };

  const { ticks, maxTick } = getUniformTicks(chartData.map(d => d.days), 6);

  const filterButtons = [
    { label: "Last 5", value: 5 },
    { label: "Last 10", value: 10 },
    { label: "All", value: -1 },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-100 dark:to-blue-300 bg-clip-text text-transparent">Release Timeline</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">⏱️ Time intervals between releases</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-1.5 rounded-xl border border-blue-100/50 dark:border-blue-800/50 backdrop-blur-sm">
            <div className="flex space-x-1">
              {filterButtons.map((btn) => (
                <Button
                  key={btn.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => onFilterChange(btn.value)}
                  data-testid={`filter-releases-${btn.value}`}
                  className={`
                    relative transition-all duration-300 ease-in-out font-medium
                    ${filter === btn.value 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105' 
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
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="releaseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
                <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="hsl(var(--primary))" floodOpacity="0.3"/>
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
                dataKey="version" 
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
                domain={[0, maxTick]}
                ticks={ticks}
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
                formatter={(value: any) => [`${value} days`, 'Release Interval']}
                labelFormatter={(label: any) => `Version ${label}`}
              />
              <Area
                type="monotone"
                dataKey="days"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fill="url(#releaseGradient)"
                dot={{ 
                  fill: "hsl(var(--primary))", 
                  stroke: "white", 
                  strokeWidth: 3, 
                  r: 5,
                  filter: "url(#dropshadow)"
                }}
                activeDot={{ 
                  r: 8, 
                  stroke: "hsl(var(--primary))", 
                  strokeWidth: 3,
                  fill: "white",
                  filter: "url(#dropshadow)"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
