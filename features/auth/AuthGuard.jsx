"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasPreviewSession } from "./previewSession.js";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (hasPreviewSession()) setAllowed(true);
    else router.replace("/login");
  }, [router]);

  if (!allowed) {
    return <main className="flex min-h-screen items-center justify-center bg-[#fffaf3] text-[#727895]" role="status">로그인 상태를 확인하고 있어요.</main>;
  }

  return children;
}
