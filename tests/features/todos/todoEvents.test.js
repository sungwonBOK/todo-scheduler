import { describe, expect, it } from "vitest";

import { getTodoEvents } from "../../../features/todos/todoEvents.js";

describe("getTodoEvents", () => {
  it("turns timed todos into calendar events and skips untimed ones", () => {
    const tasks = [
      { id: "task-a", title: "공부", startAt: "2026-10-28T15:00:00+09:00", endAt: "2026-10-28T16:00:00+09:00" },
      { id: "task-b", title: "날짜만" },
    ];

    expect(getTodoEvents(tasks)).toEqual([
      { id: "event-task-a", taskId: "task-a", start: "2026-10-28T15:00:00+09:00", end: "2026-10-28T16:00:00+09:00" },
    ]);
  });
});
