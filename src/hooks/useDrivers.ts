import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchAllDrivers } from "@/lib/api/jolpica/endpoints";
import { jolpikaKeys } from "@/lib/api/jolpica/query-keys";

export const driversQueryOptions = queryOptions({
  queryKey: jolpikaKeys.drivers(),
  queryFn: fetchAllDrivers,
  staleTime: Infinity,
  gcTime: Infinity, // Never garbage collect — all ~874 drivers are reference data used across modules
});

export function useDrivers() {
  return useQuery(driversQueryOptions);
}
