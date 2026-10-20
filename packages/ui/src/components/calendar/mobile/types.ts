import type {
  CalendarCategory,
  CalendarEvent,
  CalendarMobileTab,
} from "../types";

export interface AgendaDayGroup {
  date: Date;
  dateStr: string;
  headerDateLabel: string;
  events: CalendarEvent[];
  isToday: boolean;
}

export interface MiniMonthCell {
  date: Date;
  dateStr: string;
  dayNum: number;
  isCurrentMonth: boolean;
  hasEvents: boolean;
}

export interface CalendarMobileViewProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  events: CalendarEvent[];
  categories: CalendarCategory[];
  onSelectEvent: (event: CalendarEvent, e?: React.MouseEvent) => void;
  onOpenNewEvent: (dateStr?: string) => void;
  onOpenSearch: () => void;
  onOpenProviders: () => void;
  connectedProvidersCount: number;
  showDock?: boolean;
}

export type { CalendarMobileTab };
