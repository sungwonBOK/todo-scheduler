import { describe, expect, it } from "vitest";

import {
  formatKoreanDay,
  formatScheduleTime,
} from "../../lib/dateFormatters.js";

describe("date formatters", () => {
  it("formats a diary date consistently in the configured timezone", () => {
    expect(
      formatKoreanDay("2026-09-22T09:00:00+09:00", "Asia/Seoul"),
    ).toBe("9월 22일 화요일");
  });

  it("formats scheduled times in the configured timezone", () => {
    expect(
      formatScheduleTime("2026-09-22T09:30:00+09:00", "Asia/Seoul"),
    ).toBe("09:30");
  });

  it("uses a readable fallback for a missing schedule time", () => {
    expect(formatScheduleTime()).toBe("시간 미정");
  });
});
