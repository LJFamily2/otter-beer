"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SOCIAL_PROFILES } from "@/config/brand";

// Same array the Organization `sameAs` JSON-LD emits, so the profiles the site
// links to and the profiles it claims to own are one list, not two.
const [FACEBOOK_URL, INSTAGRAM_URL] = SOCIAL_PROFILES;

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
  const languageRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const syncScrollState = () => setIsScrolled(window.scrollY > 10);

    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });
    return () => window.removeEventListener("scroll", syncScrollState);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setLanguageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      className={`relative w-full transition-all duration-300 ${
        isScrolled
          ? "h-[76px] bg-white/95 backdrop-blur-md shadow-sm"
          : "h-[115px] sm:h-[125px] bg-gradient-to-b from-black/50 via-black/15 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 sm:px-10 lg:px-16">
        {/* Left Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-8 lg:gap-12 max-[900px]:hidden"
        >
          {links.slice(0, 3).map((link) => (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={`group relative text-[15px] lg:text-[16px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 ${
                isScrolled
                  ? "text-primary hover:text-primary-container"
                  : "text-white hover:text-secondary-fixed drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              }`}
            >
              {link.label}
              <span
                className={`absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                  isScrolled ? "bg-primary" : "bg-white"
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Centered Logo */}
        <Link
          href="/"
          aria-label="Otter Beer"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-105"
        >
          <div
            className={`relative transition-all duration-300 ${
              isScrolled
                ? "h-[54px] w-[90px] sm:h-[66px] sm:w-[110px]"
                : "h-[95px] w-[150px] sm:h-[135px] sm:w-[220px]"
            }`}
          >
            <Image
              src="/images/header/logo.png"
              alt="Otter Beer Logo"
              fill
              sizes="(max-width: 640px) 150px, 220px"
              className="object-contain"
              priority
            />
          </div>
          <span className="sr-only">Otter Beer</span>
        </Link>

        {/* Right-side group: Social icons, Language selector, Contact button */}
        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          {/* Social Icon - Instagram */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            // rel="me" marks this as a profile the site's owner controls — the
            // same claim the Organization `sameAs` array makes, stated in HTML.
            rel="me noopener noreferrer"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 max-[520px]:hidden ${
              isScrolled
                ? "text-primary hover:bg-primary/10 hover:text-primary-container"
                : "text-white hover:bg-white/20 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
            }`}
            aria-label="Instagram"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>

          {/* Social Icon - Facebook */}
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="me noopener noreferrer"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 max-[520px]:hidden ${
              isScrolled
                ? "text-primary hover:bg-primary/10 hover:text-primary-container"
                : "text-white hover:bg-white/20 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
            }`}
            aria-label="Facebook"
          >
            <FacebookIcon className="h-5 w-5" />
          </a>

          {/* Language Selector Dropdown */}
          <div className="relative" ref={languageRef}>
            <button
              onClick={() => setLanguageOpen(!languageOpen)}
              className={`flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                isScrolled
                  ? "text-primary hover:bg-primary/10"
                  : "text-white hover:bg-white/20 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              }`}
              aria-label="Select language"
            >
              <span>{locale}</span>
              <svg
                className={`h-3 w-3 transition-transform duration-200 ${
                  languageOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Language Dropdown Menu */}
            {languageOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 overflow-hidden rounded-xl border border-surface-container-high/80 bg-white/95 py-1.5 shadow-lg backdrop-blur-md transition-all duration-200">
                {locales.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageSelect(lang)}
                    className={`block w-full px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                      lang === locale
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {lang === "VIE" ? "Tiếng Việt" : "English"} ({lang})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contact Button */}
          <Link
            href={contactHref}
            className={`flex h-9 sm:h-10 items-center justify-center rounded-full px-4 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-[0.1em] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
              isScrolled
                ? "bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:shadow-md"
                : "bg-white/90 text-primary shadow-md backdrop-blur-sm hover:bg-white hover:text-primary-container"
            }`}
          >
            Liên hệ
          </Link>
        </div>
      </div>
    </header>
  );
}

// ─── SVG Vector Icons ──────────────────────────────────────────────────────

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

