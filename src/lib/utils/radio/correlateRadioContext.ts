import type {
  OpenF1TeamRadio,
  OpenF1LapData,
  OpenF1Position,
} from "@/lib/api/openf1/types";

export interface RadioWithContext extends OpenF1TeamRadio {
  lap_number: number | null;
  position: number | null;
}

/**
 * Binary search: finds the index of the latest entry in a sorted ISO 8601
 * date string array where dates[i] <= target.
 *
 * Returns -1 if no entry satisfies the condition (target precedes all dates).
 *
 * ISO 8601 strings with consistent timezone sort correctly via lexicographic
 * comparison, so string <= comparison is valid.
 */
function findPrecedingIndex(dates: string[], target: string): number {
  if (dates.length === 0) return -1;

  let lo = 0;
  let hi = dates.length - 1;
  let result = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (dates[mid] <= target) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return result;
}

/**
 * Enriches each radio message with the nearest preceding lap number and
 * driver position based on timestamps.
 *
 * Uses binary search for O(log n) lookup per radio message — necessary
 * because position arrays can contain 5–15K records per driver.
 *
 * Both laps and positions are defensively sorted before searching.
 * The original radio array is not mutated.
 */
export function correlateRadioContext(
  radio: OpenF1TeamRadio[],
  laps: OpenF1LapData[],
  positions: OpenF1Position[],
): RadioWithContext[] {
  if (radio.length === 0) return [];

  // Defensive sort — OpenF1 typically returns sorted but it is not guaranteed
  const sortedLaps = laps
    .slice()
    .sort((a, b) => a.date_start.localeCompare(b.date_start));
  const sortedPositions = positions
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  // Pre-extract date arrays for binary search
  const lapDates = sortedLaps.map((l) => l.date_start);
  const positionDates = sortedPositions.map((p) => p.date);

  return radio.map((message) => {
    const lapIdx = findPrecedingIndex(lapDates, message.date);
    const posIdx = findPrecedingIndex(positionDates, message.date);

    return {
      ...message,
      lap_number: lapIdx === -1 ? null : sortedLaps[lapIdx].lap_number,
      position: posIdx === -1 ? null : sortedPositions[posIdx].position,
    };
  });
}
