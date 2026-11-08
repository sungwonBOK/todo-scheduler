import { describe, expect, it } from "vitest";
import { getTasksOnDate, getTasksInRange } from "../../../features/todos/todoCalendar.js";
import { getMonthDays } from "../../../lib/monthCalendar.js";

describe("date-based todo views", () => {
  const tasks = [
    { id: "plain", startDate: "2026-12-31", dueDate: "2027-01-03" },
    { id: "night", startAt: "2026-12-31T23:30:00+09:00", endAt: "2027-01-01T00:30:00+09:00" },
    { id: "midnight", startAt: "2026-12-31T23:00:00+09:00", endAt: "2027-01-01T00:00:00+09:00" },
    { id: "undated" },
  ];
  it("uses a date-only task's start day, and treats timed ends as exclusive", () => {
    expect(getTasksOnDate(tasks, "2026-12-31").map(t => t.id)).toEqual(["plain", "night", "midnight"]);
    expect(getTasksOnDate(tasks, "2027-01-01").map(t => t.id)).toEqual(["night"]);
    expect(getTasksOnDate(tasks, "2027-01-02")).toEqual([]);
  });
  it("counts a task once across a range", () => {
    expect(getTasksInRange(tasks, "2026-12-31", "2027-01-03")).toHaveLength(3);
  });
  it("builds a Monday-first leap month with stable six rows", () => {
    const days = getMonthDays("2028-02-12", 0);
    expect(days).toHaveLength(42);
    expect(days[0].key).toBe("2028-01-31");
    expect(days.filter(d => d.inMonth)).toHaveLength(29);
    expect(getMonthDays("2026-12-31", 1)[0].key).toBe("2026-12-28");
  });
});
