import { describe, expect, it } from "vitest";

import { getWeekProgress } from "../../../features/dashboard/dashboardModel.js";

describe("dashboardModel", () => {
  it("calculates weekly task and minute progress from a hand-checked fixture", () => {
    const tasks = [
      { id: "task-1", completed: false, durationMinutes: 30 },
      { id: "task-2", completed: true, durationMinutes: 45 },
      { id: "task-3", completed: true, durationMinutes: 20 },
      { id: "task-4", completed: false, durationMinutes: 60 },
    ];
    const events = [
      { id: "event-1", taskId: "task-1" },
      { id: "event-2", taskId: "task-2" },
      { id: "event-3", taskId: "task-4" },
    ];

    expect(getWeekProgress(tasks, events)).toEqual({
      totalTasks: 4,
      completedTasks: 2,
      plannedMinutes: 135,
      completedMinutes: 65,
      completionPercentage: 50,
    });
  });

  it("returns zeroed progress for empty task and event lists", () => {
    expect(getWeekProgress([], [])).toEqual({
      totalTasks: 0,
      completedTasks: 0,
      plannedMinutes: 0,
      completedMinutes: 0,
      completionPercentage: 0,
    });
  });
});
