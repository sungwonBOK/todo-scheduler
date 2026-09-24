import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import Dashboard from "../../../components/dashboard/Dashboard.js";
import WeeklyDiary from "../../../components/weekly/WeeklyDiary.jsx";
import { TodoProvider } from "../../../features/todos/TodoProvider.jsx";

const initialData = {
  date: "2026-09-22T09:00:00+09:00",
  timeZone: "Asia/Seoul",
  user: { name: "민지", initials: "M" },
  tasks: [
    {
      id: "task-planned",
      title: "기존 일정",
      durationMinutes: 60,
      priority: "high",
      category: "Inbox",
      completed: false,
    },
    {
      id: "task-inbox-1",
      title: "기존 미배정 1",
      durationMinutes: 30,
      priority: "medium",
      category: "Inbox",
      completed: false,
    },
    {
      id: "task-inbox-2",
      title: "기존 미배정 2",
      durationMinutes: 30,
      priority: "medium",
      category: "Inbox",
      completed: false,
    },
    {
      id: "task-inbox-3",
      title: "기존 미배정 3",
      durationMinutes: 30,
      priority: "medium",
      category: "Inbox",
      completed: false,
    },
  ],
  events: [
    {
      id: "event-planned",
      taskId: "task-planned",
      start: "2026-09-22T10:00:00+09:00",
      end: "2026-09-22T11:00:00+09:00",
    },
  ],
};

describe("Todo screen integration", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shares a fourth pending todo without creating a diary event", () => {
    render(
      <TodoProvider initialTasks={initialData.tasks}>
        <Dashboard initialData={initialData} />
        <WeeklyDiary initialData={initialData} />
      </TodoProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "할일 추가" })[0]);
    fireEvent.change(screen.getByLabelText("할 일"), {
      target: { value: "동기화 전 할 일" },
    });
    fireEvent.change(screen.getByLabelText("시작 날짜"), {
      target: { value: "2026-09-23" },
    });
    fireEvent.change(screen.getByLabelText("마감 날짜"), {
      target: { value: "2026-09-24" },
    });
    fireEvent.change(screen.getByLabelText("예상 소요 시간(분)"), {
      target: { value: "60" },
    });
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(screen.getByRole("list", { name: "Inbox" })).toHaveTextContent("동기화 전 할 일");
    expect(screen.getByText("동기화 전 할 일 · 60분")).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "기존 일정, 10:00 — 11:00" })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /동기화 전 할 일/ })).not.toBeInTheDocument();
  });
});
