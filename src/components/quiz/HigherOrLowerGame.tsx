"use client";

import { cn } from "@/lib/utils";
import type { Question } from "@/lib/utils/quiz/generateGuessDriver";
import type { GamePhase } from "./QuizClient";

interface GameProps {
  question: Question | null;
  state: {
    phase: GamePhase;
    selectedAnswer: string | null;
    isCorrect: boolean | null;
  };
  onAnswer: (choice: string) => void;
}

export function HigherOrLowerGame({ question, state, onAnswer }: GameProps) {
  if (!question) return null;

  const meta = question.metadata as {
    driverA: string;
    driverB: string;
    stat: string;
    valueA: number;
    valueB: number;
  };

  return (
    <div className="space-y-6">
      <p className="text-xl font-medium">{question.prompt}</p>

      {state.phase === "feedback" && meta && (
        <p className="text-sm text-muted-foreground">
          {meta.driverA}: <span className="font-semibold text-foreground">{meta.valueA}</span>
          {" | "}
          {meta.driverB}: <span className="font-semibold text-foreground">{meta.valueB}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => onAnswer(choice)}
            disabled={state.phase === "feedback"}
            className={cn(
              "w-full rounded-lg border px-4 py-6 text-center text-lg font-semibold transition-colors",
              state.phase === "feedback" && choice === question.correctAnswer
                ? "border-green-500 bg-green-500/10 text-green-400"
                : state.phase === "feedback" &&
                    choice === state.selectedAnswer &&
                    !state.isCorrect
                  ? "border-red-500 bg-red-500/10 text-red-400"
                  : state.phase === "feedback"
                    ? "border-border opacity-50"
                    : "cursor-pointer border-border hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
}
