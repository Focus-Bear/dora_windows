import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Code } from "lucide-react";

interface LeaderboardProps {
  title: string;
  data: Array<{ author: string; count: number }>;
  icon: "trophy" | "code";
  testId: string;
}

const iconMap = {
  trophy: Trophy,
  code: Code,
};

const iconColorMap = {
  trophy: "text-yellow-400 drop-shadow-md",
  code: "text-emerald-400 drop-shadow-md",
};

export default function Leaderboard({ title, data, icon, testId }: LeaderboardProps) {
  const Icon = iconMap[icon];
  const iconColor = iconColorMap[icon];

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30";
      case 1:
        return "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white shadow-lg shadow-gray-400/30";
      case 2:
        return "bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white shadow-lg shadow-amber-600/30";
      default:
        return "bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 text-white shadow-md shadow-slate-400/20";
    }
  };

  const getRankBackgroundColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border border-yellow-200/50";
      case 1:
        return "bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border border-gray-200/50";
      case 2:
        return "bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/50";
      default:
        return "bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border border-slate-200/40";
    }
  };

  return (
    <Card className="shadow-sm" data-testid={testId}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 5).map((leader, index) => (
            <div
              key={leader.author}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${getRankBackgroundColor(index)}`}
              data-testid={`${testId}-item-${index + 1}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold transition-transform duration-300 hover:scale-110 ${getRankBadgeColor(index)}`}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {leader.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {index === 0 ? "Top Contributor" : "Contributor"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground" data-testid={`${testId}-count-${index + 1}`}>
                  {leader.count}
                </p>
                <p className="text-xs text-muted-foreground">
                  {icon === "trophy" ? "releases" : "PRs"}
                </p>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
