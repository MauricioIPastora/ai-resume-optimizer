"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { searchParamsSchema, type SearchParams } from "@/lib/validators";
import { toast } from "sonner";
import { TagInputField, TagDisplay } from "@/components/TagInput";

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [queryTags, setQueryTags] = useState<string[]>([]);
  const [locationTags, setLocationTags] = useState<string[]>([]);
  const [remote, setRemote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [queryInput, setQueryInput] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const addQueryTag = () => {
    const trimmedValue = queryInput.trim();
    if (trimmedValue && !queryTags.includes(trimmedValue)) {
      setQueryTags([...queryTags, trimmedValue]);
      setQueryInput("");
    }
  };

  const addLocationTag = () => {
    const trimmedValue = locationInput.trim();
    if (trimmedValue && !locationTags.includes(trimmedValue)) {
      setLocationTags([...locationTags, trimmedValue]);
      setLocationInput("");
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isSubmitting || isLoading) return;

      setIsSubmitting(true);

      const result = searchParamsSchema.safeParse({
        query: queryTags,
        location: locationTags.length > 0 ? locationTags : undefined,
        remote,
      });

      if (!result.success) {
        toast.error("Invalid search parameters", {
          description: "Please check your input",
        });
        setIsSubmitting(false);
        return;
      }

      try {
        await onSearch(result.data);
      } finally {
        setTimeout(() => setIsSubmitting(false), 1000);
      }
    },
    [queryTags, locationTags, remote, onSearch, isSubmitting, isLoading]
  );

  const isDisabled = isLoading || isSubmitting || queryTags.length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full space-y-4"
      role="search"
      aria-label="Job search form"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex-1 space-y-2">
          <TagInputField
            id="query"
            label="Role / Keywords"
            placeholder="e.g., Software Engineer, Frontend Developer"
            inputValue={queryInput}
            onInputChange={setQueryInput}
            onAddTag={addQueryTag}
            disabled={isLoading || isSubmitting}
            required
            helpText="Enter job titles, skills, or keywords to search for"
          />
          {queryTags.length > 0 && (
            <TagDisplay
              tags={queryTags}
              onRemoveTag={(tag) =>
                setQueryTags(queryTags.filter((t) => t !== tag))
              }
              disabled={isLoading || isSubmitting}
              label="Role / Keywords"
            />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <TagInputField
            id="location"
            label="Location"
            placeholder="e.g., San Francisco, Remote"
            inputValue={locationInput}
            onInputChange={setLocationInput}
            onAddTag={addLocationTag}
            disabled={isLoading || isSubmitting}
            helpText="Enter cities, states, or leave blank for all locations"
          />
          {locationTags.length > 0 && (
            <TagDisplay
              tags={locationTags}
              onRemoveTag={(tag) =>
                setLocationTags(locationTags.filter((t) => t !== tag))
              }
              disabled={isLoading || isSubmitting}
              label="Location"
            />
          )}
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end md:pt-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="remote"
              checked={remote}
              onCheckedChange={setRemote}
              disabled={isLoading || isSubmitting}
              aria-describedby="remote-help"
            />
            <Label
              htmlFor="remote"
              className="text-sm font-medium cursor-pointer"
            >
              Remote only
            </Label>
            <p id="remote-help" className="sr-only">
              Filter to show only remote job opportunities
            </p>
          </div>

          <Button
            type="submit"
            disabled={isDisabled}
            className="md:px-8 transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-primary/20"
            aria-describedby="search-button-help"
          >
            {isLoading || isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
          <p id="search-button-help" className="sr-only">
            Click to search for jobs matching your criteria
          </p>
        </div>
      </div>
    </form>
  );
}
