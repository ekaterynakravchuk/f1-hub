import { Suspense } from "react";
import { HeadToHeadClient } from "@/components/head-to-head/HeadToHeadClient";

interface PageProps {
  searchParams: Promise<{ d1?: string; d2?: string }>;
}

export default async function HeadToHeadPage({ searchParams }: PageProps) {
  const { d1, d2 } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
          <div className="mt-2 h-5 w-72 rounded-md bg-muted animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="h-10 rounded-md bg-muted animate-pulse" />
            <div className="h-10 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      }
    >
      <HeadToHeadClient initialD1={d1} initialD2={d2} />
    </Suspense>
  );
}
