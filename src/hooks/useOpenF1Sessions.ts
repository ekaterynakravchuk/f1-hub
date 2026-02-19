import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchSessions } from "@/lib/api/openf1/endpoints";
import { openf1Keys } from "@/lib/api/openf1/query-keys";

export function useOpenF1Sessions(year: number | undefined) {
  return useQuery({
    queryKey: openf1Keys.sessions(year ?? 0),
    queryFn: year ? () => fetchSessions(year) : skipToken,
    staleTime: Infinity,
  });
}
