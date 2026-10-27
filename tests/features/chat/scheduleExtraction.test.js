import { describe, expect, it, vi } from "vitest";

import { extractSchedule } from "../../../features/chat/scheduleExtraction.js";

const schedule = { title: "공부", startAt: "2026-10-28T15:00:00+09:00", endAt: "2026-10-28T16:00:00+09:00", durationMinutes: 60, ready: true };

function okResponse(content) {
  return { ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify(content) } }] }) };
}

describe("extractSchedule", () => {
  it("sends the message and current time to OpenAI and parses the JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse(schedule));
    const result = await extractSchedule("내일 오후 3시에 1시간 공부", {
      apiKey: "test-key",
      now: new Date("2026-10-27T10:00:00+09:00"),
      fetchImpl,
    });
    const [, options] = fetchImpl.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(result).toEqual(schedule);
    expect(options.headers.Authorization).toBe("Bearer test-key");
    expect(body.model).toBe("gpt-4o-mini");
    expect(body.messages[0].content).toContain("2026-10-27");
    expect(body.messages[1]).toEqual({ role: "user", content: "내일 오후 3시에 1시간 공부" });
  });

  it("throws without an API key", async () => {
    await expect(extractSchedule("x", {})).rejects.toThrow("OPENAI_API_KEY");
  });

  it("throws when OpenAI responds with an error status", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 429 });

    await expect(extractSchedule("x", { apiKey: "k", fetchImpl })).rejects.toThrow("429");
  });
});
