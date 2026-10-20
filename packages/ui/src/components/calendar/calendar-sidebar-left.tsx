import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import {
  Calendar as CalendarIcon,
  Check,
  CheckSquare,
  Clock,
  Globe,
  Plus,
} from "lucide-react";
import React from "react";

import type { CalendarCategory, SidebarTab } from "./types";

import { GoogleLogo } from "./calendar-google-logo";

interface CalendarSidebarLeftProps {
  categories: CalendarCategory[];
  onToggleCategory: (id: string) => void;
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  onOpenProviders?: () => void;
  upcomingCount?: number;
  tasksCount?: number;
}

export const CalendarSidebarLeft: React.FC<CalendarSidebarLeftProps> = ({
  categories,
  onToggleCategory,
  activeTab,
  onSelectTab,
  onOpenProviders,
  upcomingCount = 9,
  tasksCount = 3,
}) => {
  return (
    <aside className="flex h-full w-[200px] shrink-0 flex-col justify-between border-r border-border/70 bg-muted/30 p-3 text-sm select-none">
      <div className="flex flex-col gap-5">
        {/* Top Navigation */}
        <nav className="flex flex-col gap-0.5 md:hidden">
          <Button
            type="button"
            variant={activeTab === "calendar" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSelectTab("calendar")}
            className="w-full justify-start gap-2.5 font-medium text-[13px]"
          >
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-left">Calendar</span>
          </Button>

          <Button
            type="button"
            variant={activeTab === "today" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSelectTab("today")}
            className="w-full justify-start gap-2.5 font-medium text-[13px]"
          >
            <Clock className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-left">Today</span>
          </Button>

          <Button
            type="button"
            variant={activeTab === "upcoming" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSelectTab("upcoming")}
            className="w-full justify-between gap-2.5 font-medium text-[13px]"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <span>Upcoming</span>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {upcomingCount}
            </Badge>
          </Button>

          <Button
            type="button"
            variant={activeTab === "tasks" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onSelectTab("tasks")}
            className="w-full justify-between gap-2.5 font-medium text-[13px]"
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="size-4 shrink-0 text-muted-foreground" />
              <span>Tasks</span>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {tasksCount}
            </Badge>
          </Button>
        </nav>
        {/* My Calendars Section */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-2.5">
            <span className="text-[12px] font-medium text-muted-foreground">
              My calendars
            </span>
            {onOpenProviders && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={onOpenProviders}
                title="Connect provider"
                aria-label="Add calendar"
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-3" />
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => onToggleCategory(category.id)}
                className="group flex items-center justify-between rounded-lg px-2.5 py-1 text-[13px] font-medium text-foreground/90 transition-colors hover:bg-muted/70 text-left"
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
                      <Check strokeWidth={3} className="size-2.5 text-white" />
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
    </aside>
  );
};
