import { Separator } from "@ui/separator";
import React from "react";

import type { CalendarCategory, CalendarEvent } from "./types";

import { CalendarMiniMonth } from "./sidebar/calendar-mini-month";
import { CalendarUpcomingAgenda } from "./sidebar/calendar-upcoming-agenda";

export interface CalendarSidebarRightProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onSelectEvent: (event: CalendarEvent, e: React.MouseEvent) => void;
}

export const CalendarSidebarRight: React.FC<CalendarSidebarRightProps> = ({
  currentDate,
  onSelectDate,
  events,
  categories,
  onSelectEvent,
}) => {
  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-l border-border/70 bg-muted/30 p-4 text-sm select-none overflow-y-auto">
      {/* Mini Monthly Calendar */}
      <CalendarMiniMonth
        currentDate={currentDate}
        onSelectDate={onSelectDate}
      />

      {/* Separator */}
      <Separator className="my-5" />

      {/* Dynamic 7-day Upcoming Agenda */}
      <CalendarUpcomingAgenda
        currentDate={currentDate}
        events={events}
        categories={categories}
        onSelectEvent={onSelectEvent}
      />
    </aside>
  );
};
