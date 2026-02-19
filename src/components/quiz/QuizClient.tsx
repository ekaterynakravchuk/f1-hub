"use client";

import { useReducer, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useStandings } from "@/hooks/useStandings";
import { useRaces } from "@/hooks/useRaces";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { generateGuessDriver } from "@/lib/utils/quiz/generateGuessDriver";
import { generateHigherOrLower } from "@/lib/utils/quiz/generateHigherOrLower";
import { generateGuessRace } from "@/lib/utils/quiz/generateGuessRace";
import type { Question } from "@/lib/utils/quiz/generateGuessDriver";
import { ModeSelect } from "./ModeSelect";
import { GuessTheDriverGame } from "./GuessTheDriverGame";
import { HigherOrLowerGame } from "./HigherOrLowerGame";
import { GuessTheRaceGame } from "./GuessTheRaceGame";
import { ScoreBoard } from "./ScoreBoard";

const FEEDBACK_DELAY_MS = 1400;

export type GameMode = "guess-driver" | "higher-or-lower" | "guess-race";
export type GamePhase = "idle" | "loading" | "playing" | "feedback";

export interface GameState {
  phase: GamePhase;
  mode: GameMode | null;
  question: Question | null;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  score: number;
  streak: number;
}

const initialState: GameState = {
  phase: "idle",
  mode: null,
  question: null,
  selectedAnswer: null,
  isCorrect: null,
  score: 0,
  streak: 0,
};

type Action =
  | { type: "SELECT_MODE"; mode: GameMode }
  | { type: "DATA_READY" }
  | { type: "NEXT_QUESTION"; question: Question }
  | { type: "ANSWER"; answer: string; isCorrect: boolean }
  | { type: "ADVANCE" }
  | { type: "RESET" };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SELECT_MODE":
      return {
        ...initialState,
        phase: "loading",
        mode: action.mode,
      };
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
    case "RESET":
      return { ...initialState };
    default:
      return state;
  }
}

export function QuizClient() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { data: standings, isPending: standingsPending } = useStandings("2024");
  const { data: races, isPending: racesPending } = useRaces("2024");

  const [bestScores, setBestScores] = useLocalStorage<Record<string, number>>(
    "quiz-best-scores",
    {}
  );

  // Mode-conditional data readiness
  const dataReady = (() => {
    if (state.mode === "guess-driver" || state.mode === "higher-or-lower")
      return !!standings && !standingsPending;
    if (state.mode === "guess-race") return !!races && !racesPending;
    return false;
  })();

  // Transition from loading to playing when data is ready
  useEffect(() => {
    if (state.phase === "loading" && dataReady) {
      dispatch({ type: "DATA_READY" });
    }
  }, [state.phase, dataReady]);

  // Generate a question when playing with no current question
  useEffect(() => {
    if (state.phase !== "playing" || state.question !== null) return;

    try {
      let question: Question | null = null;

      if (state.mode === "guess-driver" && standings) {
        question = generateGuessDriver(standings);
      } else if (state.mode === "higher-or-lower" && standings) {
        question = generateHigherOrLower(standings);
      } else if (state.mode === "guess-race" && races) {
        question = generateGuessRace(races);
      }

      if (question) {
        dispatch({ type: "NEXT_QUESTION", question });
      }
    } catch {
      // Not enough data to generate question — stay in playing state
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.question, state.mode]);

  // Persist session best scores
  useEffect(() => {
    if (
      state.phase === "feedback" &&
      state.isCorrect &&
      state.mode &&
      state.score > (bestScores[state.mode] ?? 0)
    ) {
      setBestScores((prev) => ({ ...prev, [state.mode!]: state.score }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.score, state.mode, state.phase, state.isCorrect]);

  // Auto-advance after feedback
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

  const sessionBest = state.mode ? (bestScores[state.mode] ?? 0) : 0;

  if (state.phase === "idle") {
    return (
      <ModeSelect
        onSelect={(mode) => dispatch({ type: "SELECT_MODE", mode })}
      />
    );
  }

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
        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Quit
        </button>
      </div>

      {state.mode === "guess-driver" && (
        <GuessTheDriverGame
          question={state.question}
          state={state}
          onAnswer={handleAnswer}
        />
      )}
      {state.mode === "higher-or-lower" && (
        <HigherOrLowerGame
          question={state.question}
          state={state}
          onAnswer={handleAnswer}
        />
      )}
      {state.mode === "guess-race" && (
        <GuessTheRaceGame
          question={state.question}
          state={state}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
