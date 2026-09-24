import { describe, expect, it } from "vitest";

import {
  formatWeekRange,
  getEventPlacement,
  getWeekDays,
} from "../../lib/weekCalendar.js";

describe("weekCalendar", () => {
  it("builds a Monday-start week around the supplied Korean date", () => {
    const days = getWeekDays("2026-09-22T09:00:00+09:00", "Asia/Seoul");

    expect(days.map((day) => day.key)).toEqual([
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
    ]);
    expect(days[1].isToday).toBe(true);
    expect(formatWeekRange(days)).toBe("9월 21일 — 27일");
  });

  it("places a timed event inside the visible planner hours", () => {
    expect(getEventPlacement({
      start: "2026-09-22T09:30:00+09:00",
      end: "2026-09-22T11:00:00+09:00",
    }, "Asia/Seoul", 8, 20)).toEqual({ top: 12.5, height: 12.5 });
  });

  it("keeps a 30-minute block proportional to the twelve-hour grid", () => {
    const placement = getEventPlacement({
      start: "2026-09-22T13:00:00+09:00",
      end: "2026-09-22T13:30:00+09:00",
    }, "Asia/Seoul", 8, 20);

    expect(placement.top).toBeCloseTo(41.6667, 3);
    expect(placement.height).toBeCloseTo(4.1667, 3);
  });
});
