import { formatScheduleTime } from "../../lib/dateFormatters.js";

export default function TodoChecklist({ tasks, onToggleComplete, emptyMessage = "예정된 할 일이 없어요.", timeZone = "Asia/Seoul" }) {
  if (!tasks.length) return <p className="py-4 text-xs leading-5 text-[#727895]">{emptyMessage}</p>;
  return <ul className="space-y-2">
    {tasks.map(task => <li key={task.id} className="rounded-xl border border-[#ece4d9] bg-white/70 p-3">
      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-[#4d5577]">
        <input type="checkbox" className="mt-1 shrink-0 accent-[#8f7ce7]" aria-label={`${task.title} 완료`} checked={Boolean(task.completed)} onChange={() => onToggleComplete(task.id)} />
        <span className="min-w-0">
          <span className={`block break-words font-semibold ${task.completed ? "line-through opacity-60" : ""}`}>{task.title}</span>
          <span className="mt-1 block text-xs text-[#727895]">{task.startAt ? `${formatScheduleTime(task.startAt, timeZone)} – ${formatScheduleTime(task.endAt, timeZone)}` : "시간 미정"}{task.durationMinutes ? ` · ${task.durationMinutes}분` : ""}</span>
        </span>
      </label>
    </li>)}
  </ul>;
}
