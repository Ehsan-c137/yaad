import {
  addDays,
  format,
  getISOWeek,
  isSameDay as isSameDayDateFns,
  parseISO,
  startOfWeek,
} from "date-fns";

export function formatDateToISO(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function parseISODate(dateStr: string): Date {
  return parseISO(dateStr);
}

export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function getCurrentTime(): {
  hours: number;
  minutes: number;
  label: string;
} {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const label = format(now, "HH:mm");
  return { hours, minutes, label };
}

export function isSameDay(d1: string | Date, d2: string | Date): boolean {
  const date1 = typeof d1 === "string" ? parseISO(d1) : d1;
  const date2 = typeof d2 === "string" ? parseISO(d2) : d2;
  return isSameDayDateFns(date1, date2);
}

export interface CalendarWeekDay {
  name: string;
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
  date: Date;
}

export function getWeekDays(
  referenceDate: Date,
  todayDateStr: string = getTodayDateString(),
): CalendarWeekDay[] {
  const monday = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const days: CalendarWeekDay[] = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const isToday = dateStr === todayDateStr;

    days.push({
      name: dayNames[i],
      dayNumber: d.getDate(),
      dateStr,
      isToday,
      date: d,
    });
  }

  return days;
}

export function formatWeekLabel(
  currentDate: Date,
  weekDays: CalendarWeekDay[],
): string {
  if (weekDays.length < 7) return "";
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];

  const weekNumber = getISOWeek(currentDate);
  const firstMonthName = format(firstDay.date, "MMM");
  const lastMonthName = format(lastDay.date, "MMM");

  if (firstMonthName === lastMonthName) {
    return `Week ${weekNumber} · ${firstMonthName} ${firstDay.dayNumber} – ${lastDay.dayNumber}`;
  }

  return `Week ${weekNumber} · ${firstMonthName} ${firstDay.dayNumber} – ${lastMonthName} ${lastDay.dayNumber}`;
}

export function formatMonthLabel(date: Date): string {
  return format(date, "MMMM yyyy");
}
