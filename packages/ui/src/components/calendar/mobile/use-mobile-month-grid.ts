import { formatDateToISO } from "@yaad/core/store/use-calendar-store";
import { useMemo } from "react";

import type { MiniMonthCell } from "./types";

interface UseMobileMonthGridOptions {
  currentDate: Date;
  isExpanded: boolean;
  eventDatesSet: Set<string>;
}

export function useMobileMonthGrid({
  currentDate,
  isExpanded,
  eventDatesSet,
}: UseMobileMonthGridOptions): MiniMonthCell[] {
  return useMemo(() => {
    if (!isExpanded) return [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: MiniMonthCell[] = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const date = new Date(year, month - 1, dayNum);
      const str = formatDateToISO(date);
      cells.push({
        date,
        dateStr: str,
        dayNum,
        isCurrentMonth: false,
        hasEvents: eventDatesSet.has(str),
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const str = formatDateToISO(date);
      cells.push({
        date,
        dateStr: str,
        dayNum: d,
        isCurrentMonth: true,
        hasEvents: eventDatesSet.has(str),
      });
    }

    // Trailing days into next month
    const remaining = (7 - (cells.length % 7)) % 7;

    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d);
      const str = formatDateToISO(date);
      cells.push({
        date,
        dateStr: str,
        dayNum: d,
        isCurrentMonth: false,
        hasEvents: eventDatesSet.has(str),
      });
    }

    return cells;
  }, [isExpanded, currentDate, eventDatesSet]);
}
