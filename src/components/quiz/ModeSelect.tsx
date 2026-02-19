"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, ArrowUpDown, Flag } from "lucide-react";

type GameMode = "guess-driver" | "higher-or-lower" | "guess-race";

interface ModeSelectProps {
  onSelect: (mode: GameMode) => void;
}

const MODES: {
  id: GameMode;
  icon: React.ReactNode;
  title: string;
  description: string;
}[] = [
  {
    id: "guess-driver",
    icon: <Brain className="h-8 w-8" />,
    title: "Guess the Driver",
    description: "Given season stats, guess which driver it is",
  },
  {
    id: "higher-or-lower",
    icon: <ArrowUpDown className="h-8 w-8" />,
    title: "Higher or Lower",
    description: "Compare two drivers on a stat — who has more?",
  },
  {
    id: "guess-race",
    icon: <Flag className="h-8 w-8" />,
    title: "Guess the Race",
    description: "Given circuit clues, name the Grand Prix",
  },
];

export function ModeSelect({ onSelect }: ModeSelectProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {MODES.map((mode) => (
        <Card
          key={mode.id}
          onClick={() => onSelect(mode.id)}
          className="cursor-pointer transition-colors hover:border-primary"
        >
          <CardHeader>
            <div className="mb-2 text-muted-foreground">{mode.icon}</div>
            <CardTitle>{mode.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{mode.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
