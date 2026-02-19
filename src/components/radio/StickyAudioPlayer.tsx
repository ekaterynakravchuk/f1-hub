"use client";

import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAudioTime } from "@/lib/utils/radio";
import type { AudioState } from "@/hooks/useAudioPlayer";

interface StickyAudioPlayerProps {
  state: AudioState;
  driverName: string | null;
  driverAcronym: string | null;
  teamColour: string | null;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (seconds: number) => void;
}

export function StickyAudioPlayer({
  state,
  driverName,
  driverAcronym,
  teamColour,
  currentTime,
  duration,
  onPlay,
  onPause,
  onSeek,
}: StickyAudioPlayerProps) {
  if (state === "idle") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3">
      <div className="mx-auto max-w-6xl flex items-center gap-4">
        {/* Play/Pause/Loading button */}
        <Button
          size="icon"
          variant="ghost"
          disabled={state === "loading"}
          onClick={state === "playing" ? onPause : onPlay}
          aria-label={state === "playing" ? "Pause" : "Play"}
        >
          {state === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : state === "playing" ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </Button>

        {/* Driver info and seek bar */}
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            {driverAcronym && (
              <span
                className="font-bold"
                style={{ color: teamColour ? "#" + teamColour : undefined }}
              >
                {driverAcronym}
              </span>
            )}
            {driverName && (
              <span className="text-muted-foreground truncate">{driverName}</span>
            )}
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onInput={(e) => onSeek(Number((e.target as HTMLInputElement).value))}
            className="w-full h-1 accent-foreground cursor-pointer"
            aria-label="Seek"
          />
        </div>

        {/* Elapsed / total time */}
        <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
        </span>
      </div>
    </div>
  );
}
