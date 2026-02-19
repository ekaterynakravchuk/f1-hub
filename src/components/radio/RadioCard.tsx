"use client";

import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpenF1TeamRadio, OpenF1Driver } from "@/lib/api/openf1/types";

interface RadioCardProps {
  radio: OpenF1TeamRadio;
  driver: OpenF1Driver | undefined;
  isPlaying: boolean;
  onTap: () => void;
  style?: React.CSSProperties;
}

export function RadioCard({ radio, driver, isPlaying, onTap, style }: RadioCardProps) {
  const teamColor = driver ? "#" + driver.team_colour : "#64748b"; // slate-500 fallback

  const timestamp = new Date(radio.date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      role="button"
      aria-pressed={isPlaying}
      onClick={onTap}
      style={{ ...style, borderLeftColor: teamColor }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 cursor-pointer border-l-4 transition-colors hover:bg-accent/50",
        isPlaying && "bg-accent"
      )}
    >
      {/* Driver acronym — colored with team color */}
      <span
        style={{ color: teamColor }}
        className="text-sm font-semibold w-12 shrink-0"
      >
        {driver?.name_acronym ?? radio.driver_number}
      </span>

      {/* Driver full name */}
      <span className="text-sm text-foreground truncate flex-1">
        {driver?.full_name ?? `Driver ${radio.driver_number}`}
      </span>

      {/* Timestamp */}
      <span className="text-xs text-muted-foreground shrink-0">{timestamp}</span>

      {/* Play/Pause indicator */}
      <div className="shrink-0">
        {isPlaying ? (
          <Pause className="size-4 text-foreground" />
        ) : (
          <Play className="size-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
