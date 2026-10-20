import React, { useRef } from "react";

import type { TimeIndicatorValue } from "./grid/grid-constants";
import type { CalendarCategory, CalendarEvent } from "./types";

import { CalendarGridEvent } from "./grid/calendar-grid-event";
import { CalendarTimeGutter } from "./grid/calendar-time-gutter";
import { CalendarTimeIndicator } from "./grid/calendar-time-indicator";
import {
  calculateEventPosition,
  calculateIndicatorTop,
  calculateSlotTimeFromOffset,
  DEFAULT_WEEK_HOUR_HEIGHT,
  HOURS,
  START_HOUR,
} from "./grid/grid-constants";

export interface CalendarWeekDayItem {
  name: string; // "Mon", "Tue", etc.
  dayNumber: number; // 12, 13, etc.
  dateStr: string; // "2026-10-12"
  isToday: boolean;
}

export interface CalendarWeekGridProps {
  days: CalendarWeekDayItem[];
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onSelectEvent: (event: CalendarEvent, e: React.MouseEvent) => void;
  onSlotClick?: (dateStr: string, timeStr: string) => void;
  selectedEventId?: string | null;
  currentTime: TimeIndicatorValue;
}

export const CalendarWeekGrid: React.FC<CalendarWeekGridProps> = ({
  days,
  events,
  categories,
  onSelectEvent,
  onSlotClick,
  selectedEventId,
  currentTime,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Quick lookup for category by id
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Calculate current time line top offset
  const currentIndicatorTop = calculateIndicatorTop(
    currentTime,
    DEFAULT_WEEK_HOUR_HEIGHT,
    START_HOUR,
  );

  // Filter events whose category is checked
  const visibleEvents = events.filter((evt) => {
    const cat = categoryMap.get(evt.calendarId);
    return cat ? cat.checked : true;
  });

  // Auto-scroll near current hour on mount
  React.useEffect(() => {
    if (containerRef.current) {
      const scrollHour = Math.max(0, Math.min(currentTime.hours - 1, 18));
      containerRef.current.scrollTop = scrollHour * DEFAULT_WEEK_HOUR_HEIGHT;
    }

    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-background select-none"
    >
      {/* Sticky Header with Day Columns */}
      <div className="sticky top-0 z-20 flex border-b border-border/70 bg-background/95 backdrop-blur-xs">
        {/* GMT Timezone cell */}
        <div className="w-14 shrink-0 border-r border-border/70 p-2.5 text-center text-[11px] font-medium text-muted-foreground">
          GMT+7
        </div>

        {/* 7 Days Columns */}
        <div className="grid flex-1 grid-cols-7 divide-x divide-border/70">
          {days.map((day) => (
            <div
              key={day.dateStr}
              className="flex items-center justify-center gap-1.5 py-2 text-center"
            >
              <span className="text-[12px] font-medium text-muted-foreground">
                {day.name}
              </span>
              {day.isToday ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                  {day.dayNumber}
                </span>
              ) : (
                <span className="text-[12px] font-semibold text-foreground">
                  {day.dayNumber}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid Body */}
      <div className="relative flex flex-1">
        {/* Left Time Column with Labels */}
        <CalendarTimeGutter
          hourHeight={DEFAULT_WEEK_HOUR_HEIGHT}
          currentIndicatorTop={currentIndicatorTop}
          currentTime={currentTime}
          showBadge={true}
          widthClass="w-14"
          paddingRightClass="pr-2"
        />

        {/* 7 Day Columns Grid Content */}
        <div className="relative grid flex-1 grid-cols-7 divide-x divide-border/70">
          {/* Background horizontal hour grid lines across all columns */}
          <div className="pointer-events-none absolute inset-0 z-0">
            {HOURS.map((hourKey) => (
              <div
                key={hourKey}
                style={{ height: DEFAULT_WEEK_HOUR_HEIGHT }}
                className="border-b border-border/40"
              />
            ))}
          </div>

          {/* Current Time Red/Orange Line Across All Days */}
          <CalendarTimeIndicator top={currentIndicatorTop} />

          {/* Individual Day Columns with Events */}
          {days.map((day) => {
            const dayEvents = visibleEvents.filter(
              (evt) => evt.date === day.dateStr,
            );

            return (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events
              <div
                key={day.dateStr}
                onClick={(e) => {
                  if (e.target === e.currentTarget && onSlotClick) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const offsetY = e.clientY - rect.top;
                    const slotTime = calculateSlotTimeFromOffset(
                      offsetY,
                      DEFAULT_WEEK_HOUR_HEIGHT,
                      START_HOUR,
                    );
                    onSlotClick(day.dateStr, slotTime);
                  }
                }}
                className="relative z-10 min-h-full"
                style={{ height: HOURS.length * DEFAULT_WEEK_HOUR_HEIGHT }}
              >
                {/* Current Time Dot on Today column */}
                {day.isToday && (
                  <div
                    style={{ top: currentIndicatorTop - 4, left: -4 }}
                    className="pointer-events-none absolute z-30 size-2.5 rounded-full bg-[#e05638] ring-2 ring-background"
                  />
                )}

                {/* Event Cards */}
                {dayEvents.map((event) => {
                  const { top, height } = calculateEventPosition(
                    event.startTime,
                    event.endTime,
                    DEFAULT_WEEK_HOUR_HEIGHT,
                    START_HOUR,
                  );
                  const category = categoryMap.get(event.calendarId);

                  return (
                    <CalendarGridEvent
                      key={event.id}
                      event={event}
                      category={category}
                      top={top}
                      height={height}
                      isSelected={selectedEventId === event.id}
                      onSelect={onSelectEvent}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
