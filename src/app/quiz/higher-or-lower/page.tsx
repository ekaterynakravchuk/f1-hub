import { QuizClient } from "@/components/quiz/QuizClient";

export default function HigherOrLowerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-4xl font-bold">Higher or Lower</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Compare two drivers on a stat — who has more?
      </p>
      <div className="mt-8">
        <QuizClient mode="higher-or-lower" />
      </div>
    </div>
  );
}
