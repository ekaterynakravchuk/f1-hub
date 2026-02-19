/**
 * Fisher-Yates (Knuth) shuffle — returns a new shuffled array, does not mutate input.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Returns a single random element from an array.
 */
export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Returns n random elements from an array (no repeats, order randomised).
 */
export function pickN<T>(array: T[], n: number): T[] {
  return shuffleArray(array).slice(0, n);
}
