import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import React from "react";

import type { CalendarViewMode } from "./types";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenNewEvent: () => void;
  onOpenSearch: () => void;
  onOpenProviders?: () => void;
  connectedProvidersCount?: number;
  formattedWeekLabel?: string;
  formattedMonthLabel?: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onOpenNewEvent,
  onOpenSearch,
  onOpenProviders,
  connectedProvidersCount = 0,
  formattedWeekLabel = "Week 42 · Oct 12 – 18",
  formattedMonthLabel = "October 2026",
}) => {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-background px-5 select-none">
      {/* Date Titles */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-[17px] font-bold tracking-tight text-foreground">
          {formattedMonthLabel}
        </h1>
        <span className="text-[12px] font-normal text-muted-foreground">
          {formattedWeekLabel}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Today Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToday}
          className="text-xs"
        >
          Today
        </Button>

        {/* Prev / Next Chevrons */}
        <div className="flex items-center rounded-xl border border-border/70 bg-background p-0.5 shadow-2xs">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onPrev}
            aria-label="Previous"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onNext}
            aria-label="Next"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>

        {/* View Switcher: Day, Week, Month */}
        <div className="flex items-center rounded-xl bg-muted/60 p-0.5 gap-0.5">
          {(["day", "week", "month"] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onViewModeChange(mode)}
              className={`rounded-lg px-2.5 capitalize text-xs transition-all ${
                viewMode === mode
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode}
            </Button>
          ))}
        </div>

        {/* Search button */}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onOpenSearch}
          aria-label="Search events"
          title="Search events"
          className="text-muted-foreground hover:text-foreground"
        >
          <Search className="size-3.5" />
        </Button>

        {/* Sync / Integrations button */}
        {onOpenProviders && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenProviders}
            aria-label="Connect calendar providers"
            title="Calendar Integrations (Google, iCal)"
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="size-3 text-muted-foreground" />
            <span className="hidden sm:inline">Sync</span>
            {connectedProvidersCount > 0 && (
              <Badge
                variant="secondary"
                className="size-4 p-0 text-[10px] font-bold flex items-center justify-center rounded-full"
              >
                {connectedProvidersCount}
              </Badge>
            )}
          </Button>
        )}

        {/* + New Event Button */}
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onOpenNewEvent}
          className="gap-1.5 text-xs"
        >
          <Plus className="size-3.5" />
          <span>New event</span>
        </Button>
      </div>
    </header>
  );
};
