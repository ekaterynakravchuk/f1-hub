import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchRaces } from "@/lib/api/jolpica/endpoints";
import { jolpikaKeys } from "@/lib/api/jolpica/query-keys";

export function useRaces(season: string | undefined) {
  return useQuery({
    queryKey: jolpikaKeys.races(season ?? ""),
    queryFn: season ? () => fetchRaces(season) : skipToken,
    staleTime: Infinity,
  });
}
