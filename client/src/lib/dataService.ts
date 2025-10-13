import type { Metrics, Release, ReleaseTimeline } from "@shared/schema";
import mobileMetricsData from "./../../../mobile_metrics.json";

// Helper function to calculate metrics from releases
const calculateMetrics = (releases: Release[]): Metrics => {
  // Count unique authors for leaderboards
  const authorReleaseCount = new Map<string, number>();
  const authorPRCount = new Map<string, number>();

  let totalPRs = 0;

  releases.forEach(release => {
    // Count releases per author
    const currentReleaseCount = authorReleaseCount.get(release.author) || 0;
    authorReleaseCount.set(release.author, currentReleaseCount + 1);

    // Count PRs per author (use release author for PR count)
    const currentPRCount = authorPRCount.get(release.author) || 0;
    authorPRCount.set(release.author, currentPRCount + release.pr_count);

    totalPRs += release.pr_count;
  });

  // Convert maps to sorted arrays for leaderboards
  const releaseLeaders = Array.from(authorReleaseCount.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const prLeaders = Array.from(authorPRCount.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate average release time (excluding null values)
  const validReleaseTimes = releases
    .map(r => r.time_since_last_release)
    .filter((time): time is number => time !== null && time > 0);

  const avgReleaseTime = validReleaseTimes.length > 0
    ? Math.abs(validReleaseTimes.reduce((sum, time) => sum + time, 0) / validReleaseTimes.length)
    : 0;
  let issuesQA = mobileMetricsData.issues.filter(issue => "Ready for QA" == issue.status)
  const issuesPassedQA = mobileMetricsData.issues.filter(issue => {
    const today = new Date();
    const issueDate = new Date(issue.updated_at);

    // 7 days ago from today
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    return issue.status === "QA Passed/Done" && issueDate >= sevenDaysAgo && issueDate <= today;
  });

  return {
    totalReleases: releases.length,
    totalPRs,
    issuesInQA: issuesQA.length,
    issuesPassedQA: issuesPassedQA.length,
    avgReleaseTime: Math.round(avgReleaseTime * 10) / 10,
    releaseLeaders,
    prLeaders
  };
};

// Helper function to convert releases to timeline data
const convertToReleaseTimeline = (releases: Release[]): ReleaseTimeline[] => {
  return releases.map(release => ({
    version: release.version,
    days: Math.abs(release.time_since_last_release || 0),
    publishedAt: release.published_at
  }));
};

// Data service functions
export const getMetrics = async (): Promise<Metrics> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const releases = mobileMetricsData.releases as Release[];
  return calculateMetrics(releases);
};

export const getReleases = async (): Promise<Release[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));

  return mobileMetricsData.releases as Release[];
};

export const getReleaseTimeline = async (limit?: number): Promise<ReleaseTimeline[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 350));

  const releases = mobileMetricsData.releases as Release[];
  const timeline = convertToReleaseTimeline(releases);

  return limit && limit > 0 ? timeline.slice(0, limit) : timeline;
};

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) : 0;
}

function groupd(prs, noDays: number) {
  const now = new Date();
  return Array.from({ length: noDays }, (_, i) => {
    const day = new Date(now);
    day.setDate(day.getDate() - (noDays - i)); // oldest first
    const prsOnDay = prs.filter(pr => {
      const merged = new Date(pr.merged_at);
      return merged.toDateString() === day.toDateString();
    }).map(pr => pr.time_to_merge);

    return {
      period: day.toISOString().split("T")[0],
      avgMergeTime: Math.round(avg(prsOnDay))
    };
  });
}

// --- All time grouped yearly ---
function groupAll(prs: any) {
  const map = {};
  prs.forEach(pr => {
    const year = new Date(pr.merged_at).getFullYear();
    if (!map[year]) map[year] = [];
    map[year].push(pr.time_to_merge);
  });
  return Object.entries(map).map(([year, times]) => ({
    period: year,
    avgMergeTime: Math.round(avg(times))
  }));
}

export function PRsDataByTime() {
  const prs = mobileMetricsData.pull_requests.filter(pr => pr.merged_at && pr.time_to_merge !== null);
  const mockPRData = {
    "7d": groupd(prs, 7),
    "30d": groupd(prs, 30),
    "all": groupAll(prs)
  };
  return mockPRData
}