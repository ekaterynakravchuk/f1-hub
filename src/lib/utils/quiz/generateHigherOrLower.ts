import { JolpikaDriverStanding } from "@/lib/api/jolpica/types";
import { pickRandom } from "./shuffleArray";
import type { Question } from "./generateGuessDriver";

interface ComparisonConfig {
  stat: string;
  getValue: (s: JolpikaDriverStanding) => number;
  /** If true, a lower numeric value means "better" (e.g. championship position) */
  lowerIsBetter?: boolean;
}

const COMPARISON_CONFIGS: ComparisonConfig[] = [
  {
    stat: "championship points in 2024",
    getValue: (s) => parseFloat(s.points),
  },
  {
    stat: "race wins in 2024",
    getValue: (s) => parseInt(s.wins, 10),
  },
  {
    stat: "championship position in 2024 (lower is better)",
    getValue: (s) => parseInt(s.position, 10),
    lowerIsBetter: true,
  },
];

export function generateHigherOrLower(standings: JolpikaDriverStanding[]): Question {
  let driverA: JolpikaDriverStanding;
  let driverB: JolpikaDriverStanding;
  let config: ComparisonConfig;
  let valA: number;
  let valB: number;

  const MAX_RETRIES = 10;
  let attempts = 0;
  let found = false;

  // Try random pairs until we get a non-tie
  while (attempts < MAX_RETRIES) {
    config = pickRandom(COMPARISON_CONFIGS);
    driverA = pickRandom(standings);
    driverB = pickRandom(standings.filter((s) => s !== driverA));
    valA = config.getValue(driverA);
    valB = config.getValue(driverB);
    if (valA !== valB) {
      found = true;
      break;
    }
    attempts++;
  }

  // Fallback: force a non-tie by scanning configs and pairs
  if (!found) {
    for (const cfg of COMPARISON_CONFIGS) {
      for (let i = 0; i < standings.length; i++) {
        for (let j = i + 1; j < standings.length; j++) {
          const a = cfg.getValue(standings[i]);
          const b = cfg.getValue(standings[j]);
          if (a !== b) {
            config = cfg;
            driverA = standings[i];
            driverB = standings[j];
            valA = a;
            valB = b;
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }
  }

  // TypeScript narrowing — after the loops above config/driverA/driverB/valA/valB are always set
  const resolvedConfig = config!;
  const resolvedDriverA = driverA!;
  const resolvedDriverB = driverB!;
  const resolvedValA = valA!;
  const resolvedValB = valB!;

  const nameA = `${resolvedDriverA.Driver.givenName} ${resolvedDriverA.Driver.familyName}`;
  const nameB = `${resolvedDriverB.Driver.givenName} ${resolvedDriverB.Driver.familyName}`;

  // Determine correct answer
  let correctAnswer: string;
  if (resolvedConfig.lowerIsBetter) {
    // Lower value = "more" (e.g. position 1 is more dominant than position 5)
    correctAnswer = resolvedValA < resolvedValB ? "More" : "Fewer";
  } else {
    correctAnswer = resolvedValA > resolvedValB ? "More" : "Fewer";
  }

  return {
    prompt: `Does ${nameA} have more or fewer ${resolvedConfig.stat} than ${nameB}?`,
    choices: ["More", "Fewer"],
    correctAnswer,
    metadata: {
      driverA: nameA,
      driverB: nameB,
      stat: resolvedConfig.stat,
      valueA: resolvedValA,
      valueB: resolvedValB,
    },
  };
}
