"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Inbox } from "lucide-react";

import { getInboxTasks } from "../../features/dashboard/dashboardModel.js";
import { getTodoEvents } from "../../features/todos/todoEvents.js";
import { useTodos } from "../../features/todos/TodoProvider.jsx";
import { formatScheduleTime } from "../../lib/dateFormatters.js";
import {
  formatWeekRange,
  getEventPlacement,
  getEventsByDay,
  getWeekDate,
  getWeekDays,
} from "../../lib/weekCalendar.js";
import Card from "../ui/Card";
import Button from "../ui/Button";
import TodoAddControl from "../todos/TodoAddControl";

const START_HOUR = 8;
const END_HOUR = 20;
const GRID_HOURS = [8, 10, 12, 14, 16, 18, 20];

const eventStyles = {
  high: "border-[#ffd5c3] bg-[#fff3ed] text-[#934a39]",
  medium: "border-[#dcd4ff] bg-[#f5f2ff] text-[#5948a8]",
  low: "border-[#ccebd9] bg-[#effbf4] text-[#2f7250]",
};

const checkStyles = {
  high: "border-[#934a39] peer-checked:bg-[#934a39]",
  medium: "border-[#5948a8] peer-checked:bg-[#5948a8]",
  low: "border-[#2f7250] peer-checked:bg-[#2f7250]",
};

const fallbackTask = {
  title: "알 수 없는 할 일",
  priority: "medium",
  category: "일정 정보",
  completed: false,
};

function formatTimeRange(event, timeZone) {
  return `${formatScheduleTime(event.start, timeZone)} — ${formatScheduleTime(event.end, timeZone)}`;
}

