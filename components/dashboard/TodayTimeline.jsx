import { Check, Clock3, MoreHorizontal } from "lucide-react";

import Card from "../ui/Card";
import { formatScheduleTime } from "../../lib/dateFormatters.js";

const priorityStyles = {
  high: "border-[#ffd5c3] bg-[#fff3ed] text-[#934a39]",
  medium: "border-[#dcd4ff] bg-[#f5f2ff] text-[#5948a8]",
  low: "border-[#ccebd9] bg-[#effbf4] text-[#2f7250]",
};

const priorityCheckStyles = {
  high: "border-[#934a39] peer-checked:bg-[#934a39]",
  medium: "border-[#5948a8] peer-checked:bg-[#5948a8]",
  low: "border-[#2f7250] peer-checked:bg-[#2f7250]",
};

export default function TodayTimeline({ events, taskById, onToggleComplete, timeZone }) {
  const timelineEvents = Array.isArray(events) ? events : [];

  return (
    <Card className="relative overflow-hidden p-5 sm:p-7">
      <div className="paper-dots pointer-events-none absolute inset-x-0 top-0 h-28 opacity-60" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-[-0.04em] text-[#2d3559]">오늘의 시간표</h2>
          <p className="mt-1 text-sm text-[#5f6680]">작은 체크 하나가 오늘을 앞으로 움직여요.</p>
        </div>
        <span className="rounded-full bg-[#ede9ff] px-3 py-1.5 text-xs font-bold text-[#5948a8]">{timelineEvents.length}개의 약속</span>
      </div>

      <div className="relative mt-7 space-y-3">
        {timelineEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dfd5ca] bg-[#fffdfa] px-5 py-10 text-center text-sm text-[#5f6680]">오늘은 비어 있어요. Inbox에서 할 일을 추가해 보세요.</div>
        ) : (
          timelineEvents.map((event) => {
            const task = taskById?.get(event.taskId);
            const isMissingTask = !task;
            const displayTask = task || {
              title: "알 수 없는 할 일",
              priority: "medium",
              category: "일정 정보",
              completed: false,
            };
            const style = priorityStyles[displayTask.priority] || priorityStyles.medium;
            const checkStyle = priorityCheckStyles[displayTask.priority] || priorityCheckStyles.medium;

            return (
              <article key={event.id} className={`group flex gap-3 rounded-2xl border p-3.5 transition hover:-translate-y-0.5 hover:shadow-sm ${style}`}>
                {isMissingTask ? (
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-[#5948a8] bg-white/70 text-[#5948a8]" aria-label="연결된 할 일을 찾을 수 없습니다">
                    <Clock3 size={12} aria-hidden="true" />
                  </span>
                ) : (
                  <label className="mt-0.5 flex shrink-0 cursor-pointer" aria-label={`${displayTask.title} 완료`}>
                    <input className="peer sr-only" type="checkbox" checked={Boolean(displayTask.completed)} onChange={() => onToggleComplete(displayTask.id)} />
                    <span className={`grid h-5 w-5 place-items-center rounded-md border bg-white/70 text-transparent transition peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#2d3559] peer-focus-visible:ring-offset-2 ${checkStyle}`}>
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                  </label>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-bold tracking-[-0.02em] ${displayTask.completed ? "line-through" : ""}`}>{displayTask.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#5f6680]"><Clock3 size={13} aria-hidden="true" />{formatScheduleTime(event.start, timeZone)} — {formatScheduleTime(event.end, timeZone)}</p>
                    </div>
                    <span className="rounded-lg p-1 opacity-60" aria-label={`${displayTask.title} 상세 기능은 준비 중입니다`} title="상세 기능은 준비 중입니다"><MoreHorizontal size={18} aria-hidden="true" /></span>
                  </div>
                  <span className="mt-3 inline-flex rounded-full bg-white/65 px-2 py-1 text-[11px] font-bold">{displayTask.category || "오늘의 할 일"}</span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </Card>
  );
}
