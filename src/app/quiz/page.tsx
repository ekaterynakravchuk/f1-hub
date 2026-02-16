import Link from "next/link";

export default function QuizPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Quiz</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Test your Formula 1 knowledge
        </p>
        <p className="mt-8 text-muted-foreground">Coming soon</p>
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
