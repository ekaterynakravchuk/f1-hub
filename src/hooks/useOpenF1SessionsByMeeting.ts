import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchSessionsByMeeting } from "@/lib/api/openf1/endpoints";
import { openf1Keys } from "@/lib/api/openf1/query-keys";

/**
 * Fetch sessions for a specific meeting (race weekend).
 * More targeted than useOpenF1Sessions(year) — returns 3-6 sessions
 * for the selected meeting rather than ~125 for the full year.
 * Used by SessionBrowser for the session type selector.
 */
export function useOpenF1SessionsByMeeting(meetingKey: number | undefined) {
  return useQuery({
    queryKey: openf1Keys.sessionsByMeeting(meetingKey ?? 0),
    queryFn: meetingKey ? () => fetchSessionsByMeeting(meetingKey) : skipToken,
    staleTime: Infinity,
  });
}
