import { describe, expect, it } from "vitest";

import { scheduleToTodoResponse } from "../../../features/chat/scheduleToTodo.js";

const readySchedule = {
  title: "공부",
  startAt: "2026-10-28T15:00:00+09:00",
  endAt: "2026-10-28T16:00:00+09:00",
  durationMinutes: 60,
  ready: true,
};

describe("scheduleToTodoResponse", () => {
  it("converts a ready schedule into the todo format", () => {
    expect(scheduleToTodoResponse(readySchedule)).toEqual({
      success: true,
      todo: {
        title: "공부",
        startDate: "2026-10-28",
        dueDate: "2026-10-28",
        durationMinutes: 60,
        startAt: "2026-10-28T15:00:00+09:00",
        endAt: "2026-10-28T16:00:00+09:00",
      },
    });
  });

  it("asks a follow-up question when the schedule is not ready", () => {
    expect(scheduleToTodoResponse({ ...readySchedule, ready: false })).toEqual({
      success: false,
      needsMoreInfo: true,
      message: "언제, 얼마나 할지 조금만 더 알려주세요.",
    });
  });

  it("rounds the duration up to 30 minute steps", () => {
    const response = scheduleToTodoResponse({ ...readySchedule, endAt: "2026-10-28T16:10:00+09:00" });

    expect(response.todo.durationMinutes).toBe(90);
  });

  it("keeps the local date when the schedule crosses midnight", () => {
    const response = scheduleToTodoResponse({
      ...readySchedule,
      startAt: "2026-10-28T23:00:00+09:00",
      endAt: "2026-10-29T00:30:00+09:00",
    });

    expect(response.todo).toMatchObject({ startDate: "2026-10-28", dueDate: "2026-10-29", durationMinutes: 90 });
  });

  it("rejects a ready schedule with missing times", () => {
    const response = scheduleToTodoResponse({ ...readySchedule, startAt: null, endAt: null, durationMinutes: null });

    expect(response.success).toBe(false);
    expect(response.needsMoreInfo).toBe(true);
  });
});
