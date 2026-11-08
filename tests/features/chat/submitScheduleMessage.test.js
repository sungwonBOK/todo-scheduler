import { describe, expect, it, vi } from "vitest";

import { submitScheduleMessage } from "../../../features/chat/submitScheduleMessage.js";

const todo = {
  title: "공부",
  startDate: "2026-10-28",
  dueDate: "2026-10-28",
  durationMinutes: 60,
  startAt: "2026-10-28T15:00:00+09:00",
  endAt: "2026-10-28T16:00:00+09:00",
};

const jsonResponse = (data) => vi.fn().mockResolvedValue({ json: async () => data });

describe("submitScheduleMessage", () => {
  it("sends the message to the AI schedule API and saves the returned todo", async () => {
    const fetchImpl = jsonResponse({ success: true, todo });
    const addTodo = vi.fn().mockResolvedValue({ isValid: true, fieldErrors: {} });

    const reply = await submitScheduleMessage("내일 오후 3시에 1시간 공부", addTodo, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith("/api/ai-schedule", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ message: "내일 오후 3시에 1시간 공부" }),
    }));
    expect(addTodo).toHaveBeenCalledWith(todo);
    expect(reply).toEqual({ ok: true, text: "“공부” 일정을 추가했어요. (2026-10-28 15:00~16:00)" });
  });

  it("shows the follow-up message without saving when the schedule is unclear", async () => {
    const addTodo = vi.fn();
    const reply = await submitScheduleMessage("공부", addTodo, jsonResponse({ success: false, message: "날짜를 알려주세요." }));

    expect(addTodo).not.toHaveBeenCalled();
    expect(reply).toEqual({ ok: false, text: "날짜를 알려주세요." });
  });

  it("reports a save failure", async () => {
    const addTodo = vi.fn().mockResolvedValue({ isValid: false, fieldErrors: { title: "x" } });
    const reply = await submitScheduleMessage("x", addTodo, jsonResponse({ success: true, todo }));

    expect(reply.ok).toBe(false);
    expect(reply.text).toContain("저장하지 못했어요");
  });

  it("reports a network failure", async () => {
    const reply = await submitScheduleMessage("x", vi.fn(), vi.fn().mockRejectedValue(new Error("offline")));

    expect(reply).toEqual({ ok: false, text: "서버에 연결하지 못했어요. 잠시 후 다시 시도해주세요." });
  });
});
