import { Badge } from "@ui/badge";
import { formatDateToISO } from "@yaad/core/store/use-calendar-store";
import React, { useMemo } from "react";

import type { CalendarCategory, CalendarEvent } from "../types";

interface CalendarUpcomingAgendaProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onSelectEvent: (event: CalendarEvent, e: React.MouseEvent) => void;
}

export const CalendarUpcomingAgenda: React.FC<CalendarUpcomingAgendaProps> = ({
  currentDate,
  events,
  categories,
  onSelectEvent,
}) => {
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  // Build dynamic upcoming 7 days starting from currentDate
  const upcomingDays = useMemo(() => {
    const list = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() + i);
      const dateStr = formatDateToISO(d);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();

      let headerLabel = `${dayName} ${dayNum}`;

      if (i === 0) {
        headerLabel = `Today, ${dayName} ${dayNum}`;
      } else if (i === 1) {
        headerLabel = `Tomorrow, ${dayName} ${dayNum}`;
      }

      const dayEvents = events
        .filter((evt) => {
          const cat = categoryMap.get(evt.calendarId);
          return evt.date === dateStr && (cat ? cat.checked : true);
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      list.push({
        date: d,
        dateStr,
        headerLabel,
        events: dayEvents,
        isFirstDay: i === 0,
      });
    }

    return list;
  }, [currentDate, events, categoryMap]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-foreground">
          Upcoming
        </span>
        <Badge variant="outline" className="text-[10px] font-medium h-4 px-1.5">
          Next 7 days
        </Badge>
      </div>

      {upcomingDays.map((dayGroup) => (
        <div key={dayGroup.dateStr} className="flex flex-col gap-1 pt-1">
          <div className="text-[12px] font-medium text-muted-foreground">
            {dayGroup.headerLabel}
          </div>

          {dayGroup.events.length === 0 ? (
            dayGroup.isFirstDay ? (
              <p className="text-[11px] text-muted-foreground/60 pl-1">
                No more events today
              </p>
            ) : null
          ) : (
            <div className="flex flex-col gap-1">
              {dayGroup.events.map((evt) => {
                const cat = categoryMap.get(evt.calendarId);
                return (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                  <div
                    key={evt.id}
                    onClick={(e) => onSelectEvent(evt, e)}
                    className="flex items-start gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted/70 cursor-pointer"
                  >
                    <span
                      className="size-2 shrink-0 rounded-[2px] mt-1"
                      style={{ backgroundColor: cat?.dotColor ?? "#3b82f6" }}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-[12px] font-semibold text-foreground">
                        {evt.title}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {evt.startTime} - {evt.endTime} · {cat?.name ?? "Event"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
