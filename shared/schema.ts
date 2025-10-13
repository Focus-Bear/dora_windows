import { z } from "zod";

export const releaseSchema = z.object({
  release_id: z.string(),
  version: z.string(),
  name: z.string(),
  author: z.string(),
  body: z.string(),
  published_at: z.string(),
  time_since_last_release: z.number().nullable(),
  pr_count: z.number()
});

export const analyticsDataSchema = z.object({
  releases: z.array(releaseSchema)
});

export const metricsSchema = z.object({
  totalReleases: z.number(),
  totalPRs: z.number(),
  issuesInQA: z.number(),
  issuesPassedQA: z.number(),
  avgReleaseTime: z.number(),
  releaseLeaders: z.array(z.object({
    author: z.string(),
    count: z.number()
  })),
  prLeaders: z.array(z.object({
    author: z.string(),
    count: z.number()
  }))
});

export const releaseTimelineSchema = z.object({
  version: z.string(),
  days: z.number(),
  publishedAt: z.string()
});

export type Release = z.infer<typeof releaseSchema>;
export type AnalyticsData = z.infer<typeof analyticsDataSchema>;
export type Metrics = z.infer<typeof metricsSchema>;
export type ReleaseTimeline = z.infer<typeof releaseTimelineSchema>;
