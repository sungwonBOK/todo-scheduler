import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import Dashboard from "../../../components/dashboard/Dashboard.js";
import { TodoProvider } from "../../../features/todos/TodoProvider.jsx";

const initialData = {
  user: { name: "민지" },
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
      title: "주간 회고 쓰기",
      durationMinutes: 30,
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

function renderDashboard(data = initialData) {
  return render(
    <TodoProvider initialTasks={data.tasks}>
      <Dashboard initialData={data} />
    </TodoProvider>,
  );
}

function fillTodoDialog() {
  fireEvent.change(screen.getByLabelText("할 일"), {
    target: { value: "회의록 공유" },
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
}

describe("Dashboard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the actual number of scheduled items", () => {
    renderDashboard();

    expect(screen.getByText("1개의 약속")).toBeInTheDocument();
  });

  it("adds a modal todo to the Inbox without creating a timeline item", () => {
    renderDashboard();

    fireEvent.click(screen.getByRole("button", { name: "할일 추가" }));
    fillTodoDialog();
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(screen.getByRole("list", { name: "Inbox" })).toHaveTextContent("회의록 공유");
    expect(screen.queryByRole("article", { name: /회의록 공유/ })).not.toBeInTheDocument();
  });

  it("updates a timeline task when its completion checkbox is toggled", () => {
    renderDashboard();

    const completionCheckbox = screen.getByRole("checkbox", {
      name: "보고서 초안 정리 완료",
    });
    fireEvent.click(completionCheckbox);

    expect(completionCheckbox).toBeChecked();
  });

  it("keeps completed timeline tasks readable", () => {
    renderDashboard();

    const completionCheckbox = screen.getByRole("checkbox", {
      name: "보고서 초안 정리 완료",
    });
    fireEvent.click(completionCheckbox);

    expect(completionCheckbox.closest("article")).not.toHaveClass("opacity-60");
  });

  it("keeps the modal open when required todo fields are blank", () => {
    renderDashboard();

    fireEvent.click(screen.getByRole("button", { name: "할일 추가" }));
    const titleInput = screen.getByLabelText("할 일");
    expect(titleInput).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(screen.getByRole("dialog", { name: "할일 추가" })).toBeInTheDocument();
    expect(titleInput).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("할 일을 입력해주세요.");
  });

  it("keeps an event visible when its task reference is missing", () => {
    renderDashboard({
      ...initialData,
      tasks: [],
      events: [
        {
          id: "orphaned-event",
          taskId: "missing-task",
          start: "2026-09-22T18:00:00+09:00",
          end: "2026-09-22T18:30:00+09:00",
        },
      ],
    });

    expect(screen.getByText("알 수 없는 할 일")).toBeInTheDocument();
    expect(screen.getByText("18:00 — 18:30")).toBeInTheDocument();
  });
});
