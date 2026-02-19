"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDrivers } from "@/hooks/useDrivers";
import { getNationalityFlag } from "@/lib/utils/nationalityFlag";
import { DriverSelectSkeleton } from "@/components/shared/loading/DriverSelectSkeleton";
import { QueryError } from "@/components/shared/QueryError";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JolpikaDriver } from "@/lib/api/jolpica/types";

interface DriverSelectProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  mode?: "single" | "multi";
  teamMap?: Record<string, string>;
  placeholder?: string;
}

export function DriverSelect({
  value,
  onChange,
  mode = "single",
  teamMap,
  placeholder = "Search drivers...",
}: DriverSelectProps) {
  const { data: drivers, isPending, isError } = useDrivers();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!drivers) return [];
    if (!query.trim()) return drivers;
    const q = query.toLowerCase();
    return drivers.filter(
      (d: JolpikaDriver) =>
        d.givenName.toLowerCase().includes(q) ||
        d.familyName.toLowerCase().includes(q)
    );
  }, [drivers, query]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 44,
    overscan: 5,
    useFlushSync: false,
  });

  const handleSelect = useCallback(
    (driverId: string) => {
      if (mode === "single") {
        onChange(driverId);
        setOpen(false);
      } else {
        const current = Array.isArray(value) ? value : [];
        if (current.includes(driverId)) {
          onChange(current.filter((id) => id !== driverId));
        } else {
          onChange([...current, driverId]);
        }
      }
    },
    [mode, value, onChange]
  );

  const getTriggerLabel = useCallback(() => {
    if (mode === "single") {
      const selectedId = typeof value === "string" ? value : undefined;
      if (!selectedId) return null;
      const driver = drivers?.find((d: JolpikaDriver) => d.driverId === selectedId);
      return driver ? `${driver.givenName} ${driver.familyName}` : selectedId;
    } else {
      const selectedIds = Array.isArray(value) ? value : [];
      if (selectedIds.length === 0) return null;
      if (selectedIds.length === 1) {
        const driver = drivers?.find((d: JolpikaDriver) => d.driverId === selectedIds[0]);
        return driver ? `${driver.givenName} ${driver.familyName}` : selectedIds[0];
      }
      const first = drivers?.find((d: JolpikaDriver) => d.driverId === selectedIds[0]);
      const firstName = first ? `${first.givenName} ${first.familyName}` : selectedIds[0];
      return `${firstName} +${selectedIds.length - 1} more`;
    }
  }, [mode, value, drivers]);

  if (isPending) {
    return <DriverSelectSkeleton />;
  }

  if (isError) {
    return <QueryError message="Could not load drivers" />;
  }

  const triggerLabel = getTriggerLabel();
  const selectedIds = mode === "multi" && Array.isArray(value) ? value : [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {triggerLabel ?? (mode === "multi" ? "Select drivers" : placeholder)}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={placeholder}
          />
          {filtered.length === 0 && (
            <CommandEmpty>No drivers found.</CommandEmpty>
          )}
          <CommandList>
            {/* Virtualized scroll container — CommandList provides the scroll element */}
            <div
              ref={listRef}
              style={{ height: "300px", overflowY: "auto" }}
            >
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  position: "relative",
                }}
              >
                {virtualizer.getVirtualItems().map((vi) => {
                  const driver = filtered[vi.index];
                  const isSelected =
                    mode === "single"
                      ? value === driver.driverId
                      : selectedIds.includes(driver.driverId);
                  const flag = getNationalityFlag(driver.nationality);
                  const teamName = teamMap?.[driver.driverId];

                  return (
                    <CommandItem
                      key={driver.driverId}
                      value={driver.driverId}
                      onSelect={handleSelect}
                      style={{
                        position: "absolute",
                        top: vi.start,
                        left: 0,
                        right: 0,
                        height: vi.size,
                      }}
                      className="flex items-center gap-2"
                    >
                      {mode === "multi" && (
                        <Check
                          className={cn(
                            "size-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      )}
                      <span className="shrink-0">{flag}</span>
                      <span className="flex-1 truncate">
                        {driver.givenName} {driver.familyName}
                      </span>
                      {teamName && (
                        <Badge
                          variant="secondary"
                          className="ml-auto text-xs shrink-0"
                        >
                          {teamName}
                        </Badge>
                      )}
                    </CommandItem>
                  );
                })}
              </div>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
