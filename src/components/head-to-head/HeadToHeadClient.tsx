"use client";

import { useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DriverSelect } from "@/components/shared/DriverSelect";
import { DriverCompareCard } from "@/components/head-to-head/DriverCompareCard";
import { useCareerResults } from "@/hooks/useCareerResults";
import { useCareerQualifying } from "@/hooks/useCareerQualifying";
import { useCareerStandings } from "@/hooks/useCareerStandings";
import { useDrivers } from "@/hooks/useDrivers";
import { computeStats } from "@/lib/utils/computeStats";
import { computeTeammateH2H } from "@/lib/utils/computeTeammateH2H";
import { getTeamColor } from "@/lib/utils/teamColors";
import type { JolpikaDriver } from "@/lib/api/jolpica/types";

interface HeadToHeadClientProps {
  initialD1?: string;
  initialD2?: string;
}

export function HeadToHeadClient({ initialD1, initialD2 }: HeadToHeadClientProps) {
  const [d1, setD1] = useState<string>(initialD1 ?? "");
  const [d2, setD2] = useState<string>(initialD2 ?? "");

  const router = useRouter();
  const pathname = usePathname();

  const { data: drivers } = useDrivers();

  // URL sync — use replace to avoid polluting browser history
  function updateURL(newD1: string, newD2: string) {
    const params = new URLSearchParams();
    if (newD1) params.set("d1", newD1);
    if (newD2) params.set("d2", newD2);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleD1Change(val: string | string[]) {
    const id = Array.isArray(val) ? val[0] ?? "" : val;
    setD1(id);
    updateURL(id, d2);
  }

  function handleD2Change(val: string | string[]) {
    const id = Array.isArray(val) ? val[0] ?? "" : val;
    setD2(id);
    updateURL(d1, id);
  }

  // Career data hooks for both drivers
  const { data: d1Results, isPending: d1ResultsPending } = useCareerResults(d1 || undefined);
  const { data: d2Results, isPending: d2ResultsPending } = useCareerResults(d2 || undefined);

  const { data: d1Qualifying, isPending: d1QualPending } = useCareerQualifying(d1 || undefined);
  const { data: d2Qualifying, isPending: d2QualPending } = useCareerQualifying(d2 || undefined);

  const {
    standings: d1Standings,
    isPending: d1StandingsPending,
  } = useCareerStandings(d1 || undefined);
  const {
    standings: d2Standings,
    isPending: d2StandingsPending,
  } = useCareerStandings(d2 || undefined);

  const standingsPending = d1StandingsPending || d2StandingsPending;
  const dataPending =
    d1ResultsPending || d2ResultsPending || d1QualPending || d2QualPending;

  // Compute stats with useMemo — recompute only when data changes
  const d1Stats = useMemo(
    () => computeStats(d1Results ?? [], d1Qualifying ?? [], d1Standings ?? []),
    [d1Results, d1Qualifying, d1Standings]
  );

  const d2Stats = useMemo(
    () => computeStats(d2Results ?? [], d2Qualifying ?? [], d2Standings ?? []),
    [d2Results, d2Qualifying, d2Standings]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _teammateH2H = useMemo(
    () => computeTeammateH2H(d1Qualifying ?? [], d2Qualifying ?? []),
    [d1Qualifying, d2Qualifying]
  );

  // Driver display names and colors
  function getDriverName(driverId: string): string {
    if (!drivers || !driverId) return driverId;
    const driver = drivers.find((d: JolpikaDriver) => d.driverId === driverId);
    return driver ? `${driver.givenName} ${driver.familyName}` : driverId;
  }

  function getDriverColor(driverId: string, results: typeof d1Results): string {
    if (!results || results.length === 0) return "#64748b";
    const lastRace = results[results.length - 1];
    const constructorId = lastRace?.Results?.[0]?.Constructor?.constructorId;
    return constructorId ? getTeamColor(constructorId) : "#64748b";
  }

  const d1Name = getDriverName(d1);
  const d2Name = getDriverName(d2);
  const d1Color = getDriverColor(d1, d1Results);
  const d2Color = getDriverColor(d2, d2Results);

  const showComparison = Boolean(d1 && d2);
  const comparisonReady = showComparison && !dataPending;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-4xl font-bold">Head-to-Head</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Compare any two F1 drivers side-by-side
      </p>

      {/* Driver selection row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <DriverSelect
          value={d1}
          onChange={handleD1Change}
          mode="single"
          placeholder="Select Driver 1..."
        />
        <DriverSelect
          value={d2}
          onChange={handleD2Change}
          mode="single"
          placeholder="Select Driver 2..."
        />
      </div>

      {/* Content area — only shows when both drivers selected */}
      {showComparison && (
        <div className="mt-8">
          <DriverCompareCard
            d1Stats={comparisonReady ? d1Stats : null}
            d2Stats={comparisonReady ? d2Stats : null}
            d1Name={d1Name}
            d2Name={d2Name}
            d1Color={d1Color}
            d2Color={d2Color}
            standingsPending={standingsPending}
          />
          {/* Charts will be added in Plan 04-03 */}
        </div>
      )}
    </div>
  );
}
