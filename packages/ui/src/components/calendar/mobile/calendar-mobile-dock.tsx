import { Button } from "@ui/button";
import {
  Calendar as CalendarIcon,
  CalendarRange,
  Globe,
  Inbox,
} from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

import type { CalendarMobileTab } from "../types";

export interface CalendarMobileDockProps {
  activeTab: CalendarMobileTab;
  onTabClick: (tab: CalendarMobileTab) => void;
  connectedProvidersCount: number;
}

interface TabsProps {
  id: CalendarMobileTab;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const TABS: TabsProps[] = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "today", label: "Today", icon: CalendarIcon },
  { id: "upcoming", label: "Upcoming", icon: CalendarRange },
  { id: "browse", label: "Browse", icon: Globe },
];

export const CalendarMobileDock: React.FC<CalendarMobileDockProps> = ({
  activeTab,
  onTabClick,
  connectedProvidersCount,
}) => {
  return (
    <nav
      aria-label="Mobile Calendar Navigation"
      style={{
        height: "68px",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.06)",
        bottom: "max(1rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))",
      }}
      className={cn(
        "fixed inset-x-4 max-w-sm mx-auto z-30 flex items-center justify-around",
        "rounded-full border border-border/60 px-3 py-1.5",
        "dark:border-white/12 dark:bg-[#18181b]/85 dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]",
        "transition-all duration-300 ease-(--spring)",
      )}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;

        return (
          <Button
            key={id}
            type="button"
            variant="ghost"
            onClick={() => onTabClick(id)}
            className={cn(
              "flex h-auto flex-col items-center justify-center gap-1 rounded-xl px-3 py-1 text-[11px] transition-all select-none hover:bg-transparent",
              isActive
                ? "font-bold text-foreground"
                : "font-normal text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="relative flex items-center justify-center">
              <Icon
                className="size-[18px]"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {id === "browse" && connectedProvidersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-primary" />
              )}
            </div>
            <span className="leading-tight tracking-tight">{label}</span>
          </Button>
        );
      })}
    </nav>
  );
};
