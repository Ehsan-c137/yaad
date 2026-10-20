import { formatDateToISO } from "@yaad/core/store/use-calendar-store";
import { useMemo } from "react";

import type { CalendarEvent, CalendarMobileTab } from "../types";
import type { AgendaDayGroup } from "./types";

interface UseMobileAgendaOptions {
  currentDate: Date;
  activeTab: CalendarMobileTab;
  visibleEvents: CalendarEvent[];
  todayStr: string;
}

export function useMobileAgenda({
  currentDate,
  activeTab,
  visibleEvents,
  todayStr,
}: UseMobileAgendaOptions): AgendaDayGroup[] {
  return useMemo(() => {
    const list: AgendaDayGroup[] = [];
    const daysToShow =
      activeTab === "today" ? 1 : activeTab === "upcoming" ? 14 : 7;
    const startDt = activeTab === "today" ? new Date() : currentDate;

    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(startDt);
      d.setDate(startDt.getDate() + i);
      const dateStr = formatDateToISO(d);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      const monthShort = d.toLocaleDateString("en-US", { month: "short" });
      const dayNum = d.getDate();

      let headerDateLabel = `${monthShort} ${dayNum} · ${dayName}`;

      if (dateStr === todayStr) {
        headerDateLabel = `${monthShort} ${dayNum} · Today · ${dayName}`;
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (dateStr === formatDateToISO(tomorrow)) {
          headerDateLabel = `${monthShort} ${dayNum} · Tomorrow · ${dayName}`;
        }
      }

      const dayEvents = visibleEvents
        .filter((evt) => evt.date === dateStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      list.push({
        date: d,
        dateStr,
        headerDateLabel,
        events: dayEvents,
        isToday: dateStr === todayStr,
      });
    }

    return list;
  }, [currentDate, activeTab, visibleEvents, todayStr]);
}
