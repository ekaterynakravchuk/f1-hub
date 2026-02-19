import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchMeetings } from "@/lib/api/openf1/endpoints";
import { openf1Keys } from "@/lib/api/openf1/query-keys";

export function useOpenF1Meetings(year: number | undefined) {
  return useQuery({
    queryKey: openf1Keys.meetings(year ?? 0),
    queryFn: year ? () => fetchMeetings(year) : skipToken,
    staleTime: Infinity,
  });
}
