import { Sparkles } from "lucide-react";

import { formatKoreanDay } from "../../lib/dateFormatters.js";
import TodoAddControl from "../todos/TodoAddControl";

export default function DashboardHeader({ user, dateValue, timeZone }) {
  const date = formatKoreanDay(dateValue, timeZone);
  const name = user?.name || "친구";

  return (
    <header className="flex flex-wrap items-start justify-between gap-5">
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#5d46b1]">
          <Sparkles size={16} aria-hidden="true" />
          {date}
        </p>
        <h1 className="text-3xl font-black tracking-[-0.065em] text-[#2d3559] sm:text-4xl">
          안녕, {name}님 <span aria-hidden="true">☀️</span>
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#5f6680]">
          오늘은 너무 서두르지 말고, 한 칸씩 채워가 봐요.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <TodoAddControl />
        <span className="grid h-10 w-10 place-items-center rounded-full border border-[#ece4d9] bg-white text-[#5f6680]" aria-label="알림 기능은 준비 중입니다" title="알림 기능은 준비 중입니다">
          <span aria-hidden="true">🔔</span>
        </span>
        <span className="flex items-center gap-2 rounded-full border border-[#ece4d9] bg-white py-1.5 pl-2 pr-3 text-sm font-bold text-[#4d5577]" aria-label={`${name}님의 프로필`}>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#dff5e8] text-xs font-black text-[#37735a]">{user?.initials || "H"}</span>
          <span aria-hidden="true">⌄</span>
        </span>
      </div>
    </header>
  );
}
