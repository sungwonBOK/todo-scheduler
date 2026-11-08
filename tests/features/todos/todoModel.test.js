import { describe, expect, it } from "vitest";

async function loadTodoModel() {
  const todoModelPath = "../../../features/todos/todoModel.js";
  const todoModel = await import(/* @vite-ignore */ todoModelPath).catch(() => ({}));

  expect(todoModel.validateTodoDraft).toBeTypeOf("function");
  expect(todoModel.createTodo).toBeTypeOf("function");

  return todoModel;
}

const validDraft = {
  title: "  프로젝트 보고서 작성  ",
  startDate: "2026-09-23",
  dueDate: "2026-09-25",
  durationMinutes: "120",
};

describe("todoModel", () => {
  it("requires every todo draft field", async () => {
    const { validateTodoDraft } = await loadTodoModel();

    expect(validateTodoDraft({
      title: "",
      startDate: "",
      dueDate: "",
      durationMinutes: "",
    })).toEqual({
      isValid: false,
      fieldErrors: {
        title: "할 일을 입력해주세요.",
        startDate: "시작 날짜를 선택해주세요.",
        dueDate: "마감 날짜를 선택해주세요.",
        durationMinutes: "예상 소요 시간은 30~960분 사이의 30분 단위로 입력해주세요.",
      },
    });
  });

  it("rejects a due date before the start date", async () => {
    const { validateTodoDraft } = await loadTodoModel();

    expect(validateTodoDraft({
      ...validDraft,
      startDate: "2026-09-25",
      dueDate: "2026-09-23",
    })).toEqual({
      isValid: false,
      fieldErrors: {
        dueDate: "마감 날짜는 시작 날짜보다 빠를 수 없어요.",
      },
    });
  });

  it("rejects durations outside the 30-minute rule", async () => {
    const { validateTodoDraft } = await loadTodoModel();

    expect(validateTodoDraft({
      ...validDraft,
      durationMinutes: "31",
    })).toEqual({
      isValid: false,
      fieldErrors: {
        durationMinutes: "예상 소요 시간은 30~960분 사이의 30분 단위로 입력해주세요.",
      },
    });
  });

  it("creates a normalized pending todo", async () => {
    const { createTodo } = await loadTodoModel();

    expect(createTodo(validDraft, () => "task-new")).toEqual({
      id: "task-new",
      title: "프로젝트 보고서 작성",
      startDate: "2026-09-23",
      dueDate: "2026-09-25",
      durationMinutes: 120,
      priority: "medium",
      category: "Inbox",
      completed: false,
      syncStatus: "pending",
    });
  });

  it("keeps start and end times when both are provided", async () => {
    const { createTodo } = await loadTodoModel();

    expect(createTodo({
      ...validDraft,
      startAt: "2026-09-23T15:00:00+09:00",
      endAt: "2026-09-23T17:00:00+09:00",
    }, () => "task-timed")).toMatchObject({
      startAt: "2026-09-23T15:00:00+09:00",
      endAt: "2026-09-23T17:00:00+09:00",
    });
  });
});
