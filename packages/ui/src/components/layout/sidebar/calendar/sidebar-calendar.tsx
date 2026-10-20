import { Button } from "@ui/button";
import {
  getTodayDateString,
  useCalendarStore,
} from "@yaad/core/store/use-calendar-store";
import {
  Calendar as CalendarIcon,
  Check,
  CheckSquare,
  Clock,
  Globe,
  Plus,
} from "lucide-react";
import React, { useMemo, useState } from "react";

import {
  CalendarProviderModal,
  GoogleLogo,
} from "@/components/calendar/calendar-provider-modal";
import { Separator } from "@/components/ui/separator";

export const SidebarCalendar: React.FC = () => {
  const categories = useCalendarStore((s) => s.categories);
  const toggleCategory = useCalendarStore((s) => s.toggleCategory);
  const activeTab = useCalendarStore((s) => s.activeTab);
  const setActiveTab = useCalendarStore((s) => s.setActiveTab);
  const events = useCalendarStore((s) => s.events);
  const currentDateStr = useCalendarStore((s) => s.currentDateStr);

  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // Compute upcoming events count dynamically
  const upcomingCount = useMemo(() => {
    const referenceDate = currentDateStr || getTodayDateString();
    return events.filter((e) => e.date >= referenceDate).length;
  }, [events, currentDateStr]);

  const tasksCount = useMemo(() => {
    return (
      events.filter(
        (e) => e.calendarId === "reminders" || e.calendarId === "focus",
      ).length || 3
    );
  }, [events]);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col px-1 pt-1">
        <div className="scroll-fade min-h-0 flex-1 overflow-x-hidden overflow-y-auto space-y-4">
          {/* Navigation list */}
          <nav
            className="flex flex-col gap-0.5 md:hidden"
            aria-label="Calendar Navigation"
          >
            <Button
              variant="ghost"
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors text-left ${
                activeTab === "calendar"
                  ? "bg-accent font-semibold text-accent-foreground shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">Calendar</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("today")}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors text-left ${
                activeTab === "today"
                  ? "bg-accent font-semibold text-accent-foreground shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">Today</span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("upcoming")}
              className={`flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors text-left ${
                activeTab === "upcoming"
                  ? "bg-accent font-semibold text-accent-foreground shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="size-4 shrink-0 text-muted-foreground" />
                <span>Upcoming</span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {upcomingCount}
              </span>
            </Button>

            <Button
              variant="ghost"
              onClick={() => setActiveTab("tasks")}
              className={`flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors text-left ${
                activeTab === "tasks"
                  ? "bg-accent font-semibold text-accent-foreground shadow-2xs"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="size-4 shrink-0 text-muted-foreground" />
                <span>Tasks</span>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                {tasksCount}
              </span>
            </Button>
          </nav>

          <Separator />

          {/* My calendars Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                My calendars
              </span>
              <button
                type="button"
                onClick={() => setIsProviderModalOpen(true)}
                title="Add calendar or connect provider"
                aria-label="Add calendar"
                className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-0.5">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-foreground/90 transition-colors hover:bg-muted/70 text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="flex size-3.5 shrink-0 items-center justify-center rounded-[3.5px] transition-all"
                      style={{
                        backgroundColor: category.checked
                          ? category.dotColor
                          : "transparent",
                        border: `1.5px solid ${category.dotColor}`,
                      }}
                    >
                      {category.checked && (
                        <Check
                          strokeWidth={3}
                          className="size-2.5 text-white"
                        />
                      )}
                    </span>
                    <span className="truncate">{category.name}</span>
                  </div>

                  {category.provider === "google" && (
                    <GoogleLogo className="size-3.5 shrink-0 opacity-80" />
                  )}
                  {category.provider === "ical" && (
                    <Globe className="size-3.5 shrink-0 text-muted-foreground opacity-80" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CalendarProviderModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
      />
    </>
  );
};
