"use client";

import { AlertCircle } from "lucide-react";

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({
  message = "Something went wrong",
  onRetry,
}: QueryErrorProps) {
  return (
    <div className="flex items-center gap-2 text-destructive text-sm">
      <AlertCircle className="size-4 shrink-0" />
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="underline text-muted-foreground hover:text-foreground text-xs"
        >
          Retry
        </button>
      )}
    </div>
  );
}
