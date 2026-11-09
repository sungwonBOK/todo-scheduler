"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { startPreviewSession } from "../../features/auth/previewSession.js";

import AuthCard from "./AuthCard.jsx";
import AuthForm from "./AuthForm.js";
import AuthShell from "../layout/AuthShell.jsx";

export default function AuthScreen({ mode }) {
  const router = useRouter();
  const [signupComplete, setSignupComplete] = useState(false);
  const [error, setError] = useState("");

  const handleSuccess = () => {
    if (mode === "signup") {
      setSignupComplete(true);
      return;
    }
    if (startPreviewSession()) router.replace("/");
    else setError("브라우저의 임시 저장 공간을 사용할 수 없어요. 브라우저 설정을 확인해 주세요.");
  };

  return (
    <AuthShell>
      <AuthCard mode={mode}>
        {signupComplete ? (
          <div className="space-y-4">
            <p role="status" className="rounded-xl bg-[#edf6ef] p-4 text-sm leading-6 text-[#416a50]">
              회원가입 화면 확인이 끝났어요. 실제 계정은 생성되지 않았어요. 로그인 화면에서 홈 화면을 미리 둘러보세요.
            </p>
            <Link href="/login" className="block rounded-xl bg-[#2d3559] px-4 py-3.5 text-center text-sm font-bold text-white">로그인 화면으로</Link>
          </div>
        ) : <AuthForm key={mode} mode={mode} onSuccess={handleSuccess} />}
        {error && <p role="alert" className="mt-4 text-sm text-[#a84f38]">{error}</p>}
      </AuthCard>
    </AuthShell>
  );
}
