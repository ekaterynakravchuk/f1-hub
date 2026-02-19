/**
 * Format seconds to mm:ss display string for audio player.
 * Returns "0:00" for invalid inputs (NaN, Infinity, negative).
 */
export function formatAudioTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
