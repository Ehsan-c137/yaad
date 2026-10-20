import { Button } from "@ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import React from "react";

import type { CalendarCategory, CalendarEvent } from "./types";

import { useCalendarEventForm } from "./dialogs/use-calendar-event-form";

export interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, "id"> & { id?: string }) => void;
  categories: CalendarCategory[];
  initialEvent?: CalendarEvent | null;
  defaultDate?: string;
  defaultTime?: string;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialEvent,
  defaultDate = "2026-10-17",
  defaultTime = "10:00",
}) => {
  const form = useCalendarEventForm({
    initialEvent,
    defaultDate,
    defaultTime,
    isOpen,
    onSave,
    onClose,
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold text-foreground">
            {initialEvent ? "Edit Event" : "Create Event"}
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={form.handleSubmit} className="flex flex-col gap-4 pt-1">
          {/* Title */}

          <label
            htmlFor="event-title"
            className="text-[11px] font-medium text-muted-foreground flex flex-col gap-1.5"
          >
            Event Title
            <Input
              id="event-title"
              type="text"
              required
              placeholder="e.g. Weekly Planning, Team Standup"
              value={form.title}
              onChange={(e) => form.setTitle(e.target.value)}
              autoFocus
            />
          </label>

          {/* Calendar Category Picker */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="calendar"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Calendar
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map((cat) => {
                const isSelected = form.calendarId === cat.id;
                return (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => form.setCalendarId(cat.id)}
                    className={`justify-start gap-2 h-8 px-2 text-xs truncate ${
                      isSelected
                        ? "border-foreground/30 font-semibold shadow-2xs"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className="size-2 shrink-0 rounded-[2px]"
                      style={{ backgroundColor: cat.dotColor }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-2">
            <label
              htmlFor="date"
              className="text-[11px] font-medium text-muted-foreground flex flex-col gap-1.5"
            >
              Date
              <Input
                name="date"
                type="date"
                required
                value={form.date}
                onChange={(e) => form.setDate(e.target.value)}
                className="text-xs px-2"
              />
            </label>

            <label
              htmlFor="start-time"
              className="text-[11px] font-medium text-muted-foreground flex flex-col gap-1.5"
            >
              Start Time
            </label>
            <Input
              name="start-time"
              id="start-time"
              type="time"
              required
              value={form.startTime}
              onChange={(e) => form.setStartTime(e.target.value)}
              className="text-xs px-2"
            />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="end-time"
                className="text-[11px] font-medium text-muted-foreground"
              >
                End Time
                <Input
                  name="end-time"
                  id="end-time"
                  type="time"
                  required
                  value={form.endTime}
                  onChange={(e) => form.setEndTime(e.target.value)}
                  className="text-xs px-2"
                />
              </label>
            </div>
          </div>

          {/* Location & Reminder */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="location"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Location
              </label>
              <Input
                type="text"
                placeholder="Home office, Zoom, Room 2..."
                value={form.location}
                onChange={(e) => form.setLocation(e.target.value)}
                className="text-xs px-2"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="reminder"
                className="text-[11px] font-medium text-muted-foreground"
              >
                Reminder
              </label>
              <select
                name="reminder"
                id="reminder"
                value={form.reminder}
                onChange={(e) => form.setReminder(e.target.value)}
                className="h-8 w-full rounded-2xl border border-border/40 bg-input/70 px-2.5 py-1 text-xs text-foreground outline-none transition-[color,box-shadow,background-color,border-color] duration-(--press-duration) ease-(--spring) hover:border-border/60 hover:bg-input/80 focus-visible:border-ring/60 focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/20 dark:bg-input/30"
              >
                <option value="None">None</option>
                <option value="5 minutes before">5 minutes before</option>
                <option value="10 minutes before">10 minutes before</option>
                <option value="15 minutes before">15 minutes before</option>
                <option value="30 minutes before">30 minutes before</option>
                <option value="1 hour before">1 hour before</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-[11px] font-medium text-muted-foreground"
            >
              Description / Notes
            </label>
            <Textarea
              name="description"
              id="description"
              rows={2}
              placeholder="Add agenda, links or context..."
              value={form.description}
              onChange={(e) => form.setDescription(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/70">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="text-xs"
            >
              {initialEvent ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
