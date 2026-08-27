import type { Metadata, Viewport } from "next";
import { Anton, Hanken_Grotesk } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { getServerLocale } from "@/lib/utils/getServerLocale";
import { env } from "@/lib/env";
import { BRAND_NAME, LEGAL_NAME } from "@/config/brand";
import { LOGO_PATH, OG_IMAGE_PATH } from "@/lib/seo";
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

const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

export const metadata: Metadata = {
  /**
   * Without metadataBase every relative OpenGraph/Twitter image resolves
   * against nothing and Next drops it, so shared links render with no preview
   * image at all. This one line is what makes every `images:` entry across the
   * site resolve to an absolute URL.
   */
  metadataBase: new URL(siteUrl),

  title: {
    default: `${BRAND_NAME} — Bia Thủ Công Tây Ninh`,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    "Otter Beer — bia thủ công nấu tại Tây Ninh từ 100% mạch nha vàng, nước suối Tây Ninh và hoa bia Saaz tuyển chọn.",

  applicationName: BRAND_NAME,
  publisher: LEGAL_NAME,
  authors: [{ name: LEGAL_NAME, url: siteUrl }],
  creator: LEGAL_NAME,
  category: "food and drink",

  /**
   * Explicit crawler directives. `max-image-preview: large` is what allows a
   * full-size image in a result or an AI overview instead of a thumbnail, and
   * `max-snippet: -1` lifts the cap on how much of a page an answer engine may
   * quote — both are opt-in and both matter for AEO/GEO.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [{ url: LOGO_PATH, type: "image/png" }],
    apple: [{ url: LOGO_PATH }],
  },

  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    url: siteUrl,
    images: [{ url: OG_IMAGE_PATH, width: 1200, height: 630, alt: BRAND_NAME }],
  },

  twitter: {
    card: "summary_large_image",
  },

  // Phone numbers are already marked up as tel: links in the Contact section;
  // letting iOS Safari also auto-linkify them rewrites the DOM and breaks the
  // styling on those blocks.
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#002867",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getServerLocale();

  return (
    <html lang={lang} className={`${anton.variable} ${hankenGrotesk.variable} scroll-smooth`}>
      <body>
        {children}
        {env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
