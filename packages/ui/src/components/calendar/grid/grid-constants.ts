export const HOURS = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
] as const;

export const START_HOUR = 0;
export const DEFAULT_WEEK_HOUR_HEIGHT = 56;
export const DEFAULT_DAY_HOUR_HEIGHT = 64;

export interface TimeIndicatorValue {
  hours: number;
  minutes: number;
  label: string;
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim();
  if (clean === "24:00") return 24 * 60;

  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i.exec(clean);

  if (!match) {
    const parts = clean.split(":").map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  }

  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const meridiem = match[3]?.toLowerCase();

  if (meridiem === "pm" && h < 12) h += 12;
  if (meridiem === "am" && h === 12) h = 0;

  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

/**
 * Computes top pixel position for current time line / badge.
 */
export function calculateIndicatorTop(
  time: { hours: number; minutes: number },
  hourHeight: number = DEFAULT_WEEK_HOUR_HEIGHT,
  startHour: number = START_HOUR,
): number {
  const currentMinutesFromStart = (time.hours - startHour) * 60 + time.minutes;
  const top = (currentMinutesFromStart / 60) * hourHeight;
  const maxTop = HOURS.length * hourHeight;
  return Math.max(0, Math.min(top, maxTop));
}

// eslint-disable-next-line max-params
export function calculateEventPosition(
  startTime: string,
  endTime: string,
  hourHeight: number = DEFAULT_WEEK_HOUR_HEIGHT,
  startHour: number = START_HOUR,
): { top: number; height: number } {
  const startMinutes = parseTimeToMinutes(startTime);
  let endMinutes = parseTimeToMinutes(endTime);

  // If endTime is "00:00" or "0:00" and start is after midnight, it represents 24:00 (end of day)
  if (
    endMinutes === 0 &&
    (endTime.trim() === "00:00" || endTime.trim() === "0:00") &&
    startMinutes > 0
  ) {
    endMinutes = 24 * 60;
  } else if (endMinutes <= startMinutes && endMinutes > 0) {
    // If end is less than start (e.g. 23:00 to 01:00), event spans across midnight
    endMinutes += 24 * 60;
  } else if (endMinutes <= startMinutes) {
    // Fallback: default to 30 minutes duration
    endMinutes = startMinutes + 30;
  }

  // Offset from grid's start hour
  const startOffsetMinutes = startMinutes - startHour * 60;
  const top = Math.max(0, (startOffsetMinutes / 60) * hourHeight);

  // Effective duration visible in this grid
  const effectiveDurationMinutes =
    endMinutes - Math.max(startMinutes, startHour * 60);

  // Clamped height so it doesn't overshoot column height
  const maxGridHeight = HOURS.length * hourHeight;
  const rawHeight = Math.max(
    22,
    (effectiveDurationMinutes / 60) * hourHeight - 3,
  );
  const height = Math.min(rawHeight, Math.max(22, maxGridHeight - top));

  return {
    top: Math.round(top * 100) / 100,
    height: Math.round(height * 100) / 100,
  };
}

/**
 * Calculates slot time string (HH:00) from click offsetY.
 */
export function calculateSlotTimeFromOffset(
  offsetY: number,
  hourHeight: number = DEFAULT_WEEK_HOUR_HEIGHT,
  startHour: number = START_HOUR,
): string {
  const hourIndex = Math.floor(Math.max(0, offsetY) / hourHeight);
  const clickedHour = Math.min(23, Math.max(0, hourIndex + startHour));
  const paddedHour = String(clickedHour).padStart(2, "0");
  return `${paddedHour}:00`;
}
