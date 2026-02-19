"use client";

import { useReducer, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useStandings } from "@/hooks/useStandings";
import { useRaces } from "@/hooks/useRaces";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { generateGuessDriver } from "@/lib/utils/quiz/generateGuessDriver";
import { generateHigherOrLower } from "@/lib/utils/quiz/generateHigherOrLower";
import { generateGuessRace } from "@/lib/utils/quiz/generateGuessRace";
import type { Question } from "@/lib/utils/quiz/generateGuessDriver";
import { GuessTheDriverGame } from "./GuessTheDriverGame";
import { HigherOrLowerGame } from "./HigherOrLowerGame";
import { GuessTheRaceGame } from "./GuessTheRaceGame";
import { ScoreBoard } from "./ScoreBoard";

const FEEDBACK_DELAY_MS = 1400;

export type GameMode = "guess-driver" | "higher-or-lower" | "guess-race";
export type GamePhase = "loading" | "playing" | "feedback";

interface GameState {
  phase: GamePhase;
  mode: GameMode;
  question: Question | null;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  score: number;
  streak: number;
}

type Action =
  | { type: "DATA_READY" }
  | { type: "NEXT_QUESTION"; question: Question }
  | { type: "ANSWER"; answer: string; isCorrect: boolean }
  | { type: "ADVANCE" };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "DATA_READY":
      return { ...state, phase: "playing" };
    case "NEXT_QUESTION":
      return {
        ...state,
        question: action.question,
        selectedAnswer: null,
        isCorrect: null,
        phase: "playing",
      };
    case "ANSWER": {
      const newScore = action.isCorrect ? state.score + 1 : state.score;
      const newStreak = action.isCorrect ? state.streak + 1 : 0;
      return {
        ...state,
        selectedAnswer: action.answer,
        isCorrect: action.isCorrect,
        score: newScore,
        streak: newStreak,
        phase: "feedback",
      };
    }
    case "ADVANCE":
      return { ...state, phase: "playing", question: null };
    default:
      return state;
  }
}

interface QuizClientProps {
  mode: GameMode;
}

export function QuizClient({ mode }: QuizClientProps) {
  const [state, dispatch] = useReducer(reducer, {
    phase: "loading",
    mode,
    question: null,
    selectedAnswer: null,
    isCorrect: null,
    score: 0,
    streak: 0,
  });

  const { data: standings, isPending: standingsPending } = useStandings("2024");
  const { data: races, isPending: racesPending } = useRaces("2024");

  const [bestScores, setBestScores] = useLocalStorage<Record<string, number>>(
    "quiz-best-scores",
    {}
  );

  const dataReady = (() => {
    if (mode === "guess-driver" || mode === "higher-or-lower")
      return !!standings && !standingsPending;
    if (mode === "guess-race") return !!races && !racesPending;
    return false;
  })();

  useEffect(() => {
    if (state.phase === "loading" && dataReady) {
      dispatch({ type: "DATA_READY" });
    }
  }, [state.phase, dataReady]);

  useEffect(() => {
    if (state.phase !== "playing" || state.question !== null) return;

    try {
      let question: Question | null = null;

      if (mode === "guess-driver" && standings) {
        question = generateGuessDriver(standings);
      } else if (mode === "higher-or-lower" && standings) {
        question = generateHigherOrLower(standings);
      } else if (mode === "guess-race" && races) {
        question = generateGuessRace(races);
      }

      if (question) {
        dispatch({ type: "NEXT_QUESTION", question });
      }
    } catch {
      // Not enough data to generate question
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.question, mode]);

  useEffect(() => {
    if (
      state.phase === "feedback" &&
      state.isCorrect &&
      state.score > (bestScores[mode] ?? 0)
    ) {
      setBestScores((prev) => ({ ...prev, [mode]: state.score }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.score, mode, state.phase, state.isCorrect]);

  useEffect(() => {
    if (state.phase !== "feedback") return;
    const timeout = setTimeout(() => {
      dispatch({ type: "ADVANCE" });
    }, FEEDBACK_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [state.phase]);

  const handleAnswer = useCallback(
    (choice: string) => {
      if (state.phase !== "playing" || !state.question) return;
      const isCorrect = choice === state.question.correctAnswer;
      dispatch({ type: "ANSWER", answer: choice, isCorrect });
    },
    [state.phase, state.question]
  );

  const sessionBest = bestScores[mode] ?? 0;

  if (state.phase === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ScoreBoard
          score={state.score}
          streak={state.streak}
          sessionBest={sessionBest}
        />
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Quiz
        </Link>
      </div>

      {mode === "guess-driver" && (
        <GuessTheDriverGame
          question={state.question}
          state={state}
          onAnswer={handleAnswer}
        />
      )}
      {mode === "higher-or-lower" && (
        <HigherOrLowerGame
          question={state.question}
          state={state}
          onAnswer={handleAnswer}
        />
      )}
      {mode === "guess-race" && (
        <GuessTheRaceGame
          question={state.question}
          state={state}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
