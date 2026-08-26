import type { ReactNode } from "react";
import { DEFAULT_LOCALE } from "@/config/locales";
import { Header } from "@/components/layout/header";
import { CookieConsent } from "@/components/ui/CookieConsent";

import { Footer } from "@/components/layout/Footer";
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
        { label: "Giới thiệu", href: `${prefix}#about` },
        { label: "Sản phẩm", href: `${prefix}#products` },
        { label: "Tin tức", href: `${prefix}/blog` },
      ]
    : [
        { label: "About", href: `${prefix}#about` },
        { label: "Products", href: `${prefix}#products` },
        { label: "News", href: `${prefix}/blog` },
      ];

  return (
    <AgeGateWrapper locale={locale}>
      <div className="flex min-h-dvh flex-col">
        <Header
          links={navigationLinks}
          contactHref={`${prefix}/contact`}
          locale={isVi ? "VIE" : "ENG"}
          locales={["VIE", "ENG"]}
        />

        <main className="flex-1">{children}</main>

      <Footer locale={locale} />

      <CookieConsent locale={locale} />
    </div>
   </AgeGateWrapper> 
  );
}

