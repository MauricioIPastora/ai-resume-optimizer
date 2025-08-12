import type { UnifiedJob, OptimizeResponse } from "@/types/jobs";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is required");
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new ApiError(
      response.status,
      `API Error ${response.status}: ${errorText}`
    );
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiError(response.status, "Invalid JSON response from server");
  }
}

export async function searchJobs(params: {
  query: string[];
  location?: string[];
  remote?: boolean;
}): Promise<UnifiedJob[]> {
  try {
    const searchParams = new URLSearchParams();

    // Add each query tag as a separate parameter
    params.query.forEach((q) => searchParams.append("query", q));

    // Add each location tag as a separate parameter
    if (params.location && params.location.length > 0) {
      params.location.forEach((loc) => searchParams.append("location", loc));
    }

    // Add remote parameter if specified
    if (params.remote !== undefined) {
      searchParams.append("remote", params.remote.toString());
    }

    const response = await fetch(`${API_BASE_URL}/search?${searchParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleResponse<UnifiedJob[]>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function presignResume(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; objectKey: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/presign-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename, contentType }),
    });

    return await handleResponse<{ uploadUrl: string; objectKey: string }>(
      response
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function optimizeResume(body: {
  job: UnifiedJob;
  resumeS3Key?: string;
  resumeText?: string;
}): Promise<OptimizeResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return await handleResponse<OptimizeResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      `Network error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
