import type { ReactNode } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/config/locales";
import { Header } from "@/components/layout/header";
import { CookieConsent } from "@/components/ui/CookieConsent";

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

      <footer className="mt-auto bg-primary px-5 py-12">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 text-center">
          <div className="font-display text-2xl tracking-wider text-on-primary uppercase">
            OTTER BEER
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-wider text-inverse-primary">
            <Link href={`${prefix}/privacy`} className="hover:text-on-primary transition-colors">
              {isVi ? "Chính sách bảo mật" : "Privacy Policy"}
            </Link>
            <Link href={`${prefix}/terms`} className="hover:text-on-primary transition-colors">
              {isVi ? "Điều khoản dịch vụ" : "Terms of Service"}
            </Link>
          </nav>
          <p className="text-xs text-inverse-primary/80">
            © {new Date().getFullYear()} Otter Beer.{" "}
            {isVi ? "Đã đăng ký bản quyền. Coastal Premium Quality." : "All rights reserved. Coastal Premium Quality."}
          </p>
        </div>
      </footer>

      <CookieConsent />
    </div>
  );
}