export default function WeeklyDiary({ initialData }) {
  const { tasks, toggleTodoComplete } = useTodos();
  const [weekOffset, setWeekOffset] = useState(0);
  const timeZone = initialData?.timeZone || "Asia/Seoul";
  const seedEvents = initialData?.events ?? [];
  const events = useMemo(() => [...seedEvents, ...getTodoEvents(tasks)], [seedEvents, tasks]);
  const baseDate = initialData?.date;

  const visibleWeekDate = useMemo(
    () => getWeekDate(baseDate, weekOffset, timeZone),
    [baseDate, timeZone, weekOffset],
  );
  const days = useMemo(
    () => getWeekDays(visibleWeekDate, timeZone, baseDate),
    [baseDate, timeZone, visibleWeekDate],
  );
  const eventsByDay = useMemo(
    () => getEventsByDay(events, days, timeZone),
    [days, events, timeZone],
  );
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const weekEvents = useMemo(() => Array.from(eventsByDay.values()).flat(), [eventsByDay]);
  const plannedTaskIds = useMemo(
    () => new Set(weekEvents.map((event) => event?.taskId).filter(Boolean)),
    [weekEvents],
  );
  const completedPlannedTasks = useMemo(
    () => tasks.filter((task) => plannedTaskIds.has(task.id) && task.completed).length,
    [plannedTaskIds, tasks],
  );
  const inboxTasks = useMemo(() => getInboxTasks(tasks, events), [events, tasks]);

  return (
    <section className="p-5 sm:p-8 lg:p-10">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#5d46b1]">
            <CalendarDays size={16} aria-hidden="true" />
            나의 시간표
          </p>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-3xl font-black tracking-[-0.065em] text-[#2d3559] sm:text-4xl">이번 주</h1>
            <p className="text-sm font-bold text-[#727895]">예정 {weekEvents.length}개 · 완료 {completedPlannedTasks}개</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#5f6680]">할 일은 먼저 적고, 정말 할 시간만 한 칸에 놓아보세요.</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2" aria-label="주 이동">
          <TodoAddControl />
          <Button aria-label="이전 주" className="h-10 w-10 px-0" variant="ghost" onClick={() => setWeekOffset((current) => current - 1)}>
            <ChevronLeft size={19} aria-hidden="true" />
          </Button>
          <Button className="px-3" variant="secondary" onClick={() => setWeekOffset(0)}>오늘</Button>
          <Button aria-label="다음 주" className="h-10 w-10 px-0" variant="ghost" onClick={() => setWeekOffset((current) => current + 1)}>
            <ChevronRight size={19} aria-hidden="true" />
          </Button>
          <span className="ml-1 rounded-xl border border-[#ece4d9] bg-white px-3 py-2.5 text-sm font-black text-[#4d5577]">
            {formatWeekRange(days)}
          </span>
        </div>
      </header>

      <Card className="mt-7 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#ede9ff] text-[#6252b5]">
            <Inbox size={19} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-black text-[#2d3559]">배정 안됨</p>
            <p className="mt-0.5 text-xs text-[#727895]">아직 정확한 시간을 정하지 않은 할 일이에요.</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
          {inboxTasks.length ? inboxTasks.map((task) => (
            <span key={task.id} className="rounded-full bg-[#f5f2ff] px-3 py-1.5 text-xs font-bold text-[#5948a8]">
              {task.title}{task.durationMinutes ? ` · ${task.durationMinutes}분` : ""}
            </span>
          )) : (
            <span className="text-xs font-bold text-[#727895]">시간 미정 할 일이 없어요.</span>
          )}
        </div>
      </Card>

      <Card className="relative mt-5 overflow-hidden">
        <div className="paper-dots pointer-events-none absolute inset-x-0 top-0 h-24 opacity-45" />
        <div className="relative overflow-x-auto diary-scrollbar p-3 sm:p-5">
          <div className="relative min-w-[52rem]">
            <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] border-b border-[#ece4d9]">
              <span className="border-r border-[#ece4d9]" aria-hidden="true" />
              {days.map((day) => (
                <div
                  key={day.key}
                  className={`border-r border-[#ece4d9] px-2 py-3 text-center last:border-r-0 ${day.isToday ? "bg-[#ede9ff]/70" : ""}`}
                >
                  <p className="text-[11px] font-bold text-[#727895]">{day.weekday}{day.isToday ? " · 오늘" : ""}</p>
                  <span className={`mt-1 inline-grid h-7 w-7 place-items-center rounded-full text-sm font-black ${day.isToday ? "bg-[#8f7ce7] text-white" : "text-[#2d3559]"}`}>{day.day}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))]">
              <div className="relative h-[34rem] border-r border-[#ece4d9]" aria-hidden="true">
                {GRID_HOURS.map((hour, index) => (
                  <span
                    key={hour}
                    className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-[#9aa0b5]"
                    style={{ top: `${(index / (GRID_HOURS.length - 1)) * 100}%` }}
                  >
                    {String(hour).padStart(2, "0")}
                  </span>
                ))}
              </div>

              {days.map((day) => (
                <div
                  key={day.key}
                  aria-label={`${day.weekday}요일 ${day.day}일 시간표`}
                  className={`relative h-[34rem] border-r border-[#ece4d9] last:border-r-0 ${day.isToday ? "bg-[#ede9ff]/35" : ""}`}
                  style={{
                    backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent calc(16.666% - 1px), #ece4d9 calc(16.666% - 1px), #ece4d9 16.666%)",
                  }}
                >
                  {(eventsByDay.get(day.key) ?? []).map((event) => {
                    const placement = getEventPlacement(event, timeZone, START_HOUR, END_HOUR);
                    if (!placement) return null;

                    const task = taskById.get(event.taskId);
                    const displayTask = task || fallbackTask;
                    const eventStyle = eventStyles[displayTask.priority] || eventStyles.medium;
                    const checkStyle = checkStyles[displayTask.priority] || checkStyles.medium;
                    const isShortEvent = placement.height < 8;
                    const timeRange = formatTimeRange(event, timeZone);

                    return (
                      <article
                        key={event.id}
                        aria-label={`${displayTask.title}, ${timeRange}`}
                        className={`absolute left-1 right-1 overflow-hidden rounded-xl border shadow-sm ${isShortEvent ? "px-1 py-1" : "px-2 py-2"} ${eventStyle} ${displayTask.completed ? "opacity-70" : ""}`}
                        style={{ top: `${placement.top}%`, height: `${placement.height}%` }}
                      >
                        <div className="flex items-start gap-1.5">
                          {task ? (
                            <label className="mt-0.5 flex shrink-0 cursor-pointer" aria-label={`${displayTask.title} 완료`}>
                              <input className="peer sr-only" type="checkbox" checked={Boolean(displayTask.completed)} onChange={() => toggleTodoComplete(displayTask.id)} />
                              <span className={`grid h-4 w-4 place-items-center rounded-[5px] border bg-white/70 text-transparent transition peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#2d3559] ${checkStyle}`}>
                                <Check size={11} strokeWidth={3} aria-hidden="true" />
                              </span>
                            </label>
                          ) : (
                            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border border-[#5948a8] bg-white/70 text-[#5948a8]"><Clock3 size={10} aria-hidden="true" /></span>
                          )}
                          <div className="min-w-0">
                            <p className={`truncate font-black tracking-[-0.03em] ${isShortEvent ? "text-[10px] leading-3" : "text-[11px]"} ${displayTask.completed ? "line-through" : ""}`}>{displayTask.title}</p>
                            {!isShortEvent ? <p className="mt-1 truncate text-[9px] font-bold opacity-75">{timeRange}</p> : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ))}
            </div>

            {weekEvents.length === 0 ? (
              <div className="pointer-events-none absolute inset-x-12 bottom-0 top-[4.2rem] grid place-items-center">
                <p className="rounded-2xl border border-dashed border-[#dfd5ca] bg-[#fffdfa]/95 px-5 py-3 text-center text-sm font-medium text-[#5f6680]">이 주에는 아직 정해진 시간 블록이 없어요.</p>
              </div>
            ) : null}
          </div>
        </div>
        <p className="border-t border-[#ece4d9] px-5 py-3 text-xs text-[#727895]">색은 우선순위를, 체크는 완료 상태를 뜻해요.</p>
      </Card>
    </section>
  );
}
