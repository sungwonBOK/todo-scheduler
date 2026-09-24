import "./globals.css";

export const metadata = {
  title: "하루결 | 오늘을 가볍게 계획하는 다이어리",
  description: "Todo Scheduler의 프런트엔드 데모 화면입니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
