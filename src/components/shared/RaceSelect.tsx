"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRaces } from "@/hooks/useRaces";
import { RaceSelectSkeleton } from "@/components/shared/loading/RaceSelectSkeleton";
import { QueryError } from "@/components/shared/QueryError";

interface RaceSelectProps {
  season: string | undefined;
  value: string | undefined;
  onChange: (round: string) => void;
}

export function RaceSelect({ season, value, onChange }: RaceSelectProps) {
  const { data: races, isPending, isError } = useRaces(season);

  if (!season) {
    return (
      <Select disabled>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select season first" />
        </SelectTrigger>
        <SelectContent />
      </Select>
    );
  }

  if (isPending) {
    return <RaceSelectSkeleton />;
  }

  if (isError) {
    return <QueryError message="Could not load races" />;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select race" />
      </SelectTrigger>
      <SelectContent>
        {races.map((r) => (
          <SelectItem key={r.round} value={r.round}>
            Rd {r.round}: {r.raceName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
