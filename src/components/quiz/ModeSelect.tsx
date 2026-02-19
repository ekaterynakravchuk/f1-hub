import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, ArrowUpDown, Flag } from "lucide-react";

const MODES = [
  {
    id: "guess-driver",
    href: "/quiz/guess-driver",
    icon: <Brain className="h-8 w-8" />,
    title: "Guess the Driver",
    description: "Given season stats, guess which driver it is",
  },
  {
    id: "higher-or-lower",
    href: "/quiz/higher-or-lower",
    icon: <ArrowUpDown className="h-8 w-8" />,
    title: "Higher or Lower",
    description: "Compare two drivers on a stat — who has more?",
  },
  {
    id: "guess-race",
    href: "/quiz/guess-race",
    icon: <Flag className="h-8 w-8" />,
    title: "Guess the Race",
    description: "Given circuit clues, name the Grand Prix",
  },
];

export function ModeSelect() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {MODES.map((mode) => (
        <Link key={mode.id} href={mode.href}>
          <Card className="h-full cursor-pointer transition-colors hover:border-primary">
            <CardHeader>
              <div className="mb-2 text-muted-foreground">{mode.icon}</div>
              <CardTitle>{mode.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{mode.description}</CardDescription>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
