import { getCalendarDateKey } from "../../lib/weekCalendar.js";

function getTaskRange(task, timeZone) {
  if (task.startAt && task.endAt) {
    return [getCalendarDateKey(task.startAt, timeZone), getCalendarDateKey(new Date(Date.parse(task.endAt) - 1), timeZone)];
  }
  return [task.startDate, task.startDate];
}

export function getTasksInRange(tasks, firstDate, lastDate, timeZone = "Asia/Seoul") {
  if (!firstDate || !lastDate) return [];
  return (tasks ?? []).filter(task => {
    if (!task) return false;
    const [start, end] = getTaskRange(task, timeZone);
    return start && end && start <= lastDate && end >= firstDate;
  });
}

export function getTasksOnDate(tasks, dateKey, timeZone = "Asia/Seoul") {
  return getTasksInRange(tasks, dateKey, dateKey, timeZone);
}

export function getEventsOnDate(events, dateKey, timeZone = "Asia/Seoul") {
  if (!dateKey) return [];
  return (events ?? []).filter(event => {
    const start = getCalendarDateKey(event.start, timeZone);
    const end = getCalendarDateKey(new Date(Date.parse(event.end) - 1), timeZone);
    return start && end && start <= dateKey && end >= dateKey;
  }).sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}
