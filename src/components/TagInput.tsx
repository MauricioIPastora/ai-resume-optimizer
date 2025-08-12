"use client";

import { useState, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface TagInputProps {
  label: string;
  placeholder: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  id: string;
  helpText?: string;
}

export function TagInputField({
  label,
  placeholder,
  inputValue,
  onInputChange,
  onAddTag,
  disabled = false,
  required = false,
  id,
  helpText,
}: {
  label: string;
  placeholder: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAddTag: () => void;
  disabled?: boolean;
  required?: boolean;
  id: string;
  helpText?: string;
}) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAddTag();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && "*"}
      </Label>

      <div className="flex gap-2">
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1"
          aria-describedby={helpText ? `${id}-help` : undefined}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddTag}
          disabled={disabled || !inputValue.trim()}
          className="px-3 bg-transparent"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {helpText && (
        <p id={`${id}-help`} className="sr-only">
          {helpText}
        </p>
      )}
    </div>
  );
}

export function TagDisplay({
  tags,
  onRemoveTag,
  disabled = false,
  label,
}: {
  tags: string[];
  onRemoveTag: (tag: string) => void;
  disabled?: boolean;
  label: string;
}) {
  if (tags.length === 0) return null;

  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground font-medium">
        {label}:
      </span>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              disabled={disabled}
              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function TagInput({
  label,
  placeholder,
  tags,
  onTagsChange,
  disabled = false,
  required = false,
  id,
  helpText,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <TagInputField
        label={label}
        placeholder={placeholder}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onAddTag={addTag}
        disabled={disabled}
        required={required}
        id={id}
        helpText={helpText}
      />
      <TagDisplay
        tags={tags}
        onRemoveTag={removeTag}
        disabled={disabled}
        label={label}
      />
    </div>
  );
}
