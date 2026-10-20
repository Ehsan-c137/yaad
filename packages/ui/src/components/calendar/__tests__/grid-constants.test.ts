import { describe, expect, it } from "vitest";

import {
  calculateEventPosition,
  calculateIndicatorTop,
  calculateSlotTimeFromOffset,
  DEFAULT_DAY_HOUR_HEIGHT,
  DEFAULT_WEEK_HOUR_HEIGHT,
  HOURS,
  parseTimeToMinutes,
  START_HOUR,
} from "../grid/grid-constants";

describe("grid-constants & time calculations", () => {
  describe("HOURS and START_HOUR configuration", () => {
    it("contains all 24 hours from 00:00 to 23:00 in chronological order", () => {
      expect(HOURS.length).toBe(24);
      expect(HOURS[0]).toBe("00:00");
      expect(HOURS[7]).toBe("07:00");
      expect(HOURS[12]).toBe("12:00");
      expect(HOURS[19]).toBe("19:00");
      expect(HOURS[20]).toBe("20:00");
      expect(HOURS[21]).toBe("21:00");
      expect(HOURS[22]).toBe("22:00");
      expect(HOURS[23]).toBe("23:00");
      expect(START_HOUR).toBe(0);
    });
  });

  describe("parseTimeToMinutes", () => {
    it("parses 24-hour time strings accurately", () => {
      expect(parseTimeToMinutes("00:00")).toBe(0);
      expect(parseTimeToMinutes("01:30")).toBe(90);
      expect(parseTimeToMinutes("07:15")).toBe(435);
      expect(parseTimeToMinutes("12:00")).toBe(720);
      expect(parseTimeToMinutes("20:45")).toBe(1245);
      expect(parseTimeToMinutes("23:59")).toBe(1439);
      expect(parseTimeToMinutes("24:00")).toBe(1440);
    });

    it("parses single-digit hours and strings with seconds or 12h formats", () => {
      expect(parseTimeToMinutes("9:00")).toBe(540);
      expect(parseTimeToMinutes("9:30:00")).toBe(570);
      expect(parseTimeToMinutes("9:00 AM")).toBe(540);
      expect(parseTimeToMinutes("2:30 PM")).toBe(870);
      expect(parseTimeToMinutes("12:00 AM")).toBe(0);
      expect(parseTimeToMinutes("12:00 PM")).toBe(720);
    });

    it("handles empty or malformed inputs safely", () => {
      expect(parseTimeToMinutes("")).toBe(0);
      expect(parseTimeToMinutes("invalid")).toBe(0);
    });
  });

  describe("calculateEventPosition", () => {
    const H = DEFAULT_WEEK_HOUR_HEIGHT; // 56px

    it("calculates positions for standard workday hours correctly", () => {
      const pos = calculateEventPosition("09:00", "10:30", H, 0);
      expect(pos.top).toBe(9 * H);
      expect(pos.height).toBe(1.5 * H - 3);
    });

    it("works for early morning hours without negative top offset", () => {
      // 00:00 to 01:00 (midnight)
      const midnight = calculateEventPosition("00:00", "01:00", H, 0);
      expect(midnight.top).toBe(0);
      expect(midnight.height).toBe(1 * H - 3);

      // 01:30 to 02:45
      const earlyMorning = calculateEventPosition("01:30", "02:45", H, 0);
      expect(earlyMorning.top).toBe(1.5 * H);
      expect(earlyMorning.height).toBe(1.25 * H - 3);

      // 04:00 to 05:00
      const dawn = calculateEventPosition("04:00", "05:00", H, 0);
      expect(dawn.top).toBe(4 * H);
      expect(dawn.height).toBe(1 * H - 3);
    });

    it("works for late evening hours including 20:00, 21:00, 22:00, 23:00", () => {
      const evening20 = calculateEventPosition("20:00", "21:30", H, 0);
      expect(evening20.top).toBe(20 * H);
      expect(evening20.height).toBe(1.5 * H - 3);

      const evening22 = calculateEventPosition("22:00", "23:00", H, 0);
      expect(evening22.top).toBe(22 * H);
      expect(evening22.height).toBe(1 * H - 3);
    });

    it("correctly handles events ending at midnight (00:00) as end-of-day 24:00", () => {
      const lateEvent = calculateEventPosition("23:00", "00:00", H, 0);
      expect(lateEvent.top).toBe(23 * H);
      // Duration should be 1 hour (from 23:00 to 24:00), not negative!
      expect(lateEvent.height).toBe(1 * H - 3);
    });

    it("correctly handles cross-midnight events (e.g. 23:00 to 01:00)", () => {
      const crossMidnight = calculateEventPosition("23:00", "01:00", H, 0);
      expect(crossMidnight.top).toBe(23 * H);
      // Duration must be positive and clamped within grid height
      expect(crossMidnight.height).toBeGreaterThanOrEqual(22);
      expect(crossMidnight.top + crossMidnight.height).toBeLessThanOrEqual(
        24 * H,
      );
    });

    it("handles zero duration or equal start/end gracefully with minimum card height", () => {
      const instant = calculateEventPosition("14:00", "14:00", H, 0);
      expect(instant.top).toBe(14 * H);
      expect(instant.height).toBeGreaterThanOrEqual(22);
    });

    it("works with Day view hour height", () => {
      const dayH = DEFAULT_DAY_HOUR_HEIGHT; // 64px
      const pos = calculateEventPosition("10:00", "12:00", dayH, 0);
      expect(pos.top).toBe(10 * dayH);
      expect(pos.height).toBe(2 * dayH - 3);
    });
  });

  describe("calculateIndicatorTop", () => {
    const H = DEFAULT_WEEK_HOUR_HEIGHT; // 56px

    it("returns correct top offset across 24 hours", () => {
      expect(calculateIndicatorTop({ hours: 0, minutes: 0 }, H, 0)).toBe(0);
      expect(calculateIndicatorTop({ hours: 7, minutes: 0 }, H, 0)).toBe(7 * H);
      expect(calculateIndicatorTop({ hours: 10, minutes: 30 }, H, 0)).toBe(
        10.5 * H,
      );
      expect(calculateIndicatorTop({ hours: 20, minutes: 0 }, H, 0)).toBe(
        20 * H,
      );
      expect(calculateIndicatorTop({ hours: 23, minutes: 45 }, H, 0)).toBe(
        23.75 * H,
      );
    });

    it("never returns negative values", () => {
      expect(
        calculateIndicatorTop({ hours: 0, minutes: 0 }, H, 0),
      ).toBeGreaterThanOrEqual(0);
    });
  });

  describe("calculateSlotTimeFromOffset", () => {
    const H = DEFAULT_WEEK_HOUR_HEIGHT; // 56px

    it("calculates slot time string matching clicked hour row", () => {
      expect(calculateSlotTimeFromOffset(0, H, 0)).toBe("00:00");
      expect(calculateSlotTimeFromOffset(7 * H + 10, H, 0)).toBe("07:00");
      expect(calculateSlotTimeFromOffset(14 * H + 20, H, 0)).toBe("14:00");
      expect(calculateSlotTimeFromOffset(20 * H + 5, H, 0)).toBe("20:00");
      expect(calculateSlotTimeFromOffset(23 * H + 30, H, 0)).toBe("23:00");
    });
  });
});
