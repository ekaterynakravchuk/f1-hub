// Types from openf1.org/docs — data available from 2023 season onwards only
// Note: session_key required for most queries. See RESEARCH.md open questions.
// Source: openf1.org/docs — verified field names and types (2026-02-19)

export interface OpenF1Driver {
  broadcast_name: string;
  driver_number: number;
  first_name: string;
  full_name: string;
  headshot_url: string; // URL to headshot image
  last_name: string;
  meeting_key: number;
  name_acronym: string; // e.g. "VER"
  session_key: number;
  team_colour: string; // hex color e.g. "3671C6"
  team_name: string;
}

export interface OpenF1LapData {
  date_start: string; // datetime
  driver_number: number;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null; // intermediate 1 speed trap
  i2_speed: number | null; // intermediate 2 speed trap
  is_pit_out_lap: boolean;
  lap_duration: number | null; // seconds
  lap_number: number;
  meeting_key: number;
  segments_sector_1: number[];
  segments_sector_2: number[];
  segments_sector_3: number[];
  session_key: number;
  st_speed: number | null; // speed trap
}

export interface OpenF1CarData {
  brake: number; // 0-100
  date: string; // datetime
  driver_number: number;
  drs: number; // DRS status
  meeting_key: number;
  n_gear: number; // current gear
  rpm: number;
  session_key: number;
  speed: number; // km/h
  throttle: number; // 0-100
}

export interface OpenF1Position {
  date: string; // datetime
  driver_number: number;
  meeting_key: number;
  position: number;
  session_key: number;
}

export interface OpenF1TeamRadio {
  date: string; // datetime
  driver_number: number;
  meeting_key: number;
  recording_url: string; // URL to audio file
  session_key: number;
}

export interface OpenF1Weather {
  air_temperature: number; // Celsius
  date: string; // datetime
  humidity: number; // percent
  meeting_key: number;
  pressure: number; // mbar
  rainfall: number; // boolean as 0/1
  session_key: number;
  track_temperature: number; // Celsius
  wind_direction: number; // degrees
  wind_speed: number; // m/s
}
