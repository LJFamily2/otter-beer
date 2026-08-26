"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HeaderLink {
  label: string;
  href: string;
}

interface HeaderProps {
  links?: HeaderLink[];
  contactHref?: string;
  locale?: string;
  locales?: string[];
  onLanguageChange?: (language: string) => void;
}

/**
 * Marketing site header with centered logo, navigation links,
 * social icons, language selector, and contact button.
 * Follows the "Coastal Premium" design system (docs/DESIGN.md).
 * AI agents: customize via props (links, contactHref, locale, locales),
 * not by editing this file's markup.
 */
export function Header({
  links = [
    { label: "Sản phẩm", href: "#products" },
    { label: "Blogs", href: "/blog" },
    { label: "Tin tức", href: "#news" },
  ],
  contactHref = "#contact",
  locale = "VIE",
  locales = ["VIE", "ENG"],
  onLanguageChange,
}: HeaderProps) {
  const [languageOpen, setLanguageOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const syncScrollState = () => setIsScrolled(window.scrollY > 0);

    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });
    return () => window.removeEventListener("scroll", syncScrollState);
  }, []);

  const handleLanguageSelect = (lang: string) => {
    setLanguageOpen(false);
    onLanguageChange?.(lang);

    const isEnglish = lang === "ENG";
    const pathWithoutLocale =
      (pathname || "/").replace(/^\/en(?=\/|$)/, "") || "/";
    const nextPath = isEnglish
      ? `/en${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`
      : pathWithoutLocale;

    if (nextPath !== pathname) {
      router.push(
        `${nextPath}${window.location.search}${window.location.hash}`,
      );
    }
  };

  return (
    <header
      className={`relative h-[90px] w-full transition-colors duration-300 ${
        isScrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary navigation"
        className="absolute left-[65px] top-1/2 flex -translate-y-1/2 items-center gap-14 max-[900px]:hidden"
      >
        {links.slice(0, 3).map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className={`text-[19px] font-bold uppercase tracking-[0.9px] transition-colors ${isScrolled ? "text-primary hover:text-primary-container" : "text-on-tertiary hover:text-on-tertiary-container"}`}
            style={{ fontFamily: "sans-serif" }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Centered Logo */}
      <Link
        href="/"
        aria-label="Otter Beer"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className={`relative transition-[height,width] duration-300 ${isScrolled ? "h-[60px] w-[95px] sm:h-[78px] sm:w-[130px]" : "h-[70px] w-[110px] sm:h-[90px] sm:w-[150px]"}`}
        >
          <Image
            src="/images/header/logo.png"
            alt="Otter Beer Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="sr-only">Otter Beer</span>
      </Link>

      {/* Right-side group: Social icons, Language selector, Contact button */}
      <div className="absolute right-[41px] top-1/2 flex -translate-y-1/2 items-center gap-4 max-[900px]:right-4 max-[900px]:gap-2">
        {/* Social Icon - Instagram */}
        <a
          href="https://instagram.com/otterbeer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[38px] w-[28px] items-center justify-center transition-opacity hover:opacity-80 max-[520px]:hidden"
          aria-label="Instagram"
        >
          <Image
            src="/images/header/social-instagram.png"
            alt="Instagram"
            width={40}
            height={40}
            className="object-contain"
          />
        </a>

        {/* Social Icon - Facebook */}
        <a
          href="https://facebook.com/otterbeer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[29px] w-[29px] items-center justify-center transition-opacity hover:opacity-80 max-[520px]:hidden"
          aria-label="Facebook"
        >
          <Image
            src="/images/header/social-facebook.png"
            alt="Facebook"
            width={39}
            height={39}
            className="object-contain"
          />
        </a>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            className="flex h-[37px] w-[64px] items-center justify-center gap-2 transition-colors"
            aria-label="Select language"
          >
            <span
              className={
                isScrolled
                  ? "text-[19px] font-bold uppercase text-primary"
                  : "text-[19px] font-bold uppercase text-on-primary"
              }
              style={{ fontFamily: "sans-serif" }}
            >
              {locale}
            </span>
            <svg
              className={`h-1.5 w-2.5 transition-transform ${languageOpen ? "" : "rotate-180"}`}
              viewBox="0 0 9 6"
              fill={
                isScrolled ? "var(--color-primary)" : "var(--color-on-primary)"
              }
            >
              <path d="M8 0L4 5L0 0H8Z" />
            </svg>
          </button>

          {/* Language Dropdown Menu */}
          {languageOpen && (
            <div className="absolute top-full left-0 w-full bg-surface-container shadow-md">
              {locales.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageSelect(lang)}
                  className="block w-full px-3 py-2 text-left text-sm text-on-surface-variant hover:bg-surface-container-high"
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contact Button */}
        <Link
          href={contactHref}
          className={`flex h-[50px] w-[120px] items-center justify-center rounded-sm text-[18px] font-bold uppercase tracking-[0.9px] transition-colors max-[520px]:h-[42px] max-[520px]:w-[92px] max-[520px]:text-[14px] ${isScrolled ? "bg-primary text-on-primary hover:bg-primary-container" : "text-on-tertiary hover:text-on-tertiary-container"}`}
          style={{ fontFamily: "sans-serif" }}
        >
          Liên hệ
        </Link>
      </div>
    </header>
  );
}
