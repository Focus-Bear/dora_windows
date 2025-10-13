import type { Release, AnalyticsData } from "@shared/schema";

export function calculateReleaseMetrics(releases: Release[]) {
  const totalReleases = releases.length;
  const totalPRs = releases.reduce((sum, release) => sum + release.pr_count, 0);
  
  // Calculate average time between releases
  const validTimes = releases
    .map(r => r.time_since_last_release)
    .filter((time): time is number => time !== null)
    .map(time => Math.abs(time));
  
  const avgReleaseTime = validTimes.length > 0 
    ? validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length 
    : 0;

  return {
    totalReleases,
    totalPRs,
    avgReleaseTime: Math.round(avgReleaseTime * 10) / 10
  };
}

export function groupReleasesByAuthor(releases: Release[]) {
  const releaseCount = new Map<string, number>();
  const prCount = new Map<string, number>();

  releases.forEach(release => {
    // Count releases per author
    const releaseCountForAuthor = releaseCount.get(release.author) || 0;
    releaseCount.set(release.author, releaseCountForAuthor + 1);

    // Count PRs per author (using PR count as proxy for contribution)
    const prCountForAuthor = prCount.get(release.author) || 0;
    prCount.set(release.author, prCountForAuthor + release.pr_count);
  });

  const releaseLeaders = Array.from(releaseCount.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count);

  const prLeaders = Array.from(prCount.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count);

  return { releaseLeaders, prLeaders };
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} months ago`;
}

export function filterReleasesByTimeframe(releases: Release[], timeframe: "7d" | "30d" | "all"): Release[] {
  if (timeframe === "all") return releases;
  
  const now = new Date();
  const daysToSubtract = timeframe === "7d" ? 7 : 30;
  const cutoffDate = new Date(now.getTime() - (daysToSubtract * 24 * 60 * 60 * 1000));
  
  return releases.filter(release => new Date(release.published_at) >= cutoffDate);
}


