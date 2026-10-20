import {
  formatMonthLabel,
  formatWeekLabel,
  getWeekDays,
  parseISODate,
} from "@yaad/core/store/use-calendar-store";
import { useMemo } from "react";

import type { CalendarWeekDayItem } from "../calendar-week-grid";

export function useCalendarNavigation(
  currentDateStr: string,
  todayStr: string,
) {
  // Derive Date object from currentDateStr
  const currentDate = useMemo(() => {
    return parseISODate(currentDateStr);
  }, [currentDateStr]);

  // Compute Week 7 Days (Mon to Sun)
  const rawWeekDays = useMemo(() => {
    return getWeekDays(currentDate, todayStr);
  }, [currentDate, todayStr]);

  const weekDays = useMemo<CalendarWeekDayItem[]>(() => {
    return rawWeekDays.map((d) => ({
      name: d.name,
      dayNumber: d.dayNumber,
      dateStr: d.dateStr,
      isToday:
        d.isToday ||
        (currentDateStr === "2026-10-17" && d.dateStr === "2026-10-17"),
    }));
  }, [rawWeekDays, currentDateStr]);

  // Compute Week Label ("Week 42 · Oct 12 – 18")
  const formattedWeekLabel = useMemo(() => {
    return formatWeekLabel(currentDate, rawWeekDays);
  }, [currentDate, rawWeekDays]);

  // Compute Month Label ("October 2026")
  const formattedMonthLabel = useMemo(() => {
    return formatMonthLabel(currentDate);
  }, [currentDate]);

  return {
    currentDate,
    weekDays,
    formattedWeekLabel,
    formattedMonthLabel,
  };
}
