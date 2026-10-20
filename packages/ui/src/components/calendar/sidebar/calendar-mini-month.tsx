import { Button } from "@ui/button";
import {
  formatDateToISO,
  getTodayDateString,
} from "@yaad/core/store/use-calendar-store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

interface CalendarMiniMonthProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

export const CalendarMiniMonth: React.FC<CalendarMiniMonthProps> = ({
  currentDate,
  onSelectDate,
}) => {
  const [miniCalMonth, setMiniCalMonth] = useState(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
  );

  useEffect(() => {
    setMiniCalMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    );
  }, [currentDate]);

  const todayStr = useMemo(() => getTodayDateString(), []);
  const selectedDateStr = useMemo(
    () => formatDateToISO(currentDate),
    [currentDate],
  );

  const handlePrevMonth = () => {
    setMiniCalMonth(
      new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setMiniCalMonth(
      new Date(miniCalMonth.getFullYear(), miniCalMonth.getMonth() + 1, 1),
    );
  };

  const monthTitle = miniCalMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const miniCalendarCells = useMemo(() => {
    const year = miniCalMonth.getFullYear();
    const month = miniCalMonth.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const leadEmptyDays = (firstDayOfWeek + 6) % 7; // Mon = 0
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: {
      day: number;
      isCurrentMonth: boolean;
      date: Date;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // Leading days
    for (let i = leadEmptyDays - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const date = new Date(year, month - 1, d);
      const dateStr = formatDateToISO(date);
      cells.push({
        day: d,
        isCurrentMonth: false,
        date,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDateStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = formatDateToISO(date);
      cells.push({
        day: d,
        isCurrentMonth: true,
        date,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDateStr,
      });
    }

    // Trailing days
    const remaining = (7 - (cells.length % 7)) % 7;

    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      const dateStr = formatDateToISO(date);
      cells.push({
        day: d,
        isCurrentMonth: false,
        date,
        isToday: dateStr === todayStr,
        isSelected: dateStr === selectedDateStr,
      });
    }

    return cells;
  }, [miniCalMonth, todayStr, selectedDateStr]);

  return (
    <div className="flex flex-col">
      {/* Mini Calendar Header */}
      <div className="flex items-center justify-between pb-3">
        <span className="text-[13px] font-semibold text-foreground">
          {monthTitle}
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            title="Previous month"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={handleNextMonth}
            aria-label="Next month"
            title="Next month"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-3" />
          </Button>
        </div>
      </div>

      {/* Weekday headers: M T W T F S S */}
      <div className="grid grid-cols-7 text-center pb-1 text-[11px] font-medium text-muted-foreground">
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
        <span>S</span>
      </div>

      {/* Mini Calendar Grid */}
      <div className="grid grid-cols-7 text-center gap-y-1 text-[12px]">
        {miniCalendarCells.map((cell, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectDate(cell.date)}
            className={`flex size-6 mx-auto items-center justify-center rounded-full transition-colors ${
              cell.isSelected
                ? "bg-foreground font-bold text-background shadow-2xs"
                : cell.isToday
                  ? "border border-primary font-bold text-primary"
                  : cell.isCurrentMonth
                    ? "text-foreground hover:bg-muted/70"
                    : "text-muted-foreground/40"
            }`}
          >
            {cell.day}
          </button>
        ))}
      </div>
    </div>
  );
};
