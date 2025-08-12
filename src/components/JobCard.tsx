"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles, MapPin, Calendar } from "lucide-react";
import type { UnifiedJob } from "@/types/jobs";
import { formatDate } from "@/lib/utils";

interface JobCardProps {
  job: UnifiedJob;
  onOptimize: (job: UnifiedJob) => void;
}

export function JobCard({ job, onOptimize }: JobCardProps) {
  const dateInfo = job.postedAt ? formatDate(job.postedAt) : null;

  const handleOpenPosting = () => {
    window.open(job.applyUrl, "_blank", "noopener,noreferrer");
  };

  const getSourceColor = (source: UnifiedJob["source"]) => {
    const colors = {
      usajobs: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      remotive: "bg-green-100 text-green-800 hover:bg-green-200",
      lever: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      greenhouse: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      google_jobs: "bg-red-100 text-red-800 hover:bg-red-200",
      google_search: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    };
    return colors[source] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const getSourceLabel = (source: UnifiedJob["source"]) => {
    const labels = {
      usajobs: "USAJobs",
      remotive: "Remotive",
      lever: "Lever",
      greenhouse: "Greenhouse",
      google_jobs: "Google Jobs",
      google_search: "Google Search",
    };
    return labels[source] || source;
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-lg leading-tight mb-1 line-clamp-2"
              title={job.title}
            >
              {job.title}
            </h3>
            <p
              className="text-muted-foreground font-medium"
              title={job.companyName}
            >
              {job.companyName}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={`${getSourceColor(
              job.source
            )} transition-colors shrink-0`}
            title={`Source: ${getSourceLabel(job.source)}`}
          >
            {getSourceLabel(job.source)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Location and Date Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {job.locationRaw && (
              <div
                className="flex items-center gap-1"
                title={`Location: ${job.locationRaw}`}
              >
                <MapPin className="h-3 w-3" aria-hidden="true" />
                <span>{job.locationRaw}</span>
              </div>
            )}
            {job.remote && (
              <Badge
                variant="outline"
                className="text-xs"
                title="Remote work available"
              >
                Remote
              </Badge>
            )}
            {dateInfo && (
              <div
                className="flex items-center gap-1"
                title={dateInfo.absolute}
              >
                <Calendar className="h-3 w-3" aria-hidden="true" />
                <span>{dateInfo.relative}</span>
              </div>
            )}
          </div>

          {/* Description Preview */}
          {job.descriptionText && (
            <p
              className="text-sm text-muted-foreground line-clamp-2"
              title={job.descriptionText}
            >
              {job.descriptionText}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={() => onOptimize(job)}
              className="flex-1 sm:flex-none transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-primary/20"
              aria-label={`Optimize resume for ${job.title} at ${job.companyName}`}
            >
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
              Optimize Resume
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenPosting}
              className="flex-1 sm:flex-none bg-transparent transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-primary/20"
              aria-label={`Open job posting for ${job.title} at ${job.companyName} in new tab`}
            >
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
              Open Posting
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
