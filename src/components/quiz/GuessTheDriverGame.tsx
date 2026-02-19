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

export function GuessTheDriverGame({ question, state, onAnswer }: GameProps) {
  if (!question) return null;

  return (
    <div className="space-y-6">
      <p className="text-xl font-medium">{question.prompt}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => onAnswer(choice)}
            disabled={state.phase === "feedback"}
            className={cn(
              "w-full rounded-lg border px-4 py-3 text-left transition-colors",
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
