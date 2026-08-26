import type { ReactNode } from "react";
import { DEFAULT_LOCALE } from "@/config/locales";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { AgeGateWrapper } from "@/components/layout/AgeGateWrapper";

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

  const navigationLinks = isVi
    ? [
        { label: "Sản phẩm", href: `${prefix}#products` },
        { label: "Tin tức", href: `${prefix}/blog` },
      ]
    : [
        { label: "Products", href: `${prefix}#products` },
        { label: "News", href: `${prefix}/blog` },
      ];

  return (
    <AgeGateWrapper locale={locale}>
      <div className="relative flex min-h-dvh flex-col">
        <div className="fixed inset-x-0 top-0 z-30">
          <Header
            links={navigationLinks}
            contactHref={`${prefix}/contact`}
            locale={isVi ? "VIE" : "ENG"}
            locales={["VIE", "ENG"]}
          />
        </div>

        <main className="flex-1">{children}</main>

        {/* The footer is the site's only crawl path to /privacy, /terms and
            /contact — the header nav links just #products and /blog, which
            left those three pages effectively orphaned. */}
        <Footer locale={locale} />
        <CookieConsent locale={locale} />
      </div>
    </AgeGateWrapper>
  );
}
