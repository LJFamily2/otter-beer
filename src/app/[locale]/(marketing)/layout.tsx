import type { ReactNode } from "react";
import { DEFAULT_LOCALE } from "@/config/locales";
import { Header } from "@/components/layout/header";

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
    <div className="flex min-h-dvh flex-col">
      <Header
        links={navigationLinks}
        contactHref={`${prefix}/contact`}
        locale={isVi ? "VIE" : "ENG"}
        locales={["VIE", "ENG"]}
      />

      <main className="flex-1">{children}</main>

      <footer className="mt-auto bg-primary px-5 py-16">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-2 text-center">
          <div className="font-display text-xl tracking-wide text-on-primary">
            OTTER BEER
          </div>
          <p className="text-sm text-inverse-primary">
            © {new Date().getFullYear()} Otter Beer.{" "}
            {isVi ? "Đã đăng ký bản quyền." : "All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}
