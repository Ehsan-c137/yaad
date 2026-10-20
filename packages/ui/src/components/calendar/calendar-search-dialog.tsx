import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/command";
import { Clock } from "lucide-react";
import React, { useMemo, useState } from "react";

import type { CalendarCategory, CalendarEvent } from "./types";

export interface CalendarSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export const CalendarSearchDialog: React.FC<CalendarSearchDialogProps> = ({
  isOpen,
  onClose,
  events,
  categories,
  onSelectEvent,
}) => {
  const [query, setQuery] = useState("");

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const filteredEvents = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      return events.slice(0, 8);
    }

    return events.filter(
      (evt) =>
        (evt.title.toLowerCase().includes(trimmed) ||
          evt.description?.toLowerCase().includes(trimmed)) ??
        categoryMap.get(evt.calendarId)?.name.toLowerCase().includes(trimmed),
    );
  }, [events, query, categoryMap]);

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setQuery("");
          onClose();
        }
      }}
      title="Search Calendar Events"
      description="Search events, meetings, and agendas in your calendar"
      className="max-w-lg rounded-2xl"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Search events, meetings, notes..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className="max-h-80 overflow-y-auto p-2">
          {filteredEvents.length === 0 ? (
            <CommandEmpty className="py-8 text-center text-xs text-muted-foreground">
              No matching events found for &quot;{query}&quot;
            </CommandEmpty>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredEvents.map((event) => {
                const cat = categoryMap.get(event.calendarId);
                return (
                  <CommandItem
                    key={event.id}
                    value={event.id}
                    onSelect={() => {
                      onSelectEvent(event);
                      onClose();
                    }}
                    className="flex items-center justify-between gap-3 rounded-xl p-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="size-2 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: cat?.dotColor ?? "#f59e0b" }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs font-semibold text-foreground">
                          {event.title}
                        </span>
                        {event.description && (
                          <span className="truncate text-[11px] text-muted-foreground">
                            {event.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      <span>
                        {event.date} · {event.startTime}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </div>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
