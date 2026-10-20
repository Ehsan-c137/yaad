import React from "react";

import type { TimeIndicatorValue } from "./grid-constants";

import { HOURS } from "./grid-constants";

interface CalendarTimeGutterProps {
  hourHeight: number;
  currentIndicatorTop?: number;
  currentTime?: TimeIndicatorValue;
  showBadge?: boolean;
  widthClass?: string;
  paddingRightClass?: string;
}

export const CalendarTimeGutter: React.FC<CalendarTimeGutterProps> = ({
  hourHeight,
  currentIndicatorTop,
  currentTime,
  showBadge = true,
  widthClass = "w-14",
  paddingRightClass = "pr-2",
}) => {
  return (
    <div
      className={`relative ${widthClass} shrink-0 border-r border-border/70 select-none`}
    >
      {HOURS.map((hour) => (
        <div
          key={hour}
          style={{ height: hourHeight }}
          className={`relative ${paddingRightClass} text-right text-[11px] font-medium text-muted-foreground`}
        >
          <span className="-top-2 relative block">{hour}</span>
        </div>
      ))}

      {/* Current Time Badge in Time Column */}
      {showBadge && currentTime && currentIndicatorTop !== undefined && (
        <div
          style={{ top: currentIndicatorTop - 9 }}
          className="pointer-events-none absolute right-1 z-30"
        >
          <span className="rounded bg-[#e05638] px-1 py-0.5 text-[10px] font-semibold text-white shadow-xs">
            {currentTime.label}
          </span>
        </div>
      )}
    </div>
  );
};
