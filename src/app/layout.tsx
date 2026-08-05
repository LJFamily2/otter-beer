import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Otter Beer",
  description: "Khám phá thế giới bia thủ công tại Otter Beer — otterbeer.vn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={geist.variable}>
      <body>{children}</body>
    </html>
  );
}

