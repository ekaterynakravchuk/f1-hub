"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { RadioCard } from "@/components/radio/RadioCard";
import type { AudioState } from "@/hooks/useAudioPlayer";
import type { OpenF1TeamRadio, OpenF1Driver } from "@/lib/api/openf1/types";

interface RadioListProps {
  radio: OpenF1TeamRadio[];
  driverMap: Map<number, OpenF1Driver>;
  playingUrl: string | null;
  audioState: AudioState;
  onTapRadio: (radio: OpenF1TeamRadio) => void;
  hasPlayer: boolean;
}

export function RadioList({
  radio,
  driverMap,
  playingUrl,
  audioState,
  onTapRadio,
  hasPlayer,
}: RadioListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: radio.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  // Empty state before session is selected or data hasn't loaded
  if (radio.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">Select a session to browse radio messages</p>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className={hasPlayer ? "overflow-y-auto pb-24" : "overflow-y-auto"}
      style={{ height: "calc(100vh - 350px)" }}
    >
      <div
        style={{ height: virtualizer.getTotalSize(), position: "relative" }}
      >
        {virtualizer.getVirtualItems().map((vi) => {
          const entry = radio[vi.index];
          const driver = driverMap.get(entry.driver_number);
          const isPlaying =
            entry.recording_url === playingUrl && audioState === "playing";

          return (
            <RadioCard
              key={`${entry.session_key}-${entry.driver_number}-${entry.date}`}
              radio={entry}
              driver={driver}
              isPlaying={isPlaying}
              onTap={() => onTapRadio(entry)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: vi.size,
                transform: `translateY(${vi.start}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
