"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/SearchBar";
import { JobCard } from "@/components/JobCard";
import { OptimizeDialog } from "@/components/OptimizeDialog";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { SetupBanner } from "@/components/SetupBanner";
import { searchJobs } from "@/lib/api";
import type { UnifiedJob } from "@/types/jobs";
import type { SearchParams } from "@/lib/validators";
import { Toaster } from "sonner";

export default function HomePage() {
  const [jobs, setJobs] = useState<UnifiedJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<UnifiedJob | null>(null);
  const [isOptimizeDialogOpen, setIsOptimizeDialogOpen] = useState(false);

  const isConfigured = !!process.env.NEXT_PUBLIC_API_BASE_URL;

  // Added keyboard shortcut for search focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("query");
        searchInput?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setLastQuery(params.query.join(", "));

    try {
      const results = await searchJobs(params);
      setJobs(results);
      setHasSearched(true);

      // Announce results to screen readers
      const announcement = `Found ${results.length} job${
        results.length !== 1 ? "s" : ""
      } for ${params.query}`;
      const ariaLive = document.createElement("div");
      ariaLive.setAttribute("aria-live", "polite");
      ariaLive.setAttribute("aria-atomic", "true");
      ariaLive.className = "sr-only";
      ariaLive.textContent = announcement;
      document.body.appendChild(ariaLive);
      setTimeout(() => document.body.removeChild(ariaLive), 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search jobs";
      setError(errorMessage);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSearch({ query: lastQuery.split(", ") });
    }
  };

  const handleOptimize = (job: UnifiedJob) => {
    setSelectedJob(job);
    setIsOptimizeDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Added skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            AI Resume Optimizer
          </h1>
          <p className="text-muted-foreground">
            Find jobs and optimize your resume with AI to land more interviews
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Press Cmd+K (Mac) or Ctrl+K (Windows) to focus search
          </p>
        </header>

        {/* Setup Banner */}
        {!isConfigured && <SetupBanner />}

        {/* Search Bar - Sticky */}
        <div className="sticky top-0 z-10 mb-8 rounded-lg border bg-white p-6 shadow-sm backdrop-blur-sm ">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Results */}
        <main id="main-content" className="space-y-6">
          {isLoading && (
            <div role="status" aria-label="Loading job results">
              <LoadingState />
            </div>
          )}

          {error && <ErrorState error={error} onRetry={handleRetry} />}

          {!isLoading && !error && !hasSearched && (
            <EmptyState type="initial" />
          )}

          {!isLoading && !error && hasSearched && jobs.length === 0 && (
            <EmptyState type="no-results" query={lastQuery} />
          )}

          {!isLoading && !error && jobs.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" id="results-heading">
                  Found {jobs.length} job{jobs.length !== 1 ? "s" : ""}
                </h2>
              </div>
              <div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
                role="list"
                aria-labelledby="results-heading"
              >
                {jobs.map((job, index) => (
                  <div
                    key={`${job.source}-${job.sourceId || index}`}
                    role="listitem"
                  >
                    <JobCard job={job} onOptimize={handleOptimize} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <OptimizeDialog
        job={selectedJob}
        open={isOptimizeDialogOpen}
        onOpenChange={setIsOptimizeDialogOpen}
      />

      <Toaster />
    </div>
  );
}
