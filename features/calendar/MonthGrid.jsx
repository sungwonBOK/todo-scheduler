const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function MonthGrid({ days, todayKey, selectedDate, tasksByDay, onSelect }) {
  return <div className="overflow-hidden rounded-2xl border border-[#ece4d9] bg-white/60">
    <div className="grid grid-cols-7 border-b border-[#ece4d9] bg-[#faf8ff]">{WEEKDAYS.map(day => <div key={day} className="py-3 text-center text-xs font-bold text-[#727895]">{day}</div>)}</div>
    <div className="grid grid-cols-7">
      {days.map(day => {
        const tasks = tasksByDay.get(day.key) ?? [];
        const isSelected = selectedDate === day.key;
        return <button key={day.key} type="button" aria-label={`${day.key}, 할 일 ${tasks.length}개${day.key === todayKey ? ", 오늘" : ""}`} aria-pressed={isSelected} onClick={() => onSelect(day.key)} className={`min-h-20 min-w-0 border-b border-r border-[#ece4d9] p-1.5 text-left transition focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#6252b5] sm:min-h-32 sm:p-2 ${isSelected ? "bg-[#ede9ff] ring-2 ring-inset ring-[#aa9bea]" : "hover:bg-[#faf8ff]"} ${!day.inMonth ? "text-[#a6aabd] bg-[#f5f1ec]/45" : "text-[#2d3559]"}`}>
          <span className={`inline-grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${day.key === todayKey ? "bg-[#6252b5] text-white" : ""}`}>{day.day}</span>
          <span className="mt-1 block text-[10px] text-[#727895] sm:hidden">{tasks.length > 0 ? `${tasks.length}개` : ""}</span>
          <span className="mt-1 hidden space-y-1 sm:block">{tasks.slice(0, 2).map(task => <span key={task.id} className={`block truncate rounded-md bg-[#f5f2ff] px-1.5 py-1 text-[11px] text-[#5948a8] ${task.completed ? "line-through opacity-50" : ""}`}>{task.startAt ? `${task.startAt.slice(11, 16)} ` : ""}{task.title}</span>)}{tasks.length > 2 && <span className="block px-1 text-[10px] font-bold text-[#727895]">+{tasks.length - 2}개 더 보기</span>}</span>
        </button>;
      })}
    </div>
  </div>;
}
