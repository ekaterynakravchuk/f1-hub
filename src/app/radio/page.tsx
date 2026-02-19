import { Suspense } from "react";
import { RadioClient } from "@/components/radio/RadioClient";

export default function RadioPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
          <div className="mt-2 h-5 w-72 rounded-md bg-muted animate-pulse" />
        </div>
      }
    >
      <RadioClient />
    </Suspense>
  );
}
