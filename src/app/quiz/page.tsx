import { ModeSelect } from "@/components/quiz/ModeSelect";

export default function QuizPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-4xl font-bold">Quiz</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Test your Formula 1 knowledge
      </p>
      <div className="mt-8">
        <ModeSelect />
      </div>
    </div>
  );
}
