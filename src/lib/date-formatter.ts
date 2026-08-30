export type DateFormatOptions = Intl.DateTimeFormatOptions & {
  /** BCP 47 locale tag(s) to format with; defaults to the runtime locale. */
  locale?: string | string[];
  /** Value returned when the timestamp cannot be parsed as a valid date. */
  invalidDateFallback?: string;
};

const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};

/**
 * Formats a timestamp as a locale-aware date string.
 *
 * @example
 * formatDate(1717459200000); // "Jun 4"
 * formatDate(1717459200000, { year: "numeric" }); // "Jun 4, 2024"
 * formatDate(1717459200000, { locale: "de-DE" }); // "4. Juni" (approx.)
 * formatDate(1717459200000, { month: "long", day: "numeric", year: "numeric" });
 * formatDate(NaN, { invalidDateFallback: "—" }); // "—"
 */
export function formatDate(
  timestamp: number,
  options: DateFormatOptions = {},
): string {
  const { locale, invalidDateFallback = "", ...formatOptions } = options;
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return invalidDateFallback;

  return date.toLocaleDateString(locale, {
    ...DEFAULT_DATE_OPTIONS,
    ...formatOptions,
  });
}

export function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSeconds < 60) return "just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(timestamp);
}
