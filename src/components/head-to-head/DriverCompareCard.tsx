"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DriverStats } from "@/lib/utils/computeStats";

interface DriverCompareCardProps {
  d1Stats: DriverStats | null;
  d2Stats: DriverStats | null;
  d1Name: string;
  d2Name: string;
  d1Color: string;
  d2Color: string;
  standingsPending?: boolean;
}

type CompareDir = "higher" | "lower";

function highlight(
  a: number,
  b: number,
  dir: CompareDir
): { aWins: boolean; bWins: boolean } {
  if (a === b) return { aWins: false, bWins: false };
  const aWins = dir === "higher" ? a > b : a < b;
  return { aWins, bWins: !aWins };
}

const GREEN = "text-green-500 font-semibold";

interface StatRow {
  key: string;
  label: string;
  dir: CompareDir;
  getValue: (stats: DriverStats) => number;
  format: (val: number, standingsPending: boolean) => string | null;
  isStandingsDependent?: boolean;
}

const STAT_ROWS: StatRow[] = [
  {
    key: "wins",
    label: "Wins",
    dir: "higher",
    getValue: (s) => s.wins,
    format: (v) => String(v),
  },
  {
    key: "podiums",
    label: "Podiums",
    dir: "higher",
    getValue: (s) => s.podiums,
    format: (v) => String(v),
  },
  {
    key: "poles",
    label: "Pole Positions",
    dir: "higher",
    getValue: (s) => s.poles,
    format: (v) => String(v),
  },
  {
    key: "titles",
    label: "Championships",
    dir: "higher",
    getValue: (s) => s.titles,
    format: (v, pending) => (pending ? null : String(v)),
    isStandingsDependent: true,
  },
  {
    key: "races",
    label: "Races",
    dir: "higher",
    getValue: (s) => s.races,
    format: (v) => String(v),
  },
  {
    key: "dnfs",
    label: "DNFs",
    dir: "lower",
    getValue: (s) => s.dnfs,
    format: (v) => String(v),
  },
  {
    key: "careerPoints",
    label: "Career Points",
    dir: "higher",
    // Use officialCareerPoints when available (standings loaded), else fall back to careerPoints
    getValue: (s) =>
      s.officialCareerPoints > 0 ? s.officialCareerPoints : s.careerPoints,
    format: (v, pending) =>
      pending ? null : v % 1 === 0 ? String(v) : v.toFixed(1),
    isStandingsDependent: true,
  },
  {
    key: "avgFinishPosition",
    label: "Avg Finish",
    dir: "lower",
    getValue: (s) => s.avgFinishPosition,
    format: (v) => v.toFixed(1),
  },
  {
    key: "avgGridPosition",
    label: "Avg Grid",
    dir: "lower",
    getValue: (s) => s.avgGridPosition,
    format: (v) => v.toFixed(1),
  },
  {
    key: "pointsPerRace",
    label: "Points/Race",
    dir: "higher",
    getValue: (s) => s.pointsPerRace,
    format: (v) => v.toFixed(1),
  },
];

export function DriverCompareCard({
  d1Stats,
  d2Stats,
  d1Name,
  d2Name,
  d1Color,
  d2Color,
  standingsPending = false,
}: DriverCompareCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Driver name header row */}
        <div className="grid grid-cols-3 gap-2 text-center font-medium mb-4">
          <span style={{ color: d1Color }}>{d1Name}</span>
          <span className="text-muted-foreground text-sm self-center">vs</span>
          <span style={{ color: d2Color }}>{d2Name}</span>
        </div>

        {/* Stat rows */}
        {!d1Stats || !d2Stats ? (
          // Skeleton placeholder when data not yet available
          <div className="space-y-2">
            {STAT_ROWS.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-3 gap-2 text-center py-2 border-t border-border"
              >
                <Skeleton className="h-4 w-12 mx-auto" />
                <span className="text-muted-foreground text-xs">{row.label}</span>
                <Skeleton className="h-4 w-12 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {STAT_ROWS.map((row) => {
              const v1 = row.getValue(d1Stats);
              const v2 = row.getValue(d2Stats);
              const { aWins: d1Wins, bWins: d2Wins } = highlight(v1, v2, row.dir);

              const isDependent = row.isStandingsDependent && standingsPending;
              const d1Display = row.format(v1, standingsPending);
              const d2Display = row.format(v2, standingsPending);

              return (
                <div
                  key={row.key}
                  className="grid grid-cols-3 gap-2 text-center py-2 border-t border-border"
                >
                  <span className={d1Wins && !isDependent ? GREEN : ""}>
                    {isDependent || d1Display === null ? (
                      <Skeleton className="h-4 w-12 inline-block" />
                    ) : (
                      d1Display
                    )}
                  </span>
                  <span className="text-muted-foreground text-xs self-center">
                    {row.label}
                  </span>
                  <span className={d2Wins && !isDependent ? GREEN : ""}>
                    {isDependent || d2Display === null ? (
                      <Skeleton className="h-4 w-12 inline-block" />
                    ) : (
                      d2Display
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
