import React, { useState } from "react";

import type { CalendarCategoryId, CalendarEvent } from "../types";

export interface UseCalendarEventFormOptions {
  initialEvent?: CalendarEvent | null;
  defaultDate?: string;
  defaultTime?: string;
  isOpen?: boolean;
  onSave: (event: Omit<CalendarEvent, "id"> & { id?: string }) => void;
  onClose: () => void;
}

export function useCalendarEventForm({
  initialEvent,
  defaultDate = "2026-10-17",
  defaultTime = "10:00",
  isOpen = false,
  onSave,
  onClose,
}: UseCalendarEventFormOptions) {
  const [title, setTitle] = useState(initialEvent?.title ?? "");
  const [calendarId, setCalendarId] = useState<CalendarCategoryId>(
    initialEvent?.calendarId ?? "work",
  );
  const [date, setDate] = useState(initialEvent?.date ?? defaultDate);
  const [startTime, setStartTime] = useState(
    initialEvent?.startTime ?? defaultTime,
  );
  const [endTime, setEndTime] = useState(
    initialEvent?.endTime ??
      `${String(Number(defaultTime.split(":")[0]) + 1).padStart(2, "0")}:00`,
  );
  const [location, setLocation] = useState(initialEvent?.location ?? "");
  const [reminder, setReminder] = useState(
    initialEvent?.reminder ?? "10 minutes before",
  );
  const [description, setDescription] = useState(
    initialEvent?.description ?? "",
  );

  // Synchronize when initialEvent changes or modal opens
  React.useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setCalendarId(initialEvent.calendarId);
      setDate(initialEvent.date);
      setStartTime(initialEvent.startTime);
      setEndTime(initialEvent.endTime);
      setLocation(initialEvent.location ?? "");
      setReminder(initialEvent.reminder ?? "10 minutes before");
      setDescription(initialEvent.description ?? "");
    } else {
      setTitle("");
      setCalendarId("work");
      setDate(defaultDate);
      setStartTime(defaultTime);
      const [h = 10, m = 0] = defaultTime.split(":").map(Number);
      setEndTime(
        `${String(Math.min(23, h + 1)).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      );
      setLocation("");
      setReminder("10 minutes before");
      setDescription("");
    }
  }, [initialEvent, defaultDate, defaultTime, isOpen]);

  const handleSubmit = (e: React.ChangeEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialEvent?.id,
      title: title.trim(),
      calendarId,
      date,
      startTime,
      endTime,
      location: location.trim() || undefined,
      reminder: reminder.trim() || undefined,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return {
    title,
    setTitle,
    calendarId,
    setCalendarId,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    location,
    setLocation,
    reminder,
    setReminder,
    description,
    setDescription,
    handleSubmit,
  };
}
