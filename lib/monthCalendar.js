import { getCalendarDateKey } from "./weekCalendar.js";

export function getMonthDays(value, monthOffset = 0, timeZone = "Asia/Seoul") {
  const key = getCalendarDateKey(value, timeZone);
  if (!key) return [];
  const [year, month] = key.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1 + monthOffset, 1));
  const start = new Date(first);
  start.setUTCDate(1 - (first.getUTCDay() + 6) % 7);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return { key: date.toISOString().slice(0, 10), day: date.getUTCDate(), inMonth: date.getUTCMonth() === first.getUTCMonth() };
  });
}
