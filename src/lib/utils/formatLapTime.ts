// Source: MDN Date arithmetic, verified against Jolpica time formats
// Jolpica data formats:
//   Time.millis field — "83421" (string containing milliseconds)
//   Time.time field  — "1:23.421" (already formatted string, display as-is)
//   Result.status    — "Retired", "+1 Lap", "Collision" (pass-through strings)

/**
 * Converts milliseconds to m:ss.SSS format.
 * Returns "—" (em dash) for negative, non-finite, or invalid inputs.
 *
 * @example
 * formatLapTime(83421) // "1:23.421"
 * formatLapTime(0)     // "0:00.000"
 * formatLapTime(-1)    // "—"
 */
export function formatLapTime(ms: number): string {
  if (!isFinite(ms) || ms < 0) return "—";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

/**
 * Converts a Jolpica Time.millis string (or number) to m:ss.SSS format.
 * Parses the string to a number first before formatting.
 * Returns "—" for unparseable, negative, or non-finite values.
 *
 * @example
 * formatMillis("83421") // "1:23.421"
 * formatMillis(83421)   // "1:23.421"
 * formatMillis("abc")   // "—"
 */
export function formatMillis(millisStr: string | number): string {
  const ms = typeof millisStr === "string" ? parseInt(millisStr, 10) : millisStr;
  return formatLapTime(ms);
}
