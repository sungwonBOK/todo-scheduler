const DEFAULT_TIME_ZONE = "Asia/Seoul";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function toValidDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getParts(value, options, timeZone = DEFAULT_TIME_ZONE) {
  const date = toValidDate(value);
  if (!date) return null;

  try {
    const formatter = new Intl.DateTimeFormat("en-US", { timeZone, ...options });
    return Object.fromEntries(
      formatter
        .formatToParts(date)
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, part.value]),
    );
  } catch {
    return null;
  }
}

function getCalendarDate(value, timeZone = DEFAULT_TIME_ZONE) {
  const parts = getParts(value, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }, timeZone);

  if (!parts) return null;

  return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
}

function addDays(date, amount) {
  return new Date(date.getTime() + amount * DAY_IN_MILLISECONDS);
}

function formatCalendarDay(date, options) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", ...options }).format(date);
}

export function getCalendarDateKey(value, timeZone = DEFAULT_TIME_ZONE) {
  const date = getCalendarDate(value, timeZone);
  if (!date) return "";

  return date.toISOString().slice(0, 10);
}

export function getWeekDate(value, weekOffset = 0, timeZone = DEFAULT_TIME_ZONE) {
  const date = getCalendarDate(value, timeZone);
  if (!date) return null;

  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return addDays(date, -daysSinceMonday + Number(weekOffset || 0) * 7);
}

export function getWeekDays(value, timeZone = DEFAULT_TIME_ZONE, todayValue = value) {
  const weekStart = getWeekDate(value, 0, timeZone);
  const todayKey = getCalendarDateKey(todayValue, timeZone);
  if (!weekStart) return [];

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const key = date.toISOString().slice(0, 10);

    return {
      date,
      day: formatCalendarDay(date, { day: "numeric" }),
      key,
      weekday: formatCalendarDay(date, { weekday: "short" }),
      isToday: key === todayKey,
    };
  });
}

export function formatWeekRange(days) {
  const list = Array.isArray(days) ? days : [];
  const first = list[0]?.date;
  const last = list.at(-1)?.date;
  if (!(first instanceof Date) || !(last instanceof Date)) return "이번 주";

  const firstMonth = formatCalendarDay(first, { month: "long" });
  const lastMonth = formatCalendarDay(last, { month: "long" });
  const firstDay = formatCalendarDay(first, { day: "numeric" });
  const lastDay = formatCalendarDay(last, { day: "numeric" });

  return firstMonth === lastMonth
    ? `${firstMonth} ${firstDay} — ${lastDay}`
    : `${firstMonth} ${firstDay} — ${lastMonth} ${lastDay}`;
}

export function getEventsByDay(events, days, timeZone = DEFAULT_TIME_ZONE) {
  const dayMap = new Map((Array.isArray(days) ? days : []).map((day) => [day.key, []]));

  (Array.isArray(events) ? events : []).forEach((event) => {
    const key = getCalendarDateKey(event?.start, timeZone);
    if (dayMap.has(key)) dayMap.get(key).push(event);
  });

  return dayMap;
}

export function getEventPlacement(event, timeZone = DEFAULT_TIME_ZONE, startHour = 8, endHour = 20) {
  const startParts = getParts(event?.start, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, timeZone);
  const endParts = getParts(event?.end, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, timeZone);
  if (!startParts || !endParts || endHour <= startHour) return null;

  const eventStart = Number(startParts.hour) * 60 + Number(startParts.minute);
  const eventEnd = Number(endParts.hour) * 60 + Number(endParts.minute);
  const gridStart = startHour * 60;
  const gridEnd = endHour * 60;
  const visibleStart = Math.max(eventStart, gridStart);
  const visibleEnd = Math.min(eventEnd, gridEnd);

  if (!Number.isFinite(eventStart) || !Number.isFinite(eventEnd) || visibleEnd <= visibleStart) return null;

  const gridDuration = gridEnd - gridStart;
  return {
    top: ((visibleStart - gridStart) / gridDuration) * 100,
    height: ((visibleEnd - visibleStart) / gridDuration) * 100,
  };
}
