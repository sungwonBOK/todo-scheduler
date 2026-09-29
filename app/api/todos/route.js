import { NextResponse } from "next/server";

import {
  addTodo,
  getTodos,
} from "../../../features/todos/todoServerStore.js";


// GET /api/todos
export async function GET() {
  const todos = getTodos();

  return NextResponse.json(todos);
}


// POST /api/todos
export async function POST(request) {
  try {
    const body = await request.json();

    const newTodo = {
      id: `task-${crypto.randomUUID()}`,
      title: String(body.title ?? "").trim(),
      startDate: body.startDate,
      dueDate: body.dueDate,
      durationMinutes: Number(body.durationMinutes),
      priority: "medium",
      category: "Inbox",
      completed: false,
    };

    addTodo(newTodo);

    return NextResponse.json(newTodo, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "할 일을 추가하지 못했습니다." },
      { status: 500 }
    );
  }
}