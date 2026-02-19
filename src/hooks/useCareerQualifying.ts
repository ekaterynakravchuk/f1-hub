import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchCareerQualifying } from "@/lib/api/jolpica/endpoints";
import { jolpikaKeys } from "@/lib/api/jolpica/query-keys";

export function useCareerQualifying(driverId: string | undefined) {
  const { data, isPending, isError } = useQuery({
    queryKey: jolpikaKeys.careerQualifying(driverId ?? ""),
    queryFn: driverId ? () => fetchCareerQualifying(driverId) : skipToken,
    staleTime: Infinity,
  });

  return { data, isPending, isError };
}
