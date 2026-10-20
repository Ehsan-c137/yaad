import { Badge } from "@ui/badge";
import { Bell, Clock, MapPin } from "lucide-react";
import React from "react";

import type { CalendarCategory, CalendarEvent } from "../types";

import { GoogleLogo } from "../calendar-google-logo";

export interface CalendarMobileEventCardProps {
  event: CalendarEvent;
  category?: CalendarCategory;
  onClick: (e: React.MouseEvent) => void;
}

export const CalendarMobileEventCard: React.FC<
  CalendarMobileEventCardProps
> = ({ event, category, onClick }) => {
  const isSyncedGoogle = event.sourceProvider === "google";

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <article
      onClick={onClick}
      className="group flex flex-col gap-1.5 rounded-2xl border border-border/70 bg-card p-3.5 shadow-2xs transition-all hover:border-border hover:shadow-xs active:scale-[0.99] cursor-pointer"
    >
      {/* Top Row: Category Ring + Title */}
      <div className="flex items-start gap-2.5">
        {/* Category Ring */}
        <span
          className="mt-0.5 size-4 shrink-0 rounded-full border-2 transition-transform group-hover:scale-110"
          style={{
            borderColor: category?.dotColor ?? "#3b82f6",
          }}
        />

        <div className="flex flex-1 flex-col min-w-0">
          <span className="text-[14px] font-semibold text-foreground leading-snug truncate">
            {event.title}
          </span>

          {event.description && (
            <p className="text-[12px] text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">
              {event.description}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Meta Row: Time + Location/Provider + Reminder */}
      <div className="flex flex-wrap items-center gap-2 pl-6 pt-1 text-[11px] text-muted-foreground">
        {/* Time Pill */}
        <Badge
          variant="secondary"
          className="gap-1 font-medium text-foreground px-2 py-0.5 h-auto text-[11px]"
        >
          <Clock className="size-3 text-muted-foreground" strokeWidth={1.5} />
          <span>
            {event.startTime} - {event.endTime}
          </span>
        </Badge>

        {/* Location / Meet Badge */}
        {event.location && (
          <div className="flex items-center gap-1 truncate max-w-[140px]">
            <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Google Calendar Badge */}
        {isSyncedGoogle && (
          <Badge
            variant="secondary"
            className="gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium px-1.5 py-0.5 h-auto text-[10px]"
          >
            <GoogleLogo className="size-3" />
            <span>Google</span>
          </Badge>
        )}

        {/* Reminder Bell */}
        {event.reminder && (
          <Bell
            className="size-3 text-muted-foreground/80 ml-auto"
            strokeWidth={1.5}
          />
        )}
      </div>
    </article>
  );
};
