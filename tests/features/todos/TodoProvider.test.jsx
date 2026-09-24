import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { TODO_STORAGE_KEY } from "../../../features/todos/todoStorage.js";

async function loadTodoProvider() {
  const todoProviderPath = "../../../features/todos/TodoProvider.jsx";
  const todoProvider = await import(/* @vite-ignore */ todoProviderPath).catch(() => ({}));

  expect(todoProvider.TodoProvider).toBeTypeOf("function");
  expect(todoProvider.useTodos).toBeTypeOf("function");

  return todoProvider;
}

const initialTasks = [
  {
    id: "task-seed",
    title: "기존 할 일",
    durationMinutes: 60,
    priority: "medium",
    category: "Inbox",
    completed: false,
  },
];

const todoDraft = {
  title: "추가한 일",
  startDate: "2026-09-23",
  dueDate: "2026-09-24",
  durationMinutes: "60",
};

function createTodoProbe(useTodos) {
  return function TodoProbe() {
    const { addTodo, tasks, toggleTodoComplete } = useTodos();

    return (
      <section>
        <button type="button" onClick={() => addTodo(todoDraft)}>새 할 일 저장</button>
        {tasks.map((task) => (
          <label key={task.id}>
            <input
              type="checkbox"
              aria-label={task.title + " 완료"}
              checked={task.completed}
              onChange={() => toggleTodoComplete(task.id)}
            />
            {task.title}
          </label>
        ))}
      </section>
    );
  };
}

describe("TodoProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds a pending todo and persists the full list", async () => {
    const { TodoProvider, useTodos } = await loadTodoProvider();
    const TodoProbe = createTodoProbe(useTodos);

    render(
      <TodoProvider initialTasks={initialTasks}>
        <TodoProbe />
      </TodoProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "새 할 일 저장" }));

    expect(screen.getByText("추가한 일")).toBeInTheDocument();
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(TODO_STORAGE_KEY))).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "추가한 일",
            syncStatus: "pending",
          }),
        ]),
      );
    });
  });

  it("rehydrates a saved list instead of the initial seed list", async () => {
    const { TodoProvider, useTodos } = await loadTodoProvider();
    const TodoProbe = createTodoProbe(useTodos);
    window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify([
      {
        ...initialTasks[0],
        id: "task-saved",
        title: "저장된 일",
      },
    ]));

    render(
      <TodoProvider initialTasks={initialTasks}>
        <TodoProbe />
      </TodoProvider>,
    );

    expect(await screen.findByText("저장된 일")).toBeInTheDocument();
    expect(screen.queryByText("기존 할 일")).not.toBeInTheDocument();
  });

  it("keeps initial tasks when the saved value is malformed", async () => {
    const { TodoProvider, useTodos } = await loadTodoProvider();
    const TodoProbe = createTodoProbe(useTodos);
    window.localStorage.setItem(TODO_STORAGE_KEY, "not-json");

    render(
      <TodoProvider initialTasks={initialTasks}>
        <TodoProbe />
      </TodoProvider>,
    );

    expect(await screen.findByText("기존 할 일")).toBeInTheDocument();
  });

  it("keeps initial tasks when browser storage is unavailable", async () => {
    const { TodoProvider, useTodos } = await loadTodoProvider();
    const TodoProbe = createTodoProbe(useTodos);
    const localStorageDescriptor = Object.getOwnPropertyDescriptor(window, "localStorage");

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("storage denied");
      },
    });

    try {
      render(
        <TodoProvider initialTasks={initialTasks}>
          <TodoProbe />
        </TodoProvider>,
      );

      expect(await screen.findByText("기존 할 일")).toBeInTheDocument();
    } finally {
      Object.defineProperty(window, "localStorage", localStorageDescriptor);
    }
  });

  it("persists a completion toggle", async () => {
    const { TodoProvider, useTodos } = await loadTodoProvider();
    const TodoProbe = createTodoProbe(useTodos);

    render(
      <TodoProvider initialTasks={initialTasks}>
        <TodoProbe />
      </TodoProvider>,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "기존 할 일 완료" }));

    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(TODO_STORAGE_KEY))).toEqual([
        expect.objectContaining({
          id: "task-seed",
          completed: true,
        }),
      ]);
    });
  });
});
