import { Search, Briefcase } from "lucide-react";

interface EmptyStateProps {
  type: "initial" | "no-results";
  query?: string;
}

export function EmptyState({ type, query }: EmptyStateProps) {
  if (type === "initial") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Find Your Perfect Job</h3>
        <p className="text-muted-foreground max-w-md">
          Search for job opportunities and optimize your resume with AI to
          increase your chances of landing interviews.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No jobs found</h3>
      <p className="text-muted-foreground max-w-md">
        {query ? (
          <>
            No results found for "<span className="font-medium">{query}</span>".
            Try adjusting your search terms or location.
          </>
        ) : (
          "Try adjusting your search terms or location to find more opportunities."
        )}
      </p>
    </div>
  );
}
