"use client";

import { createElement, useMemo } from "react";

import { getInboxTasks, getWeekProgress } from "../../features/dashboard/dashboardModel.js";
import { getTodoEvents } from "../../features/todos/todoEvents.js";
import { useTodos } from "../../features/todos/TodoProvider.jsx";
import { getCalendarDateKey } from "../../lib/weekCalendar.js";
import DashboardHeader from "./DashboardHeader";
import InboxPanel from "./InboxPanel";
import TodayTimeline from "./TodayTimeline";
import WeekProgressCard from "./WeekProgressCard";

const h = createElement;

export default function Dashboard({ initialData }) {
  const { tasks, toggleTodoComplete } = useTodos();
  const seedEvents = initialData?.events ?? [];
  const timeZone = initialData?.timeZone;
  const todayKey = getCalendarDateKey(initialData?.date, timeZone);
  const events = useMemo(() => {
    const todayTodoEvents = getTodoEvents(tasks).filter((event) => getCalendarDateKey(event.start, timeZone) === todayKey);

    return [...seedEvents, ...todayTodoEvents];
  }, [seedEvents, tasks, timeZone, todayKey]);

  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const inboxTasks = getInboxTasks(tasks, events);
  const progress = getWeekProgress(tasks, events);

  return h(
    "section",
    { className: "p-5 sm:p-8 lg:p-10" },
    h(DashboardHeader, { user: initialData?.user, dateValue: initialData?.date, timeZone: initialData?.timeZone }),
    h(
      "div",
      { className: "mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start" },
      h(TodayTimeline, { events, taskById, onToggleComplete: toggleTodoComplete, timeZone }),
      h(
        "aside",
        { className: "space-y-5" },
        h(InboxPanel, { tasks: inboxTasks }),
        h(WeekProgressCard, { progress }),
      ),
    ),
  );
}
