"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOpenF1Meetings } from "@/hooks/useOpenF1Meetings";
import { useOpenF1SessionsByMeeting } from "@/hooks/useOpenF1SessionsByMeeting";

const AVAILABLE_YEARS = [2025, 2024, 2023];

interface SessionBrowserProps {
  onSessionSelected: (sessionKey: number | undefined) => void;
}

export function SessionBrowser({ onSessionSelected }: SessionBrowserProps) {
  const [year, setYear] = useState<number | undefined>(undefined);
  const [meetingKey, setMeetingKey] = useState<number | undefined>(undefined);
  const [sessionKey, setSessionKey] = useState<number | undefined>(undefined);

  const { data: meetings, isPending: meetingsPending } = useOpenF1Meetings(year);
  const { data: sessions, isPending: sessionsPending } = useOpenF1SessionsByMeeting(meetingKey);

  // Sort meetings chronologically (ascending by date_start)
  const sortedMeetings = meetings
    ? [...meetings].sort(
        (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
      )
    : [];

  // When year changes, reset meetingKey and sessionKey
  useEffect(() => {
    setMeetingKey(undefined);
    setSessionKey(undefined);
    onSessionSelected(undefined);
  }, [year, onSessionSelected]);

  // When meetingKey changes, reset sessionKey
  useEffect(() => {
    setSessionKey(undefined);
    onSessionSelected(undefined);
  }, [meetingKey, onSessionSelected]);

  // When sessionKey changes, notify parent
  useEffect(() => {
    onSessionSelected(sessionKey);
  }, [sessionKey, onSessionSelected]);

  const handleYearChange = (value: string) => {
    setYear(Number(value));
  };

  const handleMeetingChange = (value: string) => {
    setMeetingKey(Number(value));
  };

  const handleSessionChange = (value: string) => {
    setSessionKey(Number(value));
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Year selector — always visible */}
      <Select
        value={year?.toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_YEARS.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Meeting selector — visible only when year is set */}
      {year && (
        <Select
          value={meetingKey?.toString()}
          onValueChange={handleMeetingChange}
          disabled={meetingsPending}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue
              placeholder={meetingsPending ? "Loading races..." : "Select race"}
            />
          </SelectTrigger>
          <SelectContent>
            {sortedMeetings.map((m) => (
              <SelectItem key={m.meeting_key} value={m.meeting_key.toString()}>
                {m.meeting_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Session type selector — visible only when meetingKey is set */}
      {meetingKey && (
        <Select
          value={sessionKey?.toString()}
          onValueChange={handleSessionChange}
          disabled={sessionsPending}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue
              placeholder={sessionsPending ? "Loading sessions..." : "Select session"}
            />
          </SelectTrigger>
          <SelectContent>
            {sessions?.map((s) => (
              <SelectItem key={s.session_key} value={s.session_key.toString()}>
                {s.session_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
