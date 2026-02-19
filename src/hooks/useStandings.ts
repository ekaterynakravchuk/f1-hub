import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchStandings } from "@/lib/api/jolpica/endpoints";
import { jolpikaKeys } from "@/lib/api/jolpica/query-keys";

export function useStandings(season: string | undefined) {
  return useQuery({
    queryKey: jolpikaKeys.standings(season ?? ""),
    queryFn: season ? () => fetchStandings(season) : skipToken,
    staleTime: Infinity,
  });
}
