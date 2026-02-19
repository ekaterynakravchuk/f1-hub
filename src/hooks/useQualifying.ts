import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchQualifying } from "@/lib/api/jolpica/endpoints";
import { jolpikaKeys } from "@/lib/api/jolpica/query-keys";

export function useQualifying(
  driverId: string | undefined,
  season: string | undefined
) {
  return useQuery({
    queryKey: jolpikaKeys.qualifying(driverId ?? "", season ?? ""),
    queryFn:
      driverId && season
        ? () => fetchQualifying(driverId, season)
        : skipToken,
    staleTime: Infinity,
  });
}
