"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SOCIAL_PROFILES } from "@/config/brand";

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
 * Desktop: Centered logo image, left nav, right socials + lang + contact.
 * Mobile: OTTER BEER title, language selector, and creative beer pint menu dropdown.
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
    <>
      <header
        className={`relative w-full transition-all duration-300 ${
          isScrolled
            ? "h-[76px] bg-white/95 backdrop-blur-md shadow-sm"
            : "h-[105px] bg-gradient-to-b from-black/50 via-black/15 to-transparent"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-6 sm:px-10 lg:px-16">
          {/* Left Navigation Links (Desktop only) */}
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

          {/* Mobile Title (Mobile view only: OTTER BEER) */}
          <Link
            href="/"
            aria-label="Otter Beer Home"
            className="flex items-center group transition-opacity hover:opacity-90 min-[900px]:hidden z-10"
          >
            <span
              className={`font-black text-xl sm:text-2xl uppercase tracking-[0.2em] transition-colors duration-300 ${
                isScrolled
                  ? "text-primary"
                  : "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              }`}
            >
              OTTER BEER
            </span>
          </Link>

          {/* Centered Logo Image (Desktop view only) */}
          <Link
            href="/"
            aria-label="Otter Beer"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-105 hidden min-[900px]:block"
          >
            <div
              className={`relative transition-all duration-300 ${
                isScrolled
                  ? "h-[54px] w-[90px] sm:h-[66px] sm:w-[110px]"
                  : "h-[85px] w-[135px] sm:h-[115px] sm:w-[190px]"
              }`}
            >
              <Image
                src="/images/header/logo.png"
                alt="Otter Beer Logo"
                fill
                sizes="(max-width: 640px) 135px, 190px"
                className="object-contain"
                priority
              />
            </div>
            <span className="sr-only">Otter Beer</span>
          </Link>

          {/* Right-side group: Social icons, Language selector, Contact button, Beer Pint Menu button */}
          <div className="ml-auto flex items-center gap-3 sm:gap-4 z-10">
            {/* Social Icon - Instagram (Desktop only) */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="me noopener noreferrer"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 max-[900px]:hidden ${
                isScrolled
                  ? "text-primary hover:bg-primary/10 hover:text-primary-container"
                  : "text-white hover:bg-white/20 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              }`}
              aria-label="Instagram"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>

            {/* Social Icon - Facebook (Desktop only) */}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="me noopener noreferrer"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95 max-[900px]:hidden ${
                isScrolled
                  ? "text-primary hover:bg-primary/10 hover:text-primary-container"
                  : "text-white hover:bg-white/20 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              }`}
              aria-label="Facebook"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>

            {/* Language Selector Dropdown (Desktop & Mobile) */}
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

            {/* Contact Button (Desktop only) */}
            <Link
              href={contactHref}
              className={`flex h-9 sm:h-10 items-center justify-center rounded-full px-4 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-[0.1em] transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] max-[900px]:hidden ${
                isScrolled
                  ? "bg-primary text-on-primary shadow-sm hover:bg-primary-container hover:shadow-md"
                  : "bg-white/90 text-primary shadow-md backdrop-blur-sm hover:bg-white hover:text-primary-container"
              }`}
            >
              Liên hệ
            </Link>

            {/* Creative Craft Beer Pint Menu Button (Mobile view only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 min-[900px]:hidden ${
                isScrolled
                  ? "text-primary hover:bg-primary/10"
                  : "text-white hover:bg-white/20 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
              }`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <ClosePintIcon className="h-8 w-8" />
              ) : (
                <BeerPintMenuIcon className="h-8 w-8" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Craft Brewery Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0f0e0c]/98 p-6 sm:p-10 backdrop-blur-2xl transition-all duration-300 min-[900px]:hidden text-white border-l border-amber-500/20 shadow-2xl">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-6">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex flex-col"
            >
              <span className="font-black text-xl uppercase tracking-[0.2em] text-white">
                OTTER BEER
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500/90">
                EST. 2024 • CRAFT BREWERY
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <ClosePintIcon className="h-8 w-8" />
            </button>
          </div>

          {/* Drawer Main Craft Navigation */}
          <nav className="my-auto flex flex-col items-start gap-5 py-6">
            {links.map((link, idx) => (
              <Link
                key={`${link.href}-${link.label}`}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-baseline gap-4 transition-transform hover:translate-x-2"
              >
                <span className="text-xs font-mono font-bold text-amber-500/80">
                  0{idx + 1}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.15em] text-white/90 transition-colors group-hover:text-amber-400">
                  {link.label}
                </span>
              </Link>
            ))}

            <Link
              href={contactHref}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-sm font-extrabold uppercase tracking-[0.15em] shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95"
            >
              Liên hệ
            </Link>
          </nav>

          {/* Drawer Footer: Language switch & Craft Tagline */}
          <div className="flex items-center justify-between border-t border-amber-500/20 pt-6">
            <div className="flex items-center gap-2.5">
              {locales.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    handleLanguageSelect(lang);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    lang === locale
                      ? "bg-amber-500 text-zinc-950 shadow-md font-extrabold"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {lang === "VIE" ? "Tiếng Việt" : "English"} ({lang})
                </button>
              ))}
            </div>

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500/70">
              TÂY NINH, VN
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// ─── SVG Vector Icons ──────────────────────────────────────────────────────

/** Creative Beer Pint & Foam Menu Icon for Brewery Mobile View */
function BeerPintMenuIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="18.5"
        stroke="currentColor"
        strokeWidth="1.5"
        className="opacity-40"
      />
      <path
        d="M14 13L15.5 27.5C15.7 29.5 17 31 19 31H21C23 31 24.3 29.5 24.5 27.5L26 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12.5 13C13.5 11.5 15.5 11.5 17 12.5C18.5 11.5 21.5 11.5 23 12.5C24.5 11.5 26.5 11.5 27.5 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="16.5"
        y1="18"
        x2="23.5"
        y2="18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="17"
        y1="22"
        x2="23"
        y2="22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClosePintIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="18.5"
        stroke="currentColor"
        strokeWidth="1.5"
        className="opacity-50"
      />
      <path
        d="M14 14L26 26M26 14L14 26"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
