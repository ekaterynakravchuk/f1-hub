import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchRaceControl } from "@/lib/api/openf1/endpoints";
import { openf1Keys } from "@/lib/api/openf1/query-keys";

export function useRaceControl(sessionKey: number | undefined) {
  return useQuery({
    queryKey: openf1Keys.raceControl(sessionKey ?? 0),
    queryFn: sessionKey ? () => fetchRaceControl(sessionKey) : skipToken,
    staleTime: Infinity,
  });
}
