import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AppShell from "../../../components/layout/AppShell.jsx";
import WeeklyDiary from "../../../components/weekly/WeeklyDiary.jsx";
import { TodoProvider } from "../../../features/todos/TodoProvider.jsx";

const initialData = {
  date: "2026-09-22T09:00:00+09:00",
  timeZone: "Asia/Seoul",
  tasks: [
    {
      id: "task-report",
      title: "보고서 초안 정리",
      durationMinutes: 60,
      priority: "high",
      completed: false,
    },
    {
      id: "task-inbox",
      title: "책 반납일 확인하기",
      durationMinutes: 10,
      priority: "medium",
      completed: false,
    },
  ],
  events: [
    {
      id: "event-report",
      taskId: "task-report",
      start: "2026-09-22T10:00:00+09:00",
      end: "2026-09-22T11:00:00+09:00",
    },
  ],
};

function renderWeeklyDiary(data = initialData, withShell = false) {
  const diary = (
    <TodoProvider initialTasks={data.tasks}>
      <WeeklyDiary initialData={data} />
    </TodoProvider>
  );

  return render(withShell ? <AppShell activeSection="week">{diary}</AppShell> : diary);
}

describe("WeeklyDiary", () => {
  it("renders the weekly time grid and lets a planned task be completed", () => {
    renderWeeklyDiary();

    expect(screen.getByRole("heading", { name: "이번 주" })).toBeInTheDocument();
    expect(screen.getByText("보고서 초안 정리")).toBeInTheDocument();
    expect(screen.getByText("책 반납일 확인하기 · 10분")).toBeInTheDocument();

    const completionCheckbox = screen.getByRole("checkbox", { name: "보고서 초안 정리 완료" });
    fireEvent.click(completionCheckbox);

    expect(completionCheckbox).toBeChecked();
  });

  it("keeps a short time block proportional and provides compact mobile navigation", () => {
    renderWeeklyDiary(
      {
        ...initialData,
        events: [{
          ...initialData.events[0],
          start: "2026-09-22T13:00:00+09:00",
          end: "2026-09-22T13:30:00+09:00",
        }],
      },
      true,
    );

    const shortBlock = screen.getByRole("article", { name: "보고서 초안 정리, 13:00 — 13:30" });
    expect(shortBlock.style.height).toBe("4.166666666666666%");
    expect(shortBlock.style.minHeight).toBe("");
    expect(screen.getByText("색은 우선순위를, 체크는 완료 상태를 뜻해요.")).toBeInTheDocument();

    const mobileNav = screen.getByRole("navigation", { name: "모바일 주요 메뉴" });
    expect(within(mobileNav).getByRole("link", { name: "이번 주" })).toHaveAttribute("href", "/week");
  });

  it("labels unscheduled todos as 배정 안됨", () => {
    renderWeeklyDiary();

    expect(screen.getByText("배정 안됨")).toBeInTheDocument();
  });
});
