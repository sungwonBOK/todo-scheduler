"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useTodos } from "../todos/TodoProvider.jsx";
import { getTasksOnDate } from "../todos/todoCalendar.js";
import { getCalendarDateKey } from "../../lib/weekCalendar.js";
import { getMonthDays } from "../../lib/monthCalendar.js";
import { formatKoreanDay } from "../../lib/dateFormatters.js";
import TodoChecklist from "../../components/todos/TodoChecklist.jsx";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import MonthGrid from "./MonthGrid.jsx";

export default function MonthlyCalendar() {
  const { tasks, toggleTodoComplete, todayDate } = useTodos();
  const [visibleMonth, setVisibleMonth] = useState(null);
  const [selection, setSelection] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const todayKey = getCalendarDateKey(todayDate);
  const anchor = visibleMonth ?? todayKey;
  const selectedDate = selection ?? todayKey;
  const days = getMonthDays(anchor);
  const visibleTasks = showCompleted ? tasks : tasks.filter(task => !task.completed);
  const tasksByDay = new Map(days.map(day => [day.key, getTasksOnDate(visibleTasks, day.key)]));
  const selectedTasks = getTasksOnDate(visibleTasks, selectedDate);
  const moveMonth = amount => {
    const [year, month] = anchor.split("-").map(Number);
    const next = new Date(Date.UTC(year, month - 1 + amount, 1)).toISOString().slice(0, 10);
    setVisibleMonth(next);
    setSelection(next);
  };
  const selectDate = key => { setSelection(key); setVisibleMonth(`${key.slice(0, 7)}-01`); };
  return <section className="p-5 sm:p-8 lg:p-10">
    <header className="flex flex-wrap items-center justify-between gap-5">
      <div><p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#5d46b1]"><CalendarDays size={16} />한 달을 한눈에</p><h1 className="text-3xl font-black tracking-[-0.065em] text-[#2d3559]">월별</h1><p className="mt-2 text-sm leading-6 text-[#727895]">날짜를 선택해 할 일을 확인해요. 새 일정은 오른쪽 아래 도우미에게 말해주세요.</p></div>
      <div className="flex items-center gap-2" aria-label="월 이동">
        <Button aria-label="이전 달" variant="ghost" disabled={!anchor} onClick={() => moveMonth(-1)}><ChevronLeft size={18} /></Button>
        <span aria-live="polite" className="min-w-28 text-center font-bold text-[#4d5577]">{anchor ? `${anchor.slice(0, 4)}년 ${Number(anchor.slice(5, 7))}월` : "달력"}</span>
        <Button aria-label="다음 달" variant="ghost" disabled={!anchor} onClick={() => moveMonth(1)}><ChevronRight size={18} /></Button>
        <Button variant="secondary" onClick={() => { setVisibleMonth(null); setSelection(null); }}>오늘</Button>
      </div>
    </header>
    <label className="my-5 flex items-center gap-2 text-xs font-bold text-[#727895]"><input type="checkbox" className="accent-[#8f7ce7]" checked={showCompleted} onChange={event => setShowCompleted(event.target.checked)} />완료한 할 일 표시</label>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <MonthGrid days={days} todayKey={todayKey} selectedDate={selectedDate} tasksByDay={tasksByDay} onSelect={selectDate} />
      <Card className="p-5">
        <h2 className="text-lg font-black text-[#2d3559]">{formatKoreanDay(selectedDate)}</h2>
        <p className="mb-5 mt-1 text-xs text-[#727895]">할 일 {selectedTasks.length}개 · 완료 {selectedTasks.filter(task => task.completed).length}개</p>
        <h3 className="mb-2 text-xs font-bold text-[#727895]">시간 미정</h3>
        <TodoChecklist tasks={selectedTasks.filter(task => !task.startAt)} onToggleComplete={toggleTodoComplete} />
        <h3 className="mb-2 mt-5 text-xs font-bold text-[#727895]">시간 지정</h3>
        <TodoChecklist tasks={selectedTasks.filter(task => task.startAt).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))} onToggleComplete={toggleTodoComplete} />
      </Card>
    </div>
  </section>;
}
