import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchCareerResults } from "@/lib/api/jolpica/endpoints";
import { jolpikaKeys } from "@/lib/api/jolpica/query-keys";

export function useCareerResults(driverId: string | undefined) {
  const { data, isPending, isError } = useQuery({
    queryKey: jolpikaKeys.careerResults(driverId ?? ""),
    queryFn: driverId ? () => fetchCareerResults(driverId) : skipToken,
    staleTime: Infinity,
  });

  return { data, isPending, isError };
}
