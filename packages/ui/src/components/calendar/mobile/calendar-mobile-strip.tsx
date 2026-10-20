import { Button } from "@ui/button";
import { getWeekDays } from "@yaad/core/store/use-calendar-store";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useMemo } from "react";

import { useMobileMonthGrid } from "./use-mobile-month-grid";

export interface CalendarMobileStripProps {
  currentDate: Date;
  currentDateStr: string;
  todayStr: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectDate: (date: Date, dateStr: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onGoToToday: () => void;
  eventDatesSet: Set<string>;
}

export const CalendarMobileStrip: React.FC<CalendarMobileStripProps> = ({
  currentDate,
  currentDateStr,
  todayStr,
  isExpanded,
  onToggleExpand,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
  onGoToToday,
  eventDatesSet,
}) => {
  const isTodaySelected = currentDateStr === todayStr;

  const monthTitle = useMemo(() => {
    return currentDate.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return getWeekDays(currentDate, todayStr);
  }, [currentDate, todayStr]);

  const miniMonthDays = useMobileMonthGrid({
    currentDate,
    isExpanded,
    eventDatesSet,
  });

  return (
    <section className="shrink-0 border-b border-border/70 bg-card/60 px-4 pt-3 pb-2 select-none">
      {/* Month Title & Chevron Navigation */}
      <div className="flex items-center justify-between pb-2.5">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex items-center gap-1.5 font-bold text-[15px] text-foreground hover:text-primary transition-colors"
        >
          <span>{monthTitle}</span>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
            strokeWidth={1.5}
          />
        </button>

        <div className="flex items-center gap-2">
          {!isTodaySelected && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onGoToToday}
              className="text-[12px] font-semibold text-primary hover:text-primary px-1.5 h-6"
            >
              Today
            </Button>
          )}

          <div className="flex items-center rounded-lg border border-border/70 p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onPrevWeek}
              aria-label="Previous week"
              title="Previous week"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-3.5" strokeWidth={1.5} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onNextWeek}
              aria-label="Next week"
              title="Next week"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-3.5" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* EXPANDED FULL MONTH GRID */}
      {isExpanded && (
        <div className="pb-3 pt-1 border-t border-border/50 animate-in fade-in duration-150">
          <div className="grid grid-cols-7 text-center pb-1 text-[11px] font-medium text-muted-foreground">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>S</span>
          </div>
          <div className="grid grid-cols-7 text-center gap-y-1 text-[12px]">
            {miniMonthDays.map((cell) => {
              const isSelected = cell.dateStr === currentDateStr;
              const isToday = cell.dateStr === todayStr;

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => onSelectDate(cell.date, cell.dateStr)}
                  className={`relative flex size-8 mx-auto flex-col items-center justify-center rounded-full transition-all ${
                    isSelected
                      ? "bg-[#e05638] font-bold text-white shadow-xs"
                      : isToday
                        ? "border border-[#e05638] text-[#e05638] font-bold"
                        : cell.isCurrentMonth
                          ? "text-foreground hover:bg-muted"
                          : "text-muted-foreground/35"
                  }`}
                >
                  <span>{cell.dayNum}</span>
                  {cell.hasEvents && !isSelected && (
                    <span className="absolute bottom-1 size-1 rounded-full bg-[#e05638]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 7-DAY HORIZONTAL WEEK STRIP (When collapsed) */}
      {!isExpanded && (
        <div>
          {/* Weekday Letters: M T W T F S S */}
          <div className="grid grid-cols-7 text-center pb-1 text-[11px] font-medium text-muted-foreground">
            {weekDays.map((d) => (
              <span key={d.name}>{d.name.charAt(0)}</span>
            ))}
          </div>

          {/* Date Numbers with Active Circle */}
          <div className="grid grid-cols-7 text-center items-center">
            {weekDays.map((d) => {
              const isSelected = d.dateStr === currentDateStr;
              const hasEvents = eventDatesSet.has(d.dateStr);

              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => onSelectDate(d.date, d.dateStr)}
                  className="flex flex-col items-center justify-center group py-0.5"
                >
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-[13px] font-medium transition-all ${
                      isSelected
                        ? "bg-[#e05638] font-bold text-white shadow-sm scale-105"
                        : d.isToday
                          ? "border border-[#e05638] text-[#e05638] font-bold"
                          : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {d.dayNumber}
                  </div>

                  {/* Event indicator dot */}
                  <div className="h-1 flex items-center justify-center mt-0.5">
                    {hasEvents && !isSelected && (
                      <span className="size-1 rounded-full bg-muted-foreground/70" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
