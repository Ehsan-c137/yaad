/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useMemo } from "react";

import type { CalendarCategory, CalendarEvent } from "./types";

import { useMonthGridCells } from "./grid/use-month-grid";

export interface CalendarMonthGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onSelectEvent: (event: CalendarEvent, e: React.MouseEvent) => void;
  onSelectDate: (date: Date) => void;
  selectedEventId?: string | null;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const CalendarMonthGrid: React.FC<CalendarMonthGridProps> = ({
  currentDate,
  events,
  categories,
  onSelectEvent,
  onSelectDate,
  selectedEventId,
}) => {
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const cells = useMonthGridCells(currentDate);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-background select-none">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border/70 bg-background/95 text-center text-[12px] font-semibold text-muted-foreground py-2 backdrop-blur-xs">
        {WEEKDAYS.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      {/* Grid of days */}
      <div className="grid flex-1 grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60 border-b border-border/60">
        {cells.map((cell) => {
          const dayEvents = events.filter((evt) => {
            const cat = categoryMap.get(evt.calendarId);
            return evt.date === cell.dateStr && (cat ? cat.checked : true);
          });

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.date)}
              className={`min-h-[96px] p-1.5 flex flex-col gap-1 transition-colors hover:bg-muted/50 cursor-pointer ${
                !cell.isCurrentMonth
                  ? "bg-muted/20 text-muted-foreground/50"
                  : "text-foreground"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex size-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                    cell.isToday ? "bg-foreground text-background" : ""
                  }`}
                >
                  {cell.dayNum}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Event pills */}
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((evt) => {
                  const cat = categoryMap.get(evt.calendarId);
                  const isSelected = selectedEventId === evt.id;

                  return (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt, e);
                      }}
                      style={{
                        backgroundColor:
                          cat?.badgeBg ?? "rgba(219, 234, 254, 0.9)",
                        borderColor: isSelected
                          ? (cat?.dotColor ?? "#f59e0b")
                          : (cat?.badgeBorder ?? "rgba(147, 197, 253, 0.8)"),
                        color: cat?.badgeText ?? "#1d4ed8",
                      }}
                      className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium border cursor-pointer hover:brightness-95 transition-all ${
                        isSelected ? "ring-2 ring-amber-400" : ""
                      }`}
                    >
                      {evt.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] font-medium text-muted-foreground pl-0.5">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
