import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ScheduleChat from "../../../features/chat/ScheduleChat.jsx";
import { TodoProvider } from "../../../features/todos/TodoProvider.jsx";

const todo = {
  title: "공부",
  startDate: "2026-10-28",
  dueDate: "2026-10-28",
  durationMinutes: 60,
  startAt: "2026-10-28T15:00:00+09:00",
  endAt: "2026-10-28T16:00:00+09:00",
};
const json = (data) => ({ ok: true, json: async () => data });

describe("ScheduleChat", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(async (url, options) => {
      if (url === "/api/ai-schedule") return json({ success: true, todo });
      return json(options?.method === "POST" ? { ...todo, id: "saved" } : []);
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a message, saves the todo and shows the assistant reply", async () => {
    render(<TodoProvider><ScheduleChat /></TodoProvider>);

    fireEvent.click(screen.getByRole("button", { name: /어떤 일정을 추가할까요/ }));
    fireEvent.change(screen.getByLabelText("일정 메시지"), { target: { value: "내일 오후 3시에 1시간 공부" } });
    fireEvent.click(screen.getByRole("button", { name: "메시지 전송" }));

    expect(await screen.findByText(/일정을 추가했어요/)).toBeInTheDocument();
    expect(screen.getByText("내일 오후 3시에 1시간 공부")).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/todos", expect.objectContaining({ method: "POST" })));
  });
});
