export const TODO_STORAGE_KEY = "todo-scheduler.todos.v1";

function isStoredTodo(todo) {
  return Boolean(
    todo
    && typeof todo === "object"
    && typeof todo.id === "string"
    && typeof todo.title === "string"
    && todo.id.trim()
    && todo.title.trim(),
  );
}

export function getTodoStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readStoredTodos(storage) {
  if (!storage) {
    return null;
  }

  try {
    const storedValue = storage.getItem(TODO_STORAGE_KEY);
    const parsedTodos = storedValue ? JSON.parse(storedValue) : null;

    return Array.isArray(parsedTodos) && parsedTodos.every(isStoredTodo) ? parsedTodos : null;
  } catch {
    return null;
  }
}

export function writeStoredTodos(todos, storage) {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    return true;
  } catch {
    return false;
  }
}
