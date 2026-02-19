"use client";

import { Flame } from "lucide-react";

interface ScoreBoardProps {
  score: number;
  streak: number;
  sessionBest: number;
}

export function ScoreBoard({ score, streak, sessionBest }: ScoreBoardProps) {
  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <span>
        Score:{" "}
        <span className="font-semibold text-foreground">{score}</span>
      </span>
      <span className="flex items-center gap-1">
        Streak:{" "}
        <span className="font-semibold text-foreground">{streak}</span>
        {streak >= 3 && (
          <Flame className="h-4 w-4 text-orange-400" aria-label="On fire!" />
        )}
      </span>
      <span>
        Best:{" "}
        <span className="font-semibold text-foreground">{sessionBest}</span>
      </span>
    </div>
  );
}
