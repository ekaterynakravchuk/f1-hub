import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchTeamRadio } from "@/lib/api/openf1/endpoints";
import { openf1Keys } from "@/lib/api/openf1/query-keys";

export function useTeamRadio(sessionKey: number | undefined) {
  return useQuery({
    queryKey: openf1Keys.teamRadio(sessionKey ?? 0),
    queryFn: sessionKey ? () => fetchTeamRadio(sessionKey) : skipToken,
    staleTime: Infinity,
  });
}
