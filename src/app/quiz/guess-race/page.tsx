import { QuizClient } from "@/components/quiz/QuizClient";

export default function GuessRacePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-4xl font-bold">Guess the Race</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Given circuit clues, name the Grand Prix
      </p>
      <div className="mt-8">
        <QuizClient mode="guess-race" />
      </div>
    </div>
  );
}
