/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button } from "@ui/button";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Globe,
  MoreHorizontal,
  Search,
} from "lucide-react";
import React, { useState } from "react";

import type { CalendarCategory, CalendarMobileTab } from "../types";

export interface CalendarMobileHeaderProps {
  activeTab: CalendarMobileTab;
  isMonthExpanded: boolean;
  onToggleMonthExpand: () => void;
  categories: CalendarCategory[];
  onToggleCategory: (id: string) => void;
  onOpenSearch: () => void;
  onOpenProviders: () => void;
  onGoToToday: () => void;
}

export const CalendarMobileHeader: React.FC<CalendarMobileHeaderProps> = ({
  activeTab,
  isMonthExpanded,
  onToggleMonthExpand,
  categories,
  onToggleCategory,
  onOpenSearch,
  onOpenProviders,
  onGoToToday,
}) => {
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const viewTitle =
    activeTab === "inbox"
      ? "Inbox"
      : activeTab === "today"
        ? "Today"
        : "Schedule";

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur-md z-20 select-none">
        {/* Left: View / Inbox dropdown */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsFilterMenuOpen((prev) => !prev)}
          className="gap-1.5 px-2 text-left"
        >
          <span className="text-[17px] font-bold tracking-tight text-foreground">
            {viewTitle}
          </span>
          <ChevronDown
            className="size-4 text-muted-foreground opacity-70"
            strokeWidth={1.5}
          />
        </Button>

        {/* Right Action Pill: Search + Toggle Grid + Menu */}
        <div className="flex items-center rounded-2xl border border-border/80 bg-card p-0.5 shadow-2xs gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onOpenSearch}
            title="Search events"
            aria-label="Search events"
            className="rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Search className="size-4" strokeWidth={1.5} />
          </Button>

          <Button
            type="button"
            variant={isMonthExpanded ? "default" : "ghost"}
            size="icon-sm"
            onClick={onToggleMonthExpand}
            title={isMonthExpanded ? "Collapse calendar" : "Expand month view"}
            aria-label="Toggle calendar view"
            className="rounded-xl"
          >
            <CalendarIcon className="size-4" strokeWidth={1.5} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
            aria-label="More options"
            title="More options"
            className="rounded-xl text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
      </header>

      {isFilterMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
          onClick={() => setIsFilterMenuOpen(false)}
        >
          <div
            className="absolute top-16 left-4 right-4 max-w-sm rounded-2xl border border-border bg-card p-4 shadow-xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-[13px] font-semibold text-foreground">
                Filter Calendars
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setIsFilterMenuOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Done
              </Button>
            </div>
            <div className="flex flex-col gap-1 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggleCategory(cat.id)}
                  className="flex items-center justify-between rounded-xl p-2 text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: cat.dotColor }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  {cat.checked && (
                    <span className="text-xs font-bold text-primary">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MORE OPTIONS POPUP (when tapping •••) */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="absolute top-16 right-4 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-2xl animate-in fade-in zoom-in-95 flex flex-col gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onOpenProviders();
              }}
              className="w-full justify-start gap-2.5 text-[13px] font-medium"
            >
              <Globe className="size-4 text-purple-500" strokeWidth={1.5} />
              <span>Connect Providers</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full justify-start gap-2.5 text-[13px] font-medium"
            >
              <Search
                className="size-4 text-muted-foreground"
                strokeWidth={1.5}
              />
              <span>Search Events</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsMoreMenuOpen(false);
                onGoToToday();
              }}
              className="w-full justify-start gap-2.5 text-[13px] font-medium"
            >
              <CalendarIcon
                className="size-4 text-muted-foreground"
                strokeWidth={1.5}
              />
              <span>Jump to Today</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
