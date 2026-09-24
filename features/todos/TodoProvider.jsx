"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { createTodo, validateTodoDraft } from "./todoModel.js";
import { getTodoStorage, readStoredTodos, writeStoredTodos } from "./todoStorage.js";

const TodoContext = createContext(null);

export function TodoProvider({ children, initialTasks = [] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedTasks = readStoredTodos(getTodoStorage());

    if (storedTasks) {
      setTasks(storedTasks);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      writeStoredTodos(tasks, getTodoStorage());
    }
  }, [isHydrated, tasks]);

  const addTodo = (draft) => {
    const validation = validateTodoDraft(draft);

    if (!validation.isValid) {
      return validation;
    }

    setTasks((currentTasks) => [...currentTasks, createTodo(draft)]);

    return validation;
  };

  const toggleTodoComplete = (taskId) => {
    setTasks((currentTasks) => currentTasks.map((task) => (
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )));
  };

  const value = useMemo(() => ({
    tasks,
    addTodo,
    toggleTodoComplete,
  }), [tasks]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos() {
  const todoContext = useContext(TodoContext);

  if (!todoContext) {
    throw new Error("useTodos must be used within a TodoProvider");
  }

  return todoContext;
}
