"use client";

import { useEffect, useState } from "react";

export function useCalendarToday() {
  const [now, setNow] = useState(null);
  useEffect(() => {
    let timer;
    const update = () => {
      const current = new Date();
      setNow(current.toISOString());
      const seoul = new Date(current.getTime() + 9 * 60 * 60 * 1000);
      const nextMidnight = Date.UTC(seoul.getUTCFullYear(), seoul.getUTCMonth(), seoul.getUTCDate() + 1) - 9 * 60 * 60 * 1000;
      window.clearTimeout(timer);
      timer = window.setTimeout(update, nextMidnight - current.getTime());
    };
    update();
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return now;
}
