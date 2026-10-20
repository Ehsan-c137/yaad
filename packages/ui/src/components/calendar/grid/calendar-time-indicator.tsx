import React from "react";

interface CalendarTimeIndicatorProps {
  top: number;
  showDot?: boolean;
  dotOffsetLeft?: number;
}

export const CalendarTimeIndicator: React.FC<CalendarTimeIndicatorProps> = ({
  top,
  showDot = false,
  dotOffsetLeft = -4,
}) => {
  return (
    <div
      style={{ top }}
      className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
    >
      <div className="h-[1.5px] w-full bg-[#e05638]" />
      {showDot && (
        <div
          style={{ left: dotOffsetLeft }}
          className="absolute size-2.5 rounded-full bg-[#e05638] ring-2 ring-background"
        />
      )}
    </div>
  );
};
