const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";
const TIME_ZONE = "Asia/Seoul";

const scheduleSchema = {
  name: "schedule",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "startAt", "endAt", "durationMinutes", "ready"],
    properties: {
      title: { type: ["string", "null"] },
      startAt: { type: ["string", "null"] },
      endAt: { type: ["string", "null"] },
      durationMinutes: { type: ["integer", "null"] },
      ready: { type: "boolean" },
    },
  },
};

function describeNow(now) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIME_ZONE,
    dateStyle: "short",
    timeStyle: "medium",
  }).format(now);
}

function buildSystemPrompt(now) {
  return [
    "너는 사용자의 한국어 입력에서 일정 정보를 추출해 JSON으로만 답하는 변환기야.",
    `현재 시각은 ${describeNow(now)} (${TIME_ZONE}, +09:00)이야. "내일", "다음 주 월요일" 같은 표현은 이 시각 기준으로 계산해.`,
    "startAt, endAt은 +09:00 오프셋이 붙은 ISO 8601 형식(예: 2026-10-28T15:00:00+09:00)으로 써.",
    "시작 시각과 소요 시간(또는 종료 시각)이 모두 확실하면 ready를 true로 하고, durationMinutes는 분 단위 정수로 채워.",
    "날짜, 시각, 소요 시간 중 하나라도 불확실하면 ready를 false로 하고 알 수 없는 값은 null로 둬.",
  ].join("\n");
}

export async function extractSchedule(message, { apiKey, model = DEFAULT_MODEL, now = new Date(), fetchImpl = fetch } = {}) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const response = await fetchImpl(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: "system", content: buildSystemPrompt(now) },
        { role: "user", content: message },
      ],
      response_format: { type: "json_schema", json_schema: scheduleSchema },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  return JSON.parse(content);
}
