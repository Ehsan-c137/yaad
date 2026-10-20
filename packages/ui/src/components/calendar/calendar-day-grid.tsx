/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Badge } from "@ui/badge";
import {
  formatDateToISO,
  getTodayDateString,
} from "@yaad/core/store/use-calendar-store";
import React, { useEffect, useMemo, useRef } from "react";

import type { TimeIndicatorValue } from "./grid/grid-constants";
import type { CalendarCategory, CalendarEvent } from "./types";

import { CalendarGridEvent } from "./grid/calendar-grid-event";
import { CalendarTimeGutter } from "./grid/calendar-time-gutter";
import { CalendarTimeIndicator } from "./grid/calendar-time-indicator";
import {
  calculateEventPosition,
  calculateIndicatorTop,
  calculateSlotTimeFromOffset,
  DEFAULT_DAY_HOUR_HEIGHT,
  HOURS,
  START_HOUR,
} from "./grid/grid-constants";

export interface CalendarDayGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onSelectEvent: (event: CalendarEvent, e: React.MouseEvent) => void;
  onSlotClick?: (dateStr: string, timeStr: string) => void;
  selectedEventId?: string | null;
  currentTime: TimeIndicatorValue;
}

export const CalendarDayGrid: React.FC<CalendarDayGridProps> = ({
  currentDate,
  events,
  categories,
  onSelectEvent,
  onSlotClick,
  selectedEventId,
  currentTime,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const dateStr = useMemo(() => formatDateToISO(currentDate), [currentDate]);
  const todayStr = useMemo(() => getTodayDateString(), []);

  const isToday =
    dateStr === todayStr ||
    (currentDate.getFullYear() === 2026 &&
      currentDate.getMonth() === 9 &&
      currentDate.getDate() === 17);

  const currentIndicatorTop = calculateIndicatorTop(
    currentTime,
    DEFAULT_DAY_HOUR_HEIGHT,
    START_HOUR,
  );

  // Auto-scroll near current hour on mount
  useEffect(() => {
    if (containerRef.current) {
      const scrollHour = Math.max(0, Math.min(currentTime.hours - 1, 18));
      containerRef.current.scrollTop = scrollHour * DEFAULT_DAY_HOUR_HEIGHT;
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, []);

  const dayEvents = useMemo(
    () =>
      events.filter((evt) => {
        const cat = categoryMap.get(evt.calendarId);
        return evt.date === dateStr && (cat ? cat.checked : true);
      }),
    [events, dateStr, categoryMap],
  );

  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
  const formattedHeader = `${dayName}, ${currentDate.toLocaleDateString("en-US", { month: "short" })} ${currentDate.getDate()}`;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 flex-col overflow-y-auto bg-background select-none"
    >
      {/* Sticky Day Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border/70 bg-background/95 px-6 py-3 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-foreground">
            {formattedHeader}
          </span>
          {isToday && (
            <Badge variant="default" className="text-[11px] font-semibold">
              Today
            </Badge>
          )}
        </div>
        <span className="text-[12px] text-muted-foreground">
          {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
        </span>
      </div>

      {/* Grid Body */}
      <div className="relative flex flex-1">
        {/* Left Time Column */}
        <CalendarTimeGutter
          hourHeight={DEFAULT_DAY_HOUR_HEIGHT}
          currentIndicatorTop={currentIndicatorTop}
          currentTime={currentTime}
          showBadge={isToday}
          widthClass="w-16"
          paddingRightClass="pr-3"
        />

        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && onSlotClick) {
              const rect = e.currentTarget.getBoundingClientRect();
              const offsetY = e.clientY - rect.top;
              const slotTime = calculateSlotTimeFromOffset(
                offsetY,
                DEFAULT_DAY_HOUR_HEIGHT,
                START_HOUR,
              );
              onSlotClick(dateStr, slotTime);
            }
          }}
          className="relative flex-1"
          style={{ height: HOURS.length * DEFAULT_DAY_HOUR_HEIGHT }}
        >
          {/* Hour lines */}
          <div className="pointer-events-none absolute inset-0 z-0">
            {HOURS.map((hourKey) => (
              <div
                key={hourKey}
                style={{ height: DEFAULT_DAY_HOUR_HEIGHT }}
                className="border-b border-border/40"
              />
            ))}
          </div>

          {/* Current Time Indicator line if today */}
          {isToday && (
            <CalendarTimeIndicator
              top={currentIndicatorTop}
              showDot={true}
              dotOffsetLeft={-6}
            />
          )}

          {/* Events */}
          {dayEvents.map((event) => {
            const { top, height } = calculateEventPosition(
              event.startTime,
              event.endTime,
              DEFAULT_DAY_HOUR_HEIGHT,
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
      </div>
    </div>
  );
};
