import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MetricCard from "@/components/MetricCard";
import ReleaseChart from "@/components/ReleaseChart";
import PRChart from "@/components/PRChart";
import ReleaseDetails from "@/components/ReleaseDetails";
import Leaderboard from "@/components/Leaderboard";
import { BarChart3 } from "lucide-react";
import type { Metrics, Release } from "@shared/schema";
import { getMetrics, getReleases } from "@/lib/dataService";

export default function Dashboard() {
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [timelineFilter, setTimelineFilter] = useState(5);
  const [prFilter, setPrFilter] = useState("7d");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, releasesData] = await Promise.all([
        getMetrics(),
        getReleases()
      ]);
      setMetrics(metricsData);
      // Sort releases by published date (latest first) and set state
      const sortedReleases = releasesData.sort((a, b) => 
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
      setReleases(sortedReleases);
      // Set the latest release as default (first after sorting)
      if (sortedReleases && sortedReleases.length > 0 && !selectedRelease) {
        setSelectedRelease(sortedReleases[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-b border-blue-200/50 dark:border-blue-800/50 sticky top-0 z-50 backdrop-blur-md shadow-lg shadow-blue-100/25 dark:shadow-blue-900/25">
          <div className="mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <div className="relative">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-sm animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 dark:from-slate-100 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                    Focus Bear Analytics
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    🚀 Release & Development Metrics Dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-b border-blue-200/50 dark:border-blue-800/50 sticky top-0 z-50 backdrop-blur-md shadow-lg shadow-blue-100/25 dark:shadow-blue-900/25">
        <div className="mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-all duration-300">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-sm animate-pulse"></div>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 dark:from-slate-100 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                  Focus Bear Analytics
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  🚀 Release & Development Metrics Dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto px-6 py-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            title="Total Releases"
            value={metrics?.totalReleases || 0}
            icon="rocket"
            testId="metric-total-releases"
          />
          <MetricCard
            title="Total PRs"
            value={metrics?.totalPRs || 0}
            icon="git-branch"
            testId="metric-total-prs"
          />
          <MetricCard
            title="Issues in QA"
            value={metrics?.issuesInQA || 0}
            icon="bug"
            testId="metric-issues-qa"
          />
          <MetricCard
            title="Avg Release Time"
            value={`${metrics?.avgReleaseTime || 0} D`}
            icon="clock"
            testId="metric-avg-release-time"
          />
          <MetricCard
            title="QA Passed (7 days)"
            value={`${metrics?.issuesPassedQA || 0}`}
            icon="rocket"
            testId="metric-issues-qa-passed"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <ReleaseChart 
            filter={timelineFilter}
            onFilterChange={setTimelineFilter}
          />
          <PRChart 
            filter={prFilter}
            onFilterChange={setPrFilter}
          />
        </div>

        {/* Release Details & Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ReleaseDetails
              releases={releases || []}
              selectedRelease={selectedRelease}
              onReleaseSelect={setSelectedRelease}
            />
          </div>
          <div className="space-y-6">
            <Leaderboard
              title="Release Leaders"
              data={metrics?.releaseLeaders || []}
              icon="trophy"
              testId="leaderboard-releases"
            />
            <Leaderboard
              title="PR Champions"
              data={metrics?.prLeaders || []}
              icon="code"
              testId="leaderboard-prs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
