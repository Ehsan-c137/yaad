import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Plus } from "lucide-react";
import React from "react";

import type { CalendarCategory, CalendarEvent } from "../types";
import type { AgendaDayGroup } from "./types";

import { CalendarMobileEventCard } from "./calendar-mobile-event-card";

export interface CalendarMobileAgendaProps {
  agendaDays: AgendaDayGroup[];
  categoryMap: Map<string, CalendarCategory>;
  onSelectEvent: (event: CalendarEvent, e?: React.MouseEvent) => void;
  onOpenNewEvent: (dateStr: string) => void;
}

export const CalendarMobileAgenda: React.FC<CalendarMobileAgendaProps> = ({
  agendaDays,
  categoryMap,
  onSelectEvent,
  onOpenNewEvent,
}) => {
  return (
    <main className="flex-1 overflow-y-auto px-4 pt-3 pb-28 space-y-5 scroll-fade">
      {agendaDays.map((dayGroup) => (
        <section key={dayGroup.dateStr} className="flex flex-col gap-2">
          {/* Date Group Header: e.g. "Feb 5 · Tomorrow · Thursday" */}
          <div className="flex items-baseline justify-between pt-1">
            <h3 className="text-[14px] font-bold text-foreground tracking-tight">
              {dayGroup.headerDateLabel}
            </h3>
            {dayGroup.events.length > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] font-medium h-4 px-1.5"
              >
                {dayGroup.events.length}{" "}
                {dayGroup.events.length === 1 ? "event" : "events"}
              </Badge>
            )}
          </div>

          {/* Events for this day */}
          {dayGroup.events.length === 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenNewEvent(dayGroup.dateStr)}
              className="w-full justify-start border-dashed text-xs text-muted-foreground h-9 gap-2 rounded-xl"
            >
              <Plus className="size-3.5" strokeWidth={1.5} />
              <span>No events. Tap to schedule.</span>
            </Button>
          ) : (
            <div className="flex flex-col gap-2.5">
              {dayGroup.events.map((evt) => (
                <CalendarMobileEventCard
                  key={evt.id}
                  event={evt}
                  category={categoryMap.get(evt.calendarId)}
                  onClick={(e) => onSelectEvent(evt, e)}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </main>
  );
};
