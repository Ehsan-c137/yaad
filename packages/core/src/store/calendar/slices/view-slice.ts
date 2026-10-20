import type { StateCreator } from "zustand";

import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";

import type {
  CalendarMobileTab,
  CalendarState,
  CalendarViewMode,
  CalendarViewSlice,
  SidebarTab,
} from "../types";

import {
  formatDateToISO,
  getTodayDateString,
  parseISODate,
} from "../calendar-utils";

export const createViewSlice: StateCreator<
  CalendarState,
  [],
  [],
  CalendarViewSlice
> = (set, get) => ({
  currentDateStr: "2026-10-17",
  viewMode: "week",
  activeTab: "calendar",
  mobileTab: "inbox",
  isProviderModalOpen: false,
  isEventModalOpen: false,
  selectedEventId: "evt-sun-1",

  setMobileTab: (tab: CalendarMobileTab) => {
    set({ mobileTab: tab });

    if (tab === "today") {
      get().goToToday();
    }
  },

  setIsProviderModalOpen: (open: boolean) => {
    set({ isProviderModalOpen: open });
  },

  setIsEventModalOpen: (open: boolean) => {
    set({ isEventModalOpen: open });
  },

  setActiveTab: (tab: SidebarTab) => {
    set({ activeTab: tab });

    if (tab === "today") {
      get().goToToday();
    }
  },

  setViewMode: (mode: CalendarViewMode) => {
    set({ viewMode: mode });
  },

  setCurrentDate: (dateStr: string) => {
    set({ currentDateStr: dateStr });
  },

  goToToday: () => {
    set({ currentDateStr: getTodayDateString() });
  },

  goToPrev: () => {
    const dt = parseISODate(get().currentDateStr);
    const mode = get().viewMode;
    let nextDate: Date;
    if (mode === "day") nextDate = subDays(dt, 1);
    else if (mode === "week") nextDate = subWeeks(dt, 1);
    else nextDate = subMonths(dt, 1);

    set({ currentDateStr: formatDateToISO(nextDate) });
  },

  goToNext: () => {
    const dt = parseISODate(get().currentDateStr);
    const mode = get().viewMode;
    let nextDate: Date;
    if (mode === "day") nextDate = addDays(dt, 1);
    else if (mode === "week") nextDate = addWeeks(dt, 1);
    else nextDate = addMonths(dt, 1);

    set({ currentDateStr: formatDateToISO(nextDate) });
  },

  selectEvent: (id: string | null) => {
    set({ selectedEventId: id });
  },
});
