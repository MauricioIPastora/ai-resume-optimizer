import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SetupBanner() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Configuration Required</AlertTitle>
      <AlertDescription>
        Please set the{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-sm">
          NEXT_PUBLIC_API_BASE_URL
        </code>{" "}
        environment variable to connect to your backend API. Check your{" "}
        <code className="bg-muted px-1 py-0.5 rounded text-sm">.env.local</code>{" "}
        file.
      </AlertDescription>
    </Alert>
  );
}
