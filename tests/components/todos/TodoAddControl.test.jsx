import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { TodoProvider, useTodos } from "../../../features/todos/TodoProvider.jsx";

async function loadTodoAddControl() {
  const controlPath = "../../../components/todos/TodoAddControl.jsx";
  const todoControl = await import(/* @vite-ignore */ controlPath).catch(() => ({}));

  expect(todoControl.default).toBeTypeOf("function");

  return todoControl.default;
}

function TodoListProbe() {
  const { tasks } = useTodos();

  return (
    <ul aria-label="저장된 할 일">
      {tasks.map((task) => <li key={task.id}>{task.title}</li>)}
    </ul>
  );
}

function renderTodoControl(TodoAddControl) {
  return render(
    <TodoProvider initialTasks={[]}>
      <TodoAddControl />
      <TodoListProbe />
    </TodoProvider>,
  );
}

function fillValidDraft() {
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

describe("TodoAddControl", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows required-field errors when confirmed empty", async () => {
    const TodoAddControl = await loadTodoAddControl();
    renderTodoControl(TodoAddControl);

    fireEvent.click(screen.getByRole("button", { name: "할일 추가" }));
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(screen.getByRole("dialog", { name: "할일 추가" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("할 일을 입력해주세요.");
    expect(screen.getByLabelText("할 일")).toHaveAttribute("aria-invalid", "true");
  });

  it("adds a valid todo and closes the dialog", async () => {
    const TodoAddControl = await loadTodoAddControl();
    renderTodoControl(TodoAddControl);

    fireEvent.click(screen.getByRole("button", { name: "할일 추가" }));
    fillValidDraft();
    fireEvent.click(screen.getByRole("button", { name: "확인" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: "저장된 할 일" })).toHaveTextContent("회의록 공유");
  });

  it("clears the draft after cancellation", async () => {
    const TodoAddControl = await loadTodoAddControl();
    renderTodoControl(TodoAddControl);

    fireEvent.click(screen.getByRole("button", { name: "할일 추가" }));
    fillValidDraft();
    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    fireEvent.click(screen.getByRole("button", { name: "할일 추가" }));

    expect(screen.getByLabelText("할 일")).toHaveValue("");
    expect(screen.getByLabelText("시작 날짜")).toHaveValue("");
    expect(screen.getByLabelText("마감 날짜")).toHaveValue("");
    expect(screen.getByLabelText("예상 소요 시간(분)")).toHaveValue(null);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const TodoAddControl = await loadTodoAddControl();
    renderTodoControl(TodoAddControl);
    const trigger = screen.getByRole("button", { name: "할일 추가" });

    fireEvent.click(trigger);
    expect(screen.getByLabelText("할 일")).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("dialog", { name: "할일 추가" }), {
      key: "Escape",
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("keeps Tab focus within the dialog", async () => {
    const TodoAddControl = await loadTodoAddControl();
    renderTodoControl(TodoAddControl);

    fireEvent.click(screen.getByRole("button", { name: "할일 추가" }));
    const confirmButton = screen.getByRole("button", { name: "확인" });
    confirmButton.focus();
    fireEvent.keyDown(confirmButton, { key: "Tab" });

    expect(screen.getByLabelText("할 일")).toHaveFocus();
  });
});
