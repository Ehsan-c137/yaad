import React from "react";

import type { CalendarCategory, CalendarEvent } from "../types";

interface CalendarGridEventProps {
  event: CalendarEvent;
  category?: CalendarCategory;
  top: number;
  height: number;
  isSelected?: boolean;
  onSelect: (event: CalendarEvent, e: React.MouseEvent) => void;
}

export const CalendarGridEvent: React.FC<CalendarGridEventProps> = ({
  event,
  category,
  top,
  height,
  isSelected = false,
  onSelect,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(event, e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onSelect(event, e as unknown as React.MouseEvent);
        }
      }}
      style={{
        top,
        height,
        backgroundColor: category?.badgeBg ?? "rgba(219, 234, 254, 0.9)",
        borderColor: isSelected
          ? (category?.dotColor ?? "#f59e0b")
          : (category?.badgeBorder ?? "rgba(147, 197, 253, 0.8)"),
        color: category?.badgeText ?? "#1d4ed8",
      }}
      className={`group absolute left-1 right-1 z-10 flex flex-col justify-start overflow-hidden rounded-md border p-1.5 cursor-pointer transition-all duration-150 hover:brightness-95 hover:shadow-xs active:scale-[0.99] select-none ${
        isSelected ? "ring-2 ring-amber-400/80 shadow-sm" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[11px] font-semibold leading-tight">
          {event.title}
        </span>
      </div>
      {height >= 34 && (
        <span className="truncate text-[10px] font-medium opacity-80 leading-tight">
          {event.startTime} - {event.endTime}
        </span>
      )}
    </div>
  );
};
