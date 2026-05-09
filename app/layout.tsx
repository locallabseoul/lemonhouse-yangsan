import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "레몬하우스 양산점 | 아파트 전문 인테리어",
  description:
    "레몬하우스 양산점의 아파트 전문 인테리어 포트폴리오, 고객 후기, 무료 견적 상담 안내.",
  openGraph: {
    title: "레몬하우스 양산점",
    description: "양산 아파트 인테리어 전문 상담과 시공 사례를 확인하세요.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
