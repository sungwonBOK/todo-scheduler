const DEFAULT_TIME_ZONE = "Asia/Seoul";

function toValidDate(value) {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatKoreanDay(value, timeZone = DEFAULT_TIME_ZONE) {
  const date = toValidDate(value);
  if (!date) return "오늘";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone,
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

export function formatScheduleTime(value, timeZone = DEFAULT_TIME_ZONE) {
  const date = toValidDate(value);
  if (!date) return "시간 미정";

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
