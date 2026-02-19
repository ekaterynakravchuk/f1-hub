import { QuizClient } from "@/components/quiz/QuizClient";

export default function GuessDriverPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-4xl font-bold">Guess the Driver</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Given season stats, guess which driver it is
      </p>
      <div className="mt-8">
        <QuizClient mode="guess-driver" />
      </div>
    </div>
  );
}
