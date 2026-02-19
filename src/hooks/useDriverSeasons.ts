import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchDriverSeasons } from "@/lib/api/jolpica/endpoints";
import { jolpikaKeys } from "@/lib/api/jolpica/query-keys";

export function useDriverSeasons(driverId: string | undefined) {
  const { data, isPending, isError } = useQuery({
    queryKey: jolpikaKeys.driverSeasons(driverId ?? ""),
    queryFn: driverId ? () => fetchDriverSeasons(driverId) : skipToken,
    staleTime: Infinity,
  });

  return { data, isPending, isError };
}
