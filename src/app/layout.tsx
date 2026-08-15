import type { Metadata } from "next";
import { Anton, Hanken_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import { DEFAULT_LOCALE } from "@/config/locales";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

export const metadata: Metadata = {
  title: {
    default: "Otter Beer",
    template: "%s | Otter Beer",
  },
  description: "Khám phá thế giới bia thủ công tại Otter Beer — otterbeer.vn",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // src/proxy.ts sets this header for the marketing [locale] tree; admin
  // routes never set it, so they always render as Vietnamese, matching the
  // admin panel's VI-only UI requirement.
  const headerList = await headers();
  const lang = headerList.get("x-locale") ?? DEFAULT_LOCALE;

  return (
    <html lang={lang} className={`${anton.variable} ${hankenGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
