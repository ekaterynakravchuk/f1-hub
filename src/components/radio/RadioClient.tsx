"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { SessionBrowser } from "@/components/radio/SessionBrowser";
import { DriverFilterPills } from "@/components/radio/DriverFilterPills";
import { RadioList } from "@/components/radio/RadioList";
import { StickyAudioPlayer } from "@/components/radio/StickyAudioPlayer";
import { useTeamRadio } from "@/hooks/useTeamRadio";
import { useOpenF1Drivers } from "@/hooks/useOpenF1Drivers";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { OpenF1TeamRadio } from "@/lib/api/openf1/types";

export function RadioClient() {
  const [sessionKey, setSessionKey] = useState<number | undefined>(undefined);
  const [activeDriverNumber, setActiveDriverNumber] = useState<number | null>(null);

  const { data: radio } = useTeamRadio(sessionKey);
  const { data: drivers } = useOpenF1Drivers(sessionKey);
  const { state, currentUrl, currentTime, duration, load, play, pause, seek } = useAudioPlayer();

  // Reset active driver filter when session changes
  useEffect(() => {
    setActiveDriverNumber(null);
  }, [sessionKey]);

  // Build driver lookup map for RadioCard name/color display
  const driverMap = useMemo(
    () => new Map(drivers?.map((d) => [d.driver_number, d]) ?? []),
    [drivers]
  );

  // Filter radio messages by selected driver (client-side — no API re-fetch)
  const filteredRadio = useMemo(() => {
    if (!radio) return [];
    if (activeDriverNumber === null) return radio;
    return radio.filter((r) => r.driver_number === activeDriverNumber);
  }, [radio, activeDriverNumber]);

  // Derive the radio entry and driver info for the currently playing track
  const playingRadio = useMemo(
    () => radio?.find((r) => r.recording_url === currentUrl) ?? null,
    [radio, currentUrl]
  );
  const playingDriver = useMemo(
    () => (playingRadio ? (driverMap.get(playingRadio.driver_number) ?? null) : null),
    [playingRadio, driverMap]
  );

  const handleTapRadio = useCallback(
    (entry: OpenF1TeamRadio) => {
      if (entry.recording_url === currentUrl && state === "playing") {
        pause();
      } else if (entry.recording_url === currentUrl && state === "paused") {
        play();
      } else {
        load(entry.recording_url);
        play();
      }
    },
    [currentUrl, state, load, play, pause]
  );

  const handleSessionSelected = useCallback((key: number | undefined) => {
    setSessionKey(key);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold">Team Radio</h1>
      <p className="mt-2 text-muted-foreground">
        Browse and listen to team radio communications from 2023 onwards
      </p>

      <div className="mt-8">
        <SessionBrowser onSessionSelected={handleSessionSelected} />
      </div>

      {sessionKey && (
        <>
          {drivers && drivers.length > 0 && (
            <div className="mt-6">
              <DriverFilterPills
                drivers={drivers}
                active={activeDriverNumber}
                onChange={setActiveDriverNumber}
              />
            </div>
          )}

          <div className="mt-6">
            <RadioList
              radio={filteredRadio}
              driverMap={driverMap}
              playingUrl={currentUrl}
              audioState={state}
              onTapRadio={handleTapRadio}
              hasPlayer={state !== "idle"}
            />
          </div>
        </>
      )}

      <StickyAudioPlayer
        state={state}
        driverName={playingDriver?.full_name ?? null}
        driverAcronym={playingDriver?.name_acronym ?? null}
        teamColour={playingDriver?.team_colour ?? null}
        currentTime={currentTime}
        duration={duration}
        onPlay={play}
        onPause={pause}
        onSeek={seek}
      />
    </div>
  );
}
