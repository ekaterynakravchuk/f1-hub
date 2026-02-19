import { JolpikaRace } from "@/lib/api/jolpica/types";
import { shuffleArray, pickRandom, pickN } from "./shuffleArray";
import type { Question } from "./generateGuessDriver";

type RacePromptTemplate = (race: JolpikaRace) => string;

const TEMPLATES: RacePromptTemplate[] = [
  (race) =>
    `The 2024 race held in ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
  (race) => `Round ${race.round} of the 2024 season, held on ${race.date}`,
  (race) => `The race held at ${race.Circuit.circuitName} in 2024`,
];

export function generateGuessRace(races: JolpikaRace[]): Question {
  if (races.length < 4) {
    throw new Error("generateGuessRace requires at least 4 races");
  }

  const correct = pickRandom(races);
  const remaining = races.filter((r) => r.raceName !== correct.raceName);
  const distractors = pickN(remaining, 3);

  const template = pickRandom(TEMPLATES);
  const prompt = template(correct);

  const choices = shuffleArray([
    correct.raceName,
    ...distractors.map((r) => r.raceName),
  ]);

  return {
    prompt,
    choices,
    correctAnswer: correct.raceName,
  };
}
