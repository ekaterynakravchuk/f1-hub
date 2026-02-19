import { JolpikaDriverStanding } from "@/lib/api/jolpica/types";
import { shuffleArray, pickRandom, pickN } from "./shuffleArray";

export interface Question {
  prompt: string;
  choices: string[];
  correctAnswer: string;
  metadata?: Record<string, unknown>;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

type PromptTemplate = (
  points: string,
  wins: string,
  position: string,
  constructor: string,
  fullName: string
) => string;

const TEMPLATES: PromptTemplate[] = [
  (points, _wins, _position, constructor) =>
    `This driver scored ${points} points in the 2024 season, driving for ${constructor}`,
  (_points, wins, position) =>
    `This driver won ${wins} race(s) in 2024 and finished ${ordinal(parseInt(position))} in the championship`,
  (_points, _wins, position, _constructor, _fullName) =>
    `This driver finished ${ordinal(parseInt(position))} in the 2024 drivers' championship`,
];

export function generateGuessDriver(standings: JolpikaDriverStanding[]): Question {
  if (standings.length < 4) {
    throw new Error("generateGuessDriver requires at least 4 standings entries");
  }

  const correct = pickRandom(standings);
  const remaining = standings.filter((s) => s !== correct);
  const distractors = pickN(remaining, 3);

  const fullName = `${correct.Driver.givenName} ${correct.Driver.familyName}`;
  const constructor = correct.Constructors[0]?.name ?? "an unknown team";
  const template = pickRandom(TEMPLATES);
  const prompt = template(correct.points, correct.wins, correct.position, constructor, fullName);

  const choices = shuffleArray([
    fullName,
    ...distractors.map((d) => `${d.Driver.givenName} ${d.Driver.familyName}`),
  ]);

  return {
    prompt,
    choices,
    correctAnswer: fullName,
    metadata: { driverName: fullName },
  };
}
