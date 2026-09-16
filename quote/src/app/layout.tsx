import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "AIGL 대시보드", description: "AI GOLF 관리자 — 상품·예약·고객·콘텐츠 관리와 골프투어 원가표 견적" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" />
      </head>
      <body className="admin-body">{children}</body>
    </html>
  );
}
