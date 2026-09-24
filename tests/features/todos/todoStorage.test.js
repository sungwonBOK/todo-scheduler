import { beforeEach, describe, expect, it } from "vitest";

async function loadTodoStorage() {
  const todoStoragePath = "../../../features/todos/todoStorage.js";
  const todoStorage = await import(/* @vite-ignore */ todoStoragePath).catch(() => ({}));

  expect(todoStorage.TODO_STORAGE_KEY).toBeTypeOf("string");
  expect(todoStorage.readStoredTodos).toBeTypeOf("function");
  expect(todoStorage.writeStoredTodos).toBeTypeOf("function");

  return todoStorage;
}

describe("todoStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("restores a saved todo list", async () => {
    const { TODO_STORAGE_KEY, readStoredTodos } = await loadTodoStorage();
    const savedTodos = [{ id: "task-saved", title: "저장된 일", durationMinutes: 60 }];
    window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(savedTodos));

    expect(readStoredTodos(window.localStorage)).toEqual(savedTodos);
  });

  it("returns null for malformed saved data", async () => {
    const { TODO_STORAGE_KEY, readStoredTodos } = await loadTodoStorage();
    window.localStorage.setItem(TODO_STORAGE_KEY, "not-json");

    expect(readStoredTodos(window.localStorage)).toBeNull();
  });

  it("returns null when a saved list contains an unusable todo", async () => {
    const { TODO_STORAGE_KEY, readStoredTodos } = await loadTodoStorage();
    window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify([null]));

    expect(readStoredTodos(window.localStorage)).toBeNull();
  });

  it("writes the full todo list", async () => {
    const { TODO_STORAGE_KEY, writeStoredTodos } = await loadTodoStorage();
    const todos = [{ id: "task-new", title: "새 일", durationMinutes: 60 }];

    expect(writeStoredTodos(todos, window.localStorage)).toBe(true);
    expect(window.localStorage.getItem(TODO_STORAGE_KEY)).toBe(JSON.stringify(todos));
  });
});
