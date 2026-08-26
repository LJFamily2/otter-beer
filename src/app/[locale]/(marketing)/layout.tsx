import type { ReactNode } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/config/locales";
import { Header } from "@/components/layout/header";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { AgeGateWrapper } from "@/components/layout/AgeGateWrapper";
import {
  ADDRESS,
  CONTACT,
  LEGAL_NAME,
  MAP_URL,
  SOCIAL_PROFILES,
} from "@/config/brand";

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
            left those three pages effectively orphaned. It also repeats the
            NAP verbatim from src/config/brand.ts, the same strings the
            Brewery JSON-LD emits: a footer address that disagrees with the
            structured data is the classic local-SEO trust killer. */}
        <footer className="mt-auto bg-primary px-5 py-16 text-on-primary">
          <div className="mx-auto grid max-w-[1280px] gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="font-display text-xl tracking-wide">
                OTTER BEER
              </div>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-inverse-primary">
                {isVi
                  ? "Bia thủ công nấu tại Tây Ninh từ 100% mạch nha vàng, nước suối Tây Ninh và hoa bia Saaz tuyển chọn."
                  : "Craft beer brewed in Tay Ninh with 100% golden malt, Tay Ninh spring water and select Saaz hops."}
              </p>
            </div>

            <nav aria-label={isVi ? "Liên kết chân trang" : "Footer"}>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-inverse-primary">
                {isVi ? "Khám phá" : "Explore"}
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href={`${prefix}/`} className="hover:underline">
                    {isVi ? "Trang chủ" : "Home"}
                  </Link>
                </li>
                <li>
                  <Link href={`${prefix}#products`} className="hover:underline">
                    {isVi ? "Sản phẩm" : "Products"}
                  </Link>
                </li>
                <li>
                  <Link href={`${prefix}#faq`} className="hover:underline">
                    {isVi ? "Câu hỏi thường gặp" : "FAQ"}
                  </Link>
                </li>
                <li>
                  <Link href={`${prefix}/blog`} className="hover:underline">
                    {isVi ? "Tin tức" : "News"}
                  </Link>
                </li>
                <li>
                  <Link href={`${prefix}/contact`} className="hover:underline">
                    {isVi ? "Liên hệ" : "Contact"}
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-inverse-primary">
                {isVi ? "Nhà máy bia" : "Brewery"}
              </h2>
              <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed">
                <span className="block">{LEGAL_NAME}</span>
                <span className="block text-inverse-primary">
                  {ADDRESS.streetAddress}, {ADDRESS.addressRegion}
                </span>
                <a
                  href={`tel:${CONTACT.phones[0]}`}
                  className="block hover:underline"
                >
                  {CONTACT.phonesDisplay[0]}
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="block hover:underline"
                >
                  {CONTACT.email}
                </a>
                <a
                  href={MAP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:underline"
                >
                  {isVi ? "Chỉ đường" : "Get directions"}
                </a>
              </address>

              {SOCIAL_PROFILES.length > 0 && (
                <ul className="mt-4 flex gap-4 text-sm">
                  {SOCIAL_PROFILES.map((href) => (
                    <li key={href}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {new URL(href).hostname.replace("www.", "").split(".")[0]}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mx-auto mt-12 flex max-w-[1280px] flex-col gap-3 border-t border-on-primary/20 pt-6 text-sm text-inverse-primary sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {LEGAL_NAME}.{" "}
              {isVi ? "Đã đăng ký bản quyền." : "All rights reserved."}
            </p>
            <div className="flex gap-6">
              <Link href={`${prefix}/privacy`} className="hover:underline">
                {isVi ? "Chính sách bảo mật" : "Privacy Policy"}
              </Link>
              <Link href={`${prefix}/terms`} className="hover:underline">
                {isVi ? "Điều khoản sử dụng" : "Terms of Service"}
              </Link>
            </div>
          </div>
        </footer>
        <CookieConsent locale={locale} />
      </div>
    </AgeGateWrapper>
  );
}
