import { Button } from "@ui/button";
import {
  formatDateToISO,
  getTodayDateString,
  useCalendarStore,
} from "@yaad/core/store/use-calendar-store";
import { Plus } from "lucide-react";
import React, { useMemo, useState } from "react";

import type { CalendarMobileViewProps } from "./mobile/types";
import type { CalendarMobileTab } from "./types";

import { CalendarMobileAgenda } from "./mobile/calendar-mobile-agenda";
import { CalendarMobileDock } from "./mobile/calendar-mobile-dock";
import { CalendarMobileHeader } from "./mobile/calendar-mobile-header";
import { CalendarMobileStrip } from "./mobile/calendar-mobile-strip";
import { useMobileAgenda } from "./mobile/use-mobile-agenda";

export type { CalendarMobileViewProps };

export const CalendarMobileView: React.FC<CalendarMobileViewProps> = ({
  currentDate,
  onSelectDate,
  events,
  categories,
  onSelectEvent,
  onOpenNewEvent,
  onOpenSearch,
  onOpenProviders,
  connectedProvidersCount,
  showDock = true,
}) => {
  const currentDateStr = useCalendarStore((s) => s.currentDateStr);
  const setCurrentDateStr = useCalendarStore((s) => s.setCurrentDate);
  const goToToday = useCalendarStore((s) => s.goToToday);
  const toggleCategory = useCalendarStore((s) => s.toggleCategory);
  const storeMobileTab = useCalendarStore((s) => s.mobileTab);
  const setStoreMobileTab = useCalendarStore((s) => s.setMobileTab);

  const [localActiveTab, setLocalActiveTab] =
    useState<CalendarMobileTab>("inbox");
  const activeTab = storeMobileTab || localActiveTab;

  const setActiveTab = (tab: CalendarMobileTab) => {
    setLocalActiveTab(tab);
    setStoreMobileTab(tab);
  };

  const [isMonthExpanded, setIsMonthExpanded] = useState(false);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Filter visible events based on category.checked
  const visibleEvents = useMemo(() => {
    return events.filter((evt) => {
      const cat = categoryMap.get(evt.calendarId);
      return cat ? cat.checked : true;
    });
  }, [events, categoryMap]);

  // Set of dates that have active events (for dot indicators)
  const eventDatesSet = useMemo(() => {
    const set = new Set<string>();

    for (const evt of visibleEvents) {
      set.add(evt.date);
    }

    return set;
  }, [visibleEvents]);

  // Week navigation
  const handlePrevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    onSelectDate(d);
    setCurrentDateStr(formatDateToISO(d));
  };

  const handleNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    onSelectDate(d);
    setCurrentDateStr(formatDateToISO(d));
  };

  const handleSelectDay = (date: Date, dateStr: string) => {
    onSelectDate(date);
    setCurrentDateStr(dateStr);
  };

  const handleGoToToday = () => {
    goToToday();
    onSelectDate(new Date());
  };

  const handleTabClick = (tab: CalendarMobileTab) => {
    setActiveTab(tab);

    if (tab === "today") {
      handleGoToToday();
    } else if (tab === "browse") {
      onOpenProviders();
    }
  };

  // Agenda day groups calculated via pure domain hook
  const agendaDays = useMobileAgenda({
    currentDate,
    activeTab,
    visibleEvents,
    todayStr,
  });

  return (
    <div className="relative flex h-full w-full flex-col bg-background text-foreground select-none overflow-hidden">
      {/* 1. Header App Bar & Popups */}
      <CalendarMobileHeader
        activeTab={activeTab}
        isMonthExpanded={isMonthExpanded}
        onToggleMonthExpand={() => setIsMonthExpanded((prev) => !prev)}
        categories={categories}
        onToggleCategory={toggleCategory}
        onOpenSearch={onOpenSearch}
        onOpenProviders={onOpenProviders}
        onGoToToday={handleGoToToday}
      />

      {/* 2. Date Strip & Expandable Month Grid */}
      <CalendarMobileStrip
        currentDate={currentDate}
        currentDateStr={currentDateStr}
        todayStr={todayStr}
        isExpanded={isMonthExpanded}
        onToggleExpand={() => setIsMonthExpanded((prev) => !prev)}
        onSelectDate={handleSelectDay}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onGoToToday={handleGoToToday}
        eventDatesSet={eventDatesSet}
      />

      {/* 3. Grouped Agenda Feed */}
      <CalendarMobileAgenda
        agendaDays={agendaDays}
        categoryMap={categoryMap}
        onSelectEvent={onSelectEvent}
        onOpenNewEvent={onOpenNewEvent}
      />

      {/* 4. Floating Action Button (FAB) above dock */}
      {showDock && (
        <Button
          type="button"
          onClick={() => onOpenNewEvent()}
          aria-label="Add new event"
          title="Add new event"
          className="fixed right-5 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 ease-(--spring) hover:scale-105 active:scale-95"
          style={{
            bottom:
              "calc(max(1rem, calc(0.75rem + env(safe-area-inset-bottom, 0px))) + 68px + 12px)",
          }}
        >
          <Plus className="size-6" strokeWidth={2.2} />
        </Button>
      )}

      {/* 5. Optional Standalone Navigation Dock */}
      {showDock && (
        <CalendarMobileDock
          activeTab={activeTab}
          onTabClick={handleTabClick}
          connectedProvidersCount={connectedProvidersCount}
        />
      )}
    </div>
  );
};
