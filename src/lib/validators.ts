import { z } from "zod";

export const searchParamsSchema = z.object({
  query: z
    .array(z.string().min(1))
    .min(1, "At least one role/keyword is required"),
  location: z.array(z.string()).optional(),
  remote: z.boolean().optional(),
});

export const optimizeRequestSchema = z
  .object({
    job: z.object({
      source: z.enum([
        "usajobs",
        "remotive",
        "lever",
        "greenhouse",
        "google_jobs",
        "google_search",
      ]),
      sourceId: z.string().optional(),
      title: z.string(),
      companyName: z.string(),
      locationRaw: z.string().optional(),
      remote: z.boolean().optional(),
      postedAt: z.string().optional(),
      applyUrl: z.string().url(),
      listingUrl: z.string().url().optional(),
      descriptionText: z.string().optional(),
    }),
    resumeS3Key: z.string().optional(),
    resumeText: z.string().optional(),
  })
  .refine((data) => data.resumeS3Key || data.resumeText, {
    message: "Either resumeS3Key or resumeText must be provided",
    path: ["resumeS3Key"],
  });

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type OptimizeRequest = z.infer<typeof optimizeRequestSchema>;
