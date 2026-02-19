"use client";

import { Button } from "@/components/ui/button";
import type { OpenF1Driver } from "@/lib/api/openf1/types";

interface DriverFilterPillsProps {
  drivers: OpenF1Driver[];
  active: number | null;
  onChange: (driverNumber: number | null) => void;
}

export function DriverFilterPills({ drivers, active, onChange }: DriverFilterPillsProps) {
  // Sort drivers by driver_number ascending for consistent ordering
  const sortedDrivers = [...drivers].sort((a, b) => a.driver_number - b.driver_number);

  return (
    <div className="flex flex-wrap gap-2">
      {/* "All" pill — active when no driver selected */}
      <Button
        size="sm"
        variant={active === null ? "default" : "outline"}
        className="rounded-full"
        onClick={() => onChange(null)}
      >
        All
      </Button>

      {sortedDrivers.map((driver) => {
        const isActive = active === driver.driver_number;
        const teamColor = "#" + driver.team_colour;

        return (
          <Button
            key={driver.driver_number}
            size="sm"
            variant={isActive ? "default" : "outline"}
            className={isActive ? "rounded-full ring-2" : "rounded-full"}
            style={isActive ? { borderColor: teamColor } : undefined}
            onClick={() =>
              // Clicking active pill deselects (show all); clicking inactive selects
              onChange(isActive ? null : driver.driver_number)
            }
          >
            {driver.name_acronym}
          </Button>
        );
      })}
    </div>
  );
}
