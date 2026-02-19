"use client";

import { useRef, useState, useEffect, useCallback } from "react";

export type AudioState = "idle" | "loading" | "playing" | "paused" | "error";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>("idle");
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize Audio element only on client — never at module scope or hook body.
  // new Audio() does not exist in Node.js; calling it outside useEffect crashes next build.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const el = new Audio();
    audioRef.current = el;

    // Named handler references required for removeEventListener to work correctly.
    const onPlaying = () => setState("playing");
    const onPause = () => setState("paused");
    const onEnded = () => setState("idle");
    const onError = () => setState("error");
    const onLoadStart = () => setState("loading");
    // canplay fires when enough data is buffered to start playing.
    // Only transition from "loading" to "paused" — do not override "playing" state
    // if the browser fires canplay mid-playback.
    const onCanPlay = () =>
      setState((prev) => (prev === "loading" ? "paused" : prev));
    // timeupdate fires ~4 times/second — acceptable for seek bar smoothness.
    const onTimeUpdate = () => setCurrentTime(el.currentTime);
    const onDurationChange = () =>
      setDuration(isFinite(el.duration) ? el.duration : 0);

    el.addEventListener("playing", onPlaying);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);
    el.addEventListener("loadstart", onLoadStart);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("durationchange", onDurationChange);

    return () => {
      el.pause();
      el.removeAttribute("src");
      el.load();
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
      el.removeEventListener("loadstart", onLoadStart);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("durationchange", onDurationChange);
    };
  }, []); // empty deps — runs once on mount, never on server

  /** Load a new audio URL and prepare for playback. */
  const load = useCallback((url: string) => {
    if (!audioRef.current) return;
    audioRef.current.src = url;
    audioRef.current.load();
    setCurrentUrl(url);
  }, []);

  /** Start playback. Sets error state if the browser rejects the play() promise. */
  const play = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.play().catch(() => setState("error"));
  }, []);

  /** Pause playback. */
  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
  }, []);

  /** Stop playback, reset position, and clear the loaded URL. */
  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    setState("idle");
    setCurrentUrl(null);
  }, []);

  /** Seek to a specific time in seconds. */
  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
  }, []);

  return { state, currentUrl, currentTime, duration, load, play, pause, stop, seek } as const;
}
