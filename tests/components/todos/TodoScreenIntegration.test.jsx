import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import Dashboard from "../../../components/dashboard/Dashboard.js";
import WeeklyDiary from "../../../components/weekly/WeeklyDiary.jsx";
import ScheduleChat from "../../../features/chat/ScheduleChat.jsx";
import { TodoProvider } from "../../../features/todos/TodoProvider.jsx";

afterEach(() => vi.unstubAllGlobals());
it("adds tomorrow through chat to the week without placing it in today's Inbox", async () => {
  const todo = { title: "회의록 공유", startDate: "2026-09-23", dueDate: "2026-09-23", startAt: "2026-09-23T10:00:00+09:00", endAt: "2026-09-23T11:00:00+09:00", durationMinutes: 60 };
  vi.stubGlobal("fetch", vi.fn(async (url, options) => ({ ok: true, json: async () => url === "/api/ai-schedule" ? { success: true, todo } : options?.method === "POST" ? { ...todo, id: "saved" } : [] })));
  const data = { date: "2026-09-22T09:00:00+09:00", timeZone: "Asia/Seoul" };
  render(<TodoProvider><div data-testid="today"><Dashboard initialData={data} /></div><div data-testid="week"><WeeklyDiary initialData={data} /></div><ScheduleChat /></TodoProvider>);
  fireEvent.click(screen.getByRole("button", { name: /어떤 일정을 추가할까요/ }));
  fireEvent.change(screen.getByLabelText("일정 메시지"), { target: { value: "내일 오전 10시 회의록 공유" } });
  fireEvent.click(screen.getByRole("button", { name: "메시지 전송" }));
  await screen.findByText(/일정을 추가했어요/);
  expect(within(screen.getByTestId("today")).queryByText("회의록 공유")).not.toBeInTheDocument();
  expect(within(screen.getByTestId("week")).getByRole("checkbox", { name: "회의록 공유 완료" })).toBeInTheDocument();
});
