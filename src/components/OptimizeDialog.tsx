"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Sparkles,
  Copy,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { UnifiedJob, OptimizeResponse } from "@/types/jobs";
import { presignResume, optimizeResume } from "@/lib/api";
import { copyToClipboard, formatDate } from "@/lib/utils";
import {
  downloadAsMarkdown,
  formatOptimizationAsMarkdown,
} from "@/lib/download";
import { toast } from "sonner";

interface OptimizeDialogProps {
  job: UnifiedJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";
type OptimizeState = "idle" | "optimizing" | "success" | "error";

export function OptimizeDialog({
  job,
  open,
  onOpenChange,
}: OptimizeDialogProps) {
  const [activeTab, setActiveTab] = useState("upload");
  const [resumeText, setResumeText] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [optimizeState, setOptimizeState] = useState<OptimizeState>("idle");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    key: string;
  } | null>(null);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dateInfo = job?.postedAt ? formatDate(job.postedAt) : null;

  const resetDialog = () => {
    setActiveTab("upload");
    setResumeText("");
    setUploadState("idle");
    setOptimizeState("idle");
    setUploadedFile(null);
    setOptimizationResult(null);
    setError(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a PDF or DOCX file.",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please upload a file smaller than 5MB.",
      });
      return;
    }

    setUploadState("uploading");
    setError(null);

    try {
      // Get presigned URL
      const { uploadUrl, objectKey } = await presignResume(
        file.name,
        file.type
      );

      // Upload file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      setUploadedFile({ name: file.name, key: objectKey });
      setUploadState("success");
      toast.success("File uploaded successfully", {
        description: `${file.name} is ready for optimization.`,
      });
    } catch (err) {
      setUploadState("error");
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload file";
      setError(errorMessage);
      toast.error("Upload failed", {
        description: errorMessage,
      });
    }
  };

  const handleOptimize = async () => {
    if (!job) return;

    const hasResumeData =
      (activeTab === "upload" && uploadedFile) ||
      (activeTab === "paste" && resumeText.trim());

    if (!hasResumeData) {
      toast.error("Resume required", {
        description: "Please upload a file or paste your resume text.",
      });
      return;
    }

    setOptimizeState("optimizing");
    setError(null);

    try {
      const requestBody = {
        job,
        ...(activeTab === "upload" && uploadedFile
          ? { resumeS3Key: uploadedFile.key }
          : {}),
        ...(activeTab === "paste" && resumeText.trim()
          ? { resumeText: resumeText.trim() }
          : {}),
      };

      const result = await optimizeResume(requestBody);
      setOptimizationResult(result);
      setOptimizeState("success");
    } catch (err) {
      setOptimizeState("error");
      const errorMessage =
        err instanceof Error ? err.message : "Failed to optimize resume";
      setError(errorMessage);
      toast.error("Optimization failed", {
        description: errorMessage,
      });
    }
  };

  const handleCopyAll = async () => {
    if (!optimizationResult || !job) return;

    const content = formatOptimizationAsMarkdown(
      job.title,
      job.companyName,
      optimizationResult.summary,
      optimizationResult.bullets,
      optimizationResult.coverLetter
    );

    const success = await copyToClipboard(content);
    toast.success(success ? "Copied to clipboard" : "Copy failed", {
      description: success
        ? "All optimization content copied."
        : "Please try again.",
    });
  };

  const handleDownload = () => {
    if (!optimizationResult || !job) return;

    const content = formatOptimizationAsMarkdown(
      job.title,
      job.companyName,
      optimizationResult.summary,
      optimizationResult.bullets,
      optimizationResult.coverLetter
    );

    downloadAsMarkdown(
      content,
      `resume-optimization-${job.companyName
        .toLowerCase()
        .replace(/\s+/g, "-")}.md`
    );
  };

  const handleGoToJob = () => {
    if (job?.applyUrl) {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    }
  };

  const copyBullets = async () => {
    if (!optimizationResult) return;
    const bulletsText = optimizationResult.bullets
      .map((bullet) => `• ${bullet}`)
      .join("\n");
    const success = await copyToClipboard(bulletsText);
    toast.success(success ? "Bullets copied" : "Copy failed", {
      description: success
        ? "Resume bullets copied to clipboard."
        : "Please try again.",
    });
  };

  if (!job) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) resetDialog();
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Optimize Resume</DialogTitle>
          <DialogDescription>
            Tailor your resume for this specific job opportunity using AI.
          </DialogDescription>
        </DialogHeader>

        {/* Job Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <p className="text-muted-foreground">{job.companyName}</p>
              </div>
              <Badge variant="secondary">{job.source}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {job.locationRaw && <span>{job.locationRaw}</span>}
              {job.remote && (
                <Badge variant="outline" className="text-xs">
                  Remote
                </Badge>
              )}
              {dateInfo && <span>Posted {dateInfo.relative}</span>}
            </div>
          </CardContent>
        </Card>

        {optimizeState === "success" && optimizationResult ? (
          /* Results View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Optimization Results</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyAll}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download .md
                </Button>
                <Button size="sm" onClick={handleGoToJob}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Go to Job Posting
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {optimizationResult.summary}
                  </p>
                </CardContent>
              </Card>

              {/* Bullets */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Tailored Bullets
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={copyBullets}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {optimizationResult.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-1">•</span>
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Cover Letter */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {optimizationResult.coverLetter}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Input View */
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                    disabled={uploadState === "uploading"}
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-4">
                      {uploadState === "uploading" ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : uploadState === "success" ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : uploadState === "error" ? (
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}

                      <div>
                        {uploadedFile ? (
                          <div>
                            <p className="font-medium text-green-600">
                              File uploaded successfully
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {uploadedFile.name}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">
                              {uploadState === "uploading"
                                ? "Uploading..."
                                : "Click to upload resume"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PDF or DOCX files only, max 5MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="paste" className="space-y-4">
                <Textarea
                  placeholder="Paste your resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Paste the text content of your resume for optimization.
                </p>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            )}

            <Separator />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleOptimize}
                disabled={
                  optimizeState === "optimizing" ||
                  (activeTab === "upload" && !uploadedFile) ||
                  (activeTab === "paste" && !resumeText.trim())
                }
              >
                {optimizeState === "optimizing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Optimize Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
