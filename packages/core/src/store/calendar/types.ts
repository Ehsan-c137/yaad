export type CalendarCategoryId =
  | (string & {})
  | "focus"
  | "meetings"
  | "personal"
  | "reminders"
  | "social"
  | "work";

export type CalendarProviderType =
  "apple" | "google" | "ical_url" | "ical" | "outlook";

export interface CalendarCategory {
  id: CalendarCategoryId;
  name: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  badgeDarkBg: string;
  badgeDarkBorder: string;
  badgeDarkText: string;
  checked: boolean;
  provider?: "apple" | "google" | "ical_url" | "ical" | "local" | "outlook";
  isCustom?: boolean;
  isRemovable?: boolean;
  workspaceId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  calendarId: CalendarCategoryId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g. "09:00")
  endTime: string; // HH:mm (e.g. "10:00")
  location?: string;
  reminder?: string;
  description?: string;
  sourceProvider?:
    "apple" | "google" | "ical_url" | "ical" | "local" | "outlook";
  externalId?: string;
  externalUrl?: string;
  readOnly?: boolean;
  color?: string;
  workspaceId?: string;
}

export interface CalendarProviderConnection {
  id: string;
  provider: CalendarProviderType;
  name: string;
  accountEmail?: string;
  feedUrl?: string;
  color: string;
  calendarId: string;
  lastSyncedAt?: string;
  syncStatus: "error" | "idle" | "success" | "syncing";
  errorMessage?: string;
  autoSync: boolean;
  syncIntervalMinutes?: number;
  accessToken?: string;
  clientId?: string;
  tokenExpiresAt?: number;
  isDemo?: boolean;
}

export type CalendarViewMode = "day" | "month" | "week";
export type SidebarTab = "calendar" | "tasks" | "today" | "upcoming";
export type CalendarMobileTab = "browse" | "inbox" | "today" | "upcoming";

export interface CalendarMutationOptions {
  skipPersistence?: boolean;
}

export interface CalendarViewSlice {
  currentDateStr: string;
  viewMode: CalendarViewMode;
  activeTab: SidebarTab;
  mobileTab: CalendarMobileTab;
  isProviderModalOpen: boolean;
  isEventModalOpen: boolean;
  selectedEventId: string | null;

  setMobileTab: (tab: CalendarMobileTab) => void;
  setIsProviderModalOpen: (open: boolean) => void;
  setIsEventModalOpen: (open: boolean) => void;
  setActiveTab: (tab: SidebarTab) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  setCurrentDate: (dateStr: string) => void;
  goToToday: () => void;
  goToPrev: () => void;
  goToNext: () => void;
  selectEvent: (id: string | null) => void;
}

export interface CalendarCategorySlice {
  categories: CalendarCategory[];

  toggleCategory: (id: string) => void;
  addCategory: (
    category: CalendarCategory,
    options?: CalendarMutationOptions,
  ) => void;
  updateCategory: (
    id: string,
    updates: Partial<CalendarCategory>,
    options?: CalendarMutationOptions,
  ) => void;
  deleteCategory: (id: string, options?: CalendarMutationOptions) => void;
  upsertCategoryFromRemote: (category: CalendarCategory) => void;
}

export interface CalendarEventSlice {
  events: CalendarEvent[];

  addEvent: (
    event: Omit<CalendarEvent, "id"> & { id?: string },
    options?: CalendarMutationOptions,
  ) => void;
  updateEvent: (
    event: CalendarEvent,
    options?: CalendarMutationOptions,
  ) => void;
  deleteEvent: (id: string, options?: CalendarMutationOptions) => void;
  duplicateEvent: (id: string) => void;
  upsertEventFromRemote: (event: CalendarEvent) => void;
}

export interface CalendarProviderSlice {
  providers: CalendarProviderConnection[];
  isSyncing: boolean;

  addProvider: (
    provider: CalendarProviderConnection,
    initialEvents?: CalendarEvent[],
  ) => void;
  updateProvider: (
    id: string,
    updates: Partial<CalendarProviderConnection>,
  ) => void;
  removeProvider: (id: string) => void;
  syncProviderConnection: (id: string) => Promise<void>;
  syncAllProviders: () => Promise<void>;
}

export interface CalendarStorageSlice {
  hasHydratedFromStorage: boolean;

  loadCalendarFromStorage: () => Promise<void>;
  importICS: (
    icsContent: string,
    targetCalendarId?: CalendarCategoryId,
  ) => { added: number };
  exportICS: (calendarId?: CalendarCategoryId) => string;
}

export type CalendarState = CalendarCategorySlice &
  CalendarEventSlice &
  CalendarProviderSlice &
  CalendarStorageSlice &
  CalendarViewSlice;
