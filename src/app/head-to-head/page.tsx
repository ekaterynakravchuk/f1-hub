import Link from "next/link";

export default function HeadToHeadPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Head-to-Head</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Compare any two F1 drivers side-by-side
        </p>
        <p className="mt-8 text-muted-foreground">Coming in Phase 4</p>
        <Link
          href="/"
          className="mt-8 inline-block text-foreground underline-offset-4 hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
