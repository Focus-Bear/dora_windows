import { Card, CardContent } from "@/components/ui/card";
import { Rocket, GitBranch, Bug, Clock } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: "rocket" | "git-branch" | "bug" | "clock";
  testId: string;
}

const iconMap = {
  rocket: Rocket,
  "git-branch": GitBranch,
  bug: Bug,
  clock: Clock,
};

const iconColorMap = {
  rocket: "text-white bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg shadow-blue-500/25",
  "git-branch": "text-white bg-gradient-to-br from-green-500 via-green-600 to-green-700 shadow-lg shadow-green-500/25",
  bug: "text-white bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 shadow-lg shadow-orange-500/25",
  clock: "text-white bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 shadow-lg shadow-purple-500/25",
};

export default function MetricCard({ title, value, icon, testId }: MetricCardProps) {
  const Icon = iconMap[icon];
  const iconClasses = iconColorMap[icon];

  return (
    <Card className="metric-card-hover transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl hover:shadow-gray-200/50 shadow-sm" data-testid={testId}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-4xl font-bold text-foreground" data-testid={`${testId}-value`}>
              {value}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${iconClasses}`}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
