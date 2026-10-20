import {
  getTodayDateString,
  useCalendarStore,
} from "@yaad/core/store/use-calendar-store";
import React, { useMemo, useState } from "react";

import type { CalendarEvent } from "./types";

import { CalendarDayGrid } from "./calendar-day-grid";
import { CalendarEventModal } from "./calendar-event-modal";
import { CalendarEventPopover } from "./calendar-event-popover";
import { CalendarHeader } from "./calendar-header";
import { CalendarMobileView } from "./calendar-mobile-view";
import { CalendarMonthGrid } from "./calendar-month-grid";
import { CalendarProviderModal } from "./calendar-provider-modal";
import { CalendarSearchDialog } from "./calendar-search-dialog";
import { CalendarSidebarRight } from "./calendar-sidebar-right";
import { CalendarWeekGrid } from "./calendar-week-grid";
import { useCalendarNavigation } from "./hooks/use-calendar-navigation";
import { useCurrentTime } from "./use-current-time";

export const DaymarkCalendar: React.FC = () => {
  // Global Calendar Store
  const events = useCalendarStore((s) => s.events);
  const categories = useCalendarStore((s) => s.categories);
  const providers = useCalendarStore((s) => s.providers);
  const currentDateStr = useCalendarStore((s) => s.currentDateStr);
  const viewMode = useCalendarStore((s) => s.viewMode);
  const selectedEventId = useCalendarStore((s) => s.selectedEventId);

  const setViewMode = useCalendarStore((s) => s.setViewMode);
  const setCurrentDateStr = useCalendarStore((s) => s.setCurrentDate);
  const goToToday = useCalendarStore((s) => s.goToToday);
  const goToPrev = useCalendarStore((s) => s.goToPrev);
  const goToNext = useCalendarStore((s) => s.goToNext);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);
  const duplicateEvent = useCalendarStore((s) => s.duplicateEvent);
  const selectEvent = useCalendarStore((s) => s.selectEvent);

  const currentTime = useCurrentTime();
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Pure navigation calculations (Dates, 7-day week, labels)
  const { currentDate, weekDays, formattedWeekLabel, formattedMonthLabel } =
    useCalendarNavigation(currentDateStr, todayStr);

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) ?? null;
  }, [events, selectedEventId]);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedEvent?.calendarId);
  }, [categories, selectedEvent]);

  // Dialog & Popover UI States
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultSlot, setDefaultSlot] = useState<{
    date: string;
    time: string;
  }>(() => ({
    date: currentDateStr || todayStr,
    time: "10:00",
  }));

  // Store modal bridges (triggered from bottom dock or headers)
  const storeIsProviderModalOpen = useCalendarStore(
    (s) => s.isProviderModalOpen,
  );
  const storeSetIsProviderModalOpen = useCalendarStore(
    (s) => s.setIsProviderModalOpen,
  );
  const isEffectiveProviderModalOpen =
    isProviderModalOpen || storeIsProviderModalOpen;

  const storeIsEventModalOpen = useCalendarStore((s) => s.isEventModalOpen);
  const storeSetIsEventModalOpen = useCalendarStore(
    (s) => s.setIsEventModalOpen,
  );
  const isEffectiveEventModalOpen = isModalOpen || storeIsEventModalOpen;

  // Event Selection & Popover
  const handleSelectEvent = (event: CalendarEvent, e?: React.MouseEvent) => {
    selectEvent(event.id);

    if (e) {
      setPopoverAnchor(e.currentTarget as HTMLElement);
      setPopoverPos({ x: e.clientX, y: e.clientY });
    } else {
      setPopoverAnchor(null);
      setPopoverPos(null);
    }
  };

  const handleClosePopover = () => {
    selectEvent(null);
    setPopoverAnchor(null);
    setPopoverPos(null);
  };

  // Event Creation & Mutation Handlers
  const handleOpenNewEvent = () => {
    setEditingEvent(null);
    setDefaultSlot({
      date: currentDateStr,
      time: "10:00",
    });
    setIsModalOpen(true);
  };

  const handleSlotClick = (dateStr: string, timeStr: string) => {
    setEditingEvent(null);
    setDefaultSlot({ date: dateStr, time: timeStr });
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
    handleClosePopover();
  };

  const handleDuplicateEvent = (event: CalendarEvent) => {
    duplicateEvent(event.id);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    handleClosePopover();
  };

  const handleSaveEvent = (
    saved: Omit<CalendarEvent, "id"> & { id?: string },
  ) => {
    if (saved.id) {
      updateEvent(saved as CalendarEvent);
    } else {
      addEvent(saved);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground select-none">
      {/* 1. DESKTOP VIEW (Visible on md screens and up) */}
      <div className="hidden md:flex h-full w-full overflow-hidden min-w-0">
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <CalendarHeader
            currentDate={currentDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onPrev={goToPrev}
            onNext={goToNext}
            onToday={goToToday}
            onOpenNewEvent={handleOpenNewEvent}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenProviders={() => setIsProviderModalOpen(true)}
            connectedProvidersCount={providers.length}
            formattedWeekLabel={formattedWeekLabel}
            formattedMonthLabel={formattedMonthLabel}
          />

          {viewMode === "week" && (
            <CalendarWeekGrid
              days={weekDays}
              events={events}
              categories={categories}
              onSelectEvent={handleSelectEvent}
              onSlotClick={handleSlotClick}
              selectedEventId={selectedEvent?.id}
              currentTime={currentTime}
            />
          )}

          {viewMode === "day" && (
            <CalendarDayGrid
              currentDate={currentDate}
              events={events}
              categories={categories}
              onSelectEvent={handleSelectEvent}
              onSlotClick={handleSlotClick}
              selectedEventId={selectedEvent?.id}
              currentTime={currentTime}
            />
          )}

          {viewMode === "month" && (
            <CalendarMonthGrid
              currentDate={currentDate}
              events={events}
              categories={categories}
              onSelectEvent={handleSelectEvent}
              onSelectDate={(d) => {
                const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                setCurrentDateStr(str);
                setViewMode("week");
              }}
              selectedEventId={selectedEvent?.id}
            />
          )}
        </div>

        <CalendarSidebarRight
          currentDate={currentDate}
          onSelectDate={(d) => {
            const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            setCurrentDateStr(str);
          }}
          events={events}
          categories={categories}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {/* 2. MOBILE VIEW (Visible on screens < md) */}
      <div className="flex md:hidden h-full w-full flex-col overflow-hidden min-w-0">
        <CalendarMobileView
          currentDate={currentDate}
          onSelectDate={(d) => {
            const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            setCurrentDateStr(str);
          }}
          events={events}
          categories={categories}
          onSelectEvent={handleSelectEvent}
          onOpenNewEvent={(dateStr) => {
            setEditingEvent(null);
            setDefaultSlot({
              date: dateStr ?? currentDateStr,
              time: "10:00",
            });
            setIsModalOpen(true);
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProviders={() => storeSetIsProviderModalOpen(true)}
          connectedProvidersCount={providers.length}
          showDock={false}
        />
      </div>

      {/* Modals & Popovers */}
      {selectedEvent && (
        <CalendarEventPopover
          event={selectedEvent}
          category={selectedCategory}
          onClose={handleClosePopover}
          onEdit={handleEditEvent}
          onDuplicate={handleDuplicateEvent}
          onDelete={handleDeleteEvent}
          position={popoverPos}
          anchor={popoverAnchor}
        />
      )}

      <CalendarEventModal
        isOpen={isEffectiveEventModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          storeSetIsEventModalOpen(false);
        }}
        onSave={handleSaveEvent}
        categories={categories}
        initialEvent={editingEvent}
        defaultDate={defaultSlot.date}
        defaultTime={defaultSlot.time}
      />

      <CalendarSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        events={events}
        categories={categories}
        onSelectEvent={(evt) => {
          setCurrentDateStr(evt.date);
          handleSelectEvent(evt);
        }}
      />

      <CalendarProviderModal
        isOpen={isEffectiveProviderModalOpen}
        onClose={() => {
          setIsProviderModalOpen(false);
          storeSetIsProviderModalOpen(false);
        }}
      />
    </div>
  );
};
