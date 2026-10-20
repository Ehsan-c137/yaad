import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "@ui/popover";
import { Separator } from "@ui/separator";
import {
  AlignLeft,
  Bell,
  Clock,
  Copy,
  MapPin,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import React, { useMemo } from "react";

import type { CalendarCategory, CalendarEvent } from "./types";

import { GoogleLogo } from "./calendar-google-logo";

export interface CalendarEventPopoverProps {
  event: CalendarEvent;
  category?: CalendarCategory;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDuplicate: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  position?: { x: number; y: number } | null;
  anchor?: React.ComponentProps<typeof PopoverContent>["anchor"];
}

export const CalendarEventPopover: React.FC<CalendarEventPopoverProps> = ({
  event,
  category,
  open = true,
  onOpenChange,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  position,
  anchor,
}) => {
  const dotColor = category?.dotColor ?? "#f59e0b";
  const categoryName = category?.name ?? "Event";

  // Format date readable
  const [year = 2026, month = 10, day = 17] = event.date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const monthName = dateObj.toLocaleDateString("en-US", { month: "short" });
  const formattedTimeRange = `${dayName}, ${monthName} ${day} · ${event.startTime} - ${event.endTime}`;

  // Mobile or narrow screen positioning
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const virtualAnchor = useMemo(() => {
    if (anchor) return anchor;
    if (typeof window === "undefined") return undefined;

    const createRect = (x: number, y: number) => {
      if (
        typeof DOMRect !== "undefined" &&
        typeof DOMRect.fromRect === "function"
      ) {
        return DOMRect.fromRect({ height: 0, width: 0, x, y });
      }

      return {
        bottom: y,
        height: 0,
        left: x,
        right: x,
        top: y,
        width: 0,
        x,
        y,
      };
    };

    if (position) {
      return {
        getBoundingClientRect: () => createRect(position.x, position.y),
      };
    }

    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;

    return {
      getBoundingClientRect: () => createRect(x, y),
    };
  }, [anchor, position]);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange?.(nextOpen);

        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <PopoverContent
        anchor={virtualAnchor}
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "center" : "start"}
        sideOffset={8}
        collisionPadding={12}
        className="w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-border bg-card p-4 text-sm text-card-foreground shadow-2xl select-none flex flex-col gap-0"
      >
        {/* Top Header Row */}
        <PopoverHeader className="flex flex-col gap-0 pb-0">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-[2px]"
                style={{ backgroundColor: dotColor }}
              />
              <span className="text-[12px] font-medium text-muted-foreground">
                {categoryName}
              </span>
            </div>

            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onEdit(event)}
                aria-label="Edit event"
                title="Edit event"
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onDuplicate(event)}
                aria-label="Duplicate event"
                title="Duplicate event"
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onDelete(event.id)}
                aria-label="Delete event"
                title="Delete event"
                className="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
              <PopoverClose
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={onClose}
                    aria-label="Close"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </Button>
                }
              />
            </div>
          </div>

          <Separator className="my-1.5" />

          {/* Event Title */}
          <PopoverTitle className="text-[15px] font-semibold text-foreground pt-1 pb-2">
            {event.title}
          </PopoverTitle>
        </PopoverHeader>

        {/* Event Details List */}
        <div className="flex flex-col gap-2.5 text-[12px]">
          {/* Time */}
          <div className="flex items-center gap-2.5 text-foreground/90">
            <Clock className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="font-medium">{formattedTimeRange}</span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Reminder */}
          {event.reminder && (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Bell className="size-3.5 shrink-0 text-muted-foreground" />
              <span>{event.reminder}</span>
            </div>
          )}

          {/* Description / Notes */}
          {event.description && (
            <div className="flex items-start gap-2.5 pt-0.5 text-muted-foreground">
              <AlignLeft className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
              <p className="leading-snug">{event.description}</p>
            </div>
          )}

          {/* External Provider Badge & Link */}
          {event.sourceProvider === "google" && (
            <div className="mt-1 flex items-center justify-between rounded-xl bg-blue-500/10 px-2.5 py-1.5 text-[11px] text-blue-600 dark:text-blue-400">
              <Badge
                variant="secondary"
                className="gap-1.5 bg-transparent p-0 text-blue-600 dark:text-blue-400 font-medium"
              >
                <GoogleLogo className="size-3.5" />
                <span>Google Calendar</span>
              </Badge>
              {event.externalUrl && (
                <a
                  href={event.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:opacity-80"
                >
                  Open in Google
                </a>
              )}
            </div>
          )}

          {event.sourceProvider === "ical" && (
            <div className="mt-1 flex items-center justify-between rounded-xl bg-muted px-2.5 py-1.5 text-[11px] text-muted-foreground">
              <Badge
                variant="secondary"
                className="bg-transparent p-0 font-medium text-muted-foreground"
              >
                Synced via iCal Feed
              </Badge>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
