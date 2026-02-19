import { describe, it, expect } from "vitest";
import {
  correlateRadioContext,
  RadioWithContext,
} from "@/lib/utils/radio/correlateRadioContext";
import type {
  OpenF1TeamRadio,
  OpenF1LapData,
  OpenF1Position,
} from "@/lib/api/openf1/types";

// --- Minimal fixture helpers ---

function makeRadio(date: string): OpenF1TeamRadio {
  return {
    date,
    driver_number: 1,
    meeting_key: 100,
    recording_url: "https://example.com/audio.mp3",
    session_key: 200,
  };
}

function makeLap(date_start: string, lap_number: number): OpenF1LapData {
  return {
    date_start,
    lap_number,
    driver_number: 1,
    duration_sector_1: null,
    duration_sector_2: null,
    duration_sector_3: null,
    i1_speed: null,
    i2_speed: null,
    is_pit_out_lap: false,
    lap_duration: null,
    meeting_key: 100,
    segments_sector_1: [],
    segments_sector_2: [],
    segments_sector_3: [],
    session_key: 200,
    st_speed: null,
  };
}

function makePosition(date: string, position: number): OpenF1Position {
  return {
    date,
    position,
    driver_number: 1,
    meeting_key: 100,
    session_key: 200,
  };
}

// --- Tests ---

describe("correlateRadioContext", () => {
  it("returns an empty array when radio array is empty", () => {
    const result = correlateRadioContext([], [], []);
    expect(result).toEqual([]);
  });

  it("sets lap_number and position to null when laps and positions are empty", () => {
    const radio = [makeRadio("2023-06-18T13:05:00.000Z")];
    const result = correlateRadioContext(radio, [], []);
    expect(result).toHaveLength(1);
    expect(result[0].lap_number).toBeNull();
    expect(result[0].position).toBeNull();
  });

  it("correctly correlates a radio message to the nearest preceding lap and position", () => {
    const radio = [makeRadio("2023-06-18T13:05:30.000Z")];
    const laps = [
      makeLap("2023-06-18T13:00:00.000Z", 1),
      makeLap("2023-06-18T13:05:00.000Z", 2),
      makeLap("2023-06-18T13:10:00.000Z", 3),
    ];
    const positions = [
      makePosition("2023-06-18T13:04:00.000Z", 4),
      makePosition("2023-06-18T13:05:00.000Z", 3),
      makePosition("2023-06-18T13:06:00.000Z", 2),
    ];
    const result = correlateRadioContext(radio, laps, positions);
    expect(result[0].lap_number).toBe(2);
    expect(result[0].position).toBe(3);
  });

  it("sets lap_number to null when radio timestamp precedes all laps", () => {
    const radio = [makeRadio("2023-06-18T12:59:00.000Z")];
    const laps = [
      makeLap("2023-06-18T13:00:00.000Z", 1),
      makeLap("2023-06-18T13:05:00.000Z", 2),
    ];
    const positions = [makePosition("2023-06-18T13:00:00.000Z", 5)];
    const result = correlateRadioContext(radio, laps, positions);
    expect(result[0].lap_number).toBeNull();
    expect(result[0].position).toBeNull();
  });

  it("uses the lap/position when radio timestamp exactly matches", () => {
    const radio = [makeRadio("2023-06-18T13:05:00.000Z")];
    const laps = [
      makeLap("2023-06-18T13:00:00.000Z", 1),
      makeLap("2023-06-18T13:05:00.000Z", 2),
    ];
    const positions = [makePosition("2023-06-18T13:05:00.000Z", 3)];
    const result = correlateRadioContext(radio, laps, positions);
    expect(result[0].lap_number).toBe(2);
    expect(result[0].position).toBe(3);
  });

  it("independently correlates multiple radio messages", () => {
    const radio = [
      makeRadio("2023-06-18T13:02:00.000Z"),
      makeRadio("2023-06-18T13:07:00.000Z"),
      makeRadio("2023-06-18T13:12:00.000Z"),
    ];
    const laps = [
      makeLap("2023-06-18T13:00:00.000Z", 1),
      makeLap("2023-06-18T13:05:00.000Z", 2),
      makeLap("2023-06-18T13:10:00.000Z", 3),
    ];
    const positions = [
      makePosition("2023-06-18T13:01:00.000Z", 5),
      makePosition("2023-06-18T13:06:00.000Z", 4),
      makePosition("2023-06-18T13:11:00.000Z", 3),
    ];
    const result = correlateRadioContext(radio, laps, positions);
    expect(result[0].lap_number).toBe(1);
    expect(result[0].position).toBe(5);
    expect(result[1].lap_number).toBe(2);
    expect(result[1].position).toBe(4);
    expect(result[2].lap_number).toBe(3);
    expect(result[2].position).toBe(3);
  });

  it("handles unsorted input by sorting defensively before searching", () => {
    const radio = [makeRadio("2023-06-18T13:07:00.000Z")];
    // Intentionally unsorted
    const laps = [
      makeLap("2023-06-18T13:10:00.000Z", 3),
      makeLap("2023-06-18T13:00:00.000Z", 1),
      makeLap("2023-06-18T13:05:00.000Z", 2),
    ];
    const positions = [
      makePosition("2023-06-18T13:08:00.000Z", 2),
      makePosition("2023-06-18T13:01:00.000Z", 5),
      makePosition("2023-06-18T13:06:00.000Z", 4),
    ];
    const result = correlateRadioContext(radio, laps, positions);
    expect(result[0].lap_number).toBe(2);
    expect(result[0].position).toBe(4);
  });

  it("works correctly with single lap and single position (lo=hi=0 case)", () => {
    const radio = [makeRadio("2023-06-18T13:05:00.000Z")];
    const laps = [makeLap("2023-06-18T13:00:00.000Z", 1)];
    const positions = [makePosition("2023-06-18T13:00:00.000Z", 3)];
    const result = correlateRadioContext(radio, laps, positions);
    expect(result[0].lap_number).toBe(1);
    expect(result[0].position).toBe(3);
  });

  it("preserves original radio message fields in the returned objects", () => {
    const radio = [makeRadio("2023-06-18T13:05:30.000Z")];
    const laps = [makeLap("2023-06-18T13:00:00.000Z", 1)];
    const positions = [makePosition("2023-06-18T13:00:00.000Z", 2)];
    const result = correlateRadioContext(radio, laps, positions);
    expect(result[0].driver_number).toBe(1);
    expect(result[0].meeting_key).toBe(100);
    expect(result[0].session_key).toBe(200);
    expect(result[0].recording_url).toBe("https://example.com/audio.mp3");
    expect(result[0].date).toBe("2023-06-18T13:05:30.000Z");
  });

  it("RadioWithContext type has lap_number and position fields", () => {
    // Type-level check: this test confirms the shape of RadioWithContext
    const radio = [makeRadio("2023-06-18T13:05:00.000Z")];
    const laps = [makeLap("2023-06-18T13:00:00.000Z", 1)];
    const positions = [makePosition("2023-06-18T13:00:00.000Z", 1)];
    const result: RadioWithContext[] = correlateRadioContext(radio, laps, positions);
    // These property accesses would fail TypeScript compile if fields are missing
    const _lapNumber: number | null = result[0].lap_number;
    const _position: number | null = result[0].position;
    expect(typeof _lapNumber === "number" || _lapNumber === null).toBe(true);
    expect(typeof _position === "number" || _position === null).toBe(true);
  });
});
