import Link from "next/link";

import Logo from "../ui/Logo";

const COPY = {
  login: {
    description: "오늘의 할 일을 차분히 정리해 볼까요?",
    linkHref: "/signup",
    linkLabel: "처음이신가요? 데모 시작하기",
    title: "다시 만나 반가워요",
  },
  signup: {
    description: "간단한 데모로 할 일 계획을 둘러보세요.",
    linkHref: "/login",
    linkLabel: "이미 둘러보셨나요? 로그인으로",
    title: "Todo Scheduler 시작하기",
  },
};

export default function AuthCard({ children, mode }) {
  const copy = COPY[mode] ?? COPY.login;

  return (
    <section
      aria-labelledby="auth-title"
      className="mx-auto w-full max-w-md rounded-[2rem] border border-white/90 bg-white/95 p-6 shadow-[0_24px_70px_rgba(45,53,89,0.14)] backdrop-blur-sm sm:p-9"
    >
      <Logo />
      <p className="mt-7 mb-3 text-sm font-black text-[#8f7ce7]">나만의 다이어리, 가볍게 시작하기</p>
      <h1 id="auth-title" className="text-3xl font-black tracking-[-0.06em] text-[#2d3559]">
        {copy.title}
      </h1>
      <p className="mt-3 leading-6 text-[#727895]">{copy.description}</p>
      <p className="mt-2 rounded-xl bg-[#fff7ef] px-3 py-2.5 text-xs leading-5 text-[#977466]">
        입력한 정보는 데모 화면으로 이동하는 데에만 사용되며, 실제 계정은 만들어지지 않아요.
      </p>
      <div className="mt-8">{children}</div>
      <Link
        href={copy.linkHref}
        className="mt-6 inline-block text-sm font-bold text-[#725fca] underline-offset-4 transition hover:text-[#5d4caf] hover:underline"
      >
        {copy.linkLabel}
      </Link>
    </section>
  );
}
