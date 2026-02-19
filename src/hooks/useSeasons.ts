import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchSeasons } from "@/lib/api/jolpica/endpoints";
import { jolpikaKeys } from "@/lib/api/jolpica/query-keys";

export const seasonsQueryOptions = queryOptions({
  queryKey: jolpikaKeys.seasons(),
  queryFn: fetchSeasons,
  staleTime: Infinity,
});

export function useSeasons() {
  return useQuery(seasonsQueryOptions);
}
