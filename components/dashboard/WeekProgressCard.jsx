import { CheckCircle2 } from "lucide-react";

import Card from "../ui/Card";

export default function WeekProgressCard({ progress }) {
  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#5f6680]">이번 주의 리듬</p>
          <p className="mt-1 text-3xl font-black tracking-[-0.065em] text-[#2d3559]">{progress.completionPercentage}%</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dff5e8] text-[#438062]"><CheckCircle2 size={20} aria-hidden="true" /></span>
      </div>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#f0ece7]" aria-label={`이번 주 완료율 ${progress.completionPercentage}%`}>
        <div className="h-full rounded-full bg-gradient-to-r from-[#82cf9f] to-[#8f7ce7] transition-all" style={{ width: `${progress.completionPercentage}%` }} />
      </div>
      <p className="mt-3 text-xs leading-5 text-[#5f6680]">{progress.completedTasks}개를 끝냈고, 오늘 계획한 시간은 {progress.plannedMinutes}분이에요.</p>
      <p className="mt-4 text-xs font-black text-[#5948a8]">이번 주의 흐름을 차근차근 기록 중이에요.</p>
    </Card>
  );
}
