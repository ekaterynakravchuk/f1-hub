"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSeasons } from "@/hooks/useSeasons";
import { SeasonSelectSkeleton } from "@/components/shared/loading/SeasonSelectSkeleton";
import { QueryError } from "@/components/shared/QueryError";

interface SeasonSelectProps {
  value: string | undefined;
  onChange: (season: string) => void;
}

export function SeasonSelect({ value, onChange }: SeasonSelectProps) {
  const { data: seasons, isPending, isError } = useSeasons();

  if (isPending) {
    return <SeasonSelectSkeleton />;
  }

  if (isError) {
    return <QueryError message="Could not load seasons" />;
  }

  const sortedSeasons = [...seasons].sort(
    (a, b) => Number(b.season) - Number(a.season)
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Season" />
      </SelectTrigger>
      <SelectContent>
        {sortedSeasons.map((s) => (
          <SelectItem key={s.season} value={s.season}>
            {s.season}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
