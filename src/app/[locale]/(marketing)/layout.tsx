import type { ReactNode } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/config/locales";

import { Footer } from "@/components/layout/Footer";

interface MarketingLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function MarketingLayout({
  children,
  params,
}: MarketingLayoutProps) {
  const { locale } = await params;
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  const isVi = locale === DEFAULT_LOCALE;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-[rgba(196,198,210,0.3)] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4">
          <Link href={prefix || "/"} className="flex items-center gap-3 no-underline">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary font-display text-sm tracking-wide text-on-primary">
              OB
            </span>
            <span className="font-display text-2xl tracking-wide text-primary">
              Otter Beer
            </span>
          </Link>
          <nav className="flex gap-6">
            <Link
              href={prefix || "/"}
              className="text-[15px] font-medium uppercase tracking-wide text-on-surface-variant no-underline hover:text-primary"
            >
              {isVi ? "Trang chủ" : "Home"}
            </Link>
            <Link
              href={`${prefix}/blog`}
              className="text-[15px] font-medium uppercase tracking-wide text-on-surface-variant no-underline hover:text-primary"
            >
              Blog
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Footer locale={locale} />
    </div>
  );
}
