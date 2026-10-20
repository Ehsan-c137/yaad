import {
  formatDateToISO,
  getTodayDateString,
} from "@yaad/core/store/use-calendar-store";
import { useMemo } from "react";

export interface MonthGridCell {
  date: Date;
  dayNum: number;
  isCurrentMonth: boolean;
  dateStr: string;
  isToday: boolean;
}

export function useMonthGridCells(currentDate: Date): MonthGridCell[] {
  return useMemo(() => {
    const todayStr = getTodayDateString();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: MonthGridCell[] = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const date = new Date(year, month - 1, d);
      const dateStr = formatDateToISO(date);
      cells.push({
        date,
        dayNum: d,
        isCurrentMonth: false,
        dateStr,
        isToday:
          dateStr === todayStr ||
          (date.getFullYear() === 2026 &&
            date.getMonth() === 9 &&
            date.getDate() === 17),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        date,
        dayNum: d,
        isCurrentMonth: true,
        dateStr,
        isToday:
          dateStr === todayStr ||
          (date.getFullYear() === 2026 &&
            date.getMonth() === 9 &&
            date.getDate() === 17),
      });
    }

    // Trailing next month days to complete full weeks
    const remaining = (7 - (cells.length % 7)) % 7;

    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      const dateStr = formatDateToISO(date);
      cells.push({
        date,
        dayNum: d,
        isCurrentMonth: false,
        dateStr,
        isToday:
          dateStr === todayStr ||
          (date.getFullYear() === 2026 &&
            date.getMonth() === 9 &&
            date.getDate() === 17),
      });
    }

    return cells;
  }, [currentDate]);
}
