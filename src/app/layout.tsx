import type { Metadata } from "next";
import { Anton, Hanken_Grotesk } from "next/font/google";
import { getServerLocale } from "@/lib/utils/getServerLocale";
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
  const lang = await getServerLocale();

  return (
    <html lang={lang} className={`${anton.variable} ${hankenGrotesk.variable} scroll-smooth`}>
      <body>{children}</body>
    </html>
  );
}
