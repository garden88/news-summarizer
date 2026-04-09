import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "데일리 뉴스 브리핑",
  description: "TOP 10 핵심 뉴스 브리핑, 키워드·감정·주제·트렌드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F2F4F7] text-[#1C2D4F]">
        {children}
      </body>
    </html>
  );
}
