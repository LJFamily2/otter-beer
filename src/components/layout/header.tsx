"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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
    { label: "Giới thiệu", href: "#about" },
    { label: "Sản phẩm", href: "#products" },
    { label: "Tin tức", href: "#news" },
  ],
  contactHref = "#contact",
  locale = "VIE",
  locales = ["VIE", "ENG"],
  onLanguageChange,
}: HeaderProps) {
  const [languageOpen, setLanguageOpen] = useState(false);

  const handleLanguageSelect = (lang: string) => {
    setLanguageOpen(false);
    onLanguageChange?.(lang);
  };

  return (
    <header className="relative h-[100px] w-full bg-transparent">
      {/* Navigation Link - "Giới thiệu" */}
      {links[0] && (
        <Link
          href={links[0].href}
          className="absolute left-[65px] top-[38px] text-[21px] font-normal uppercase tracking-[0.9px] text-primary transition-colors hover:text-primary-container"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          {links[0].label}
        </Link>
      )}

      {/* Navigation Link - "Sản phẩm" */}
      {links[1] && (
        <Link
          href={links[1].href}
          className="absolute left-[233px] top-[38px] text-[21px] font-normal uppercase tracking-[0.9px] text-primary transition-colors hover:text-primary-container"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          {links[1].label}
        </Link>
      )}

      {/* Navigation Link - "Tin tức" */}
      {links[2] && (
        <Link
          href={links[2].href}
          className="absolute left-[397px] top-[38px] text-[21px] font-normal uppercase tracking-[0.9px] text-primary transition-colors hover:text-primary-container"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          {links[2].label}
        </Link>
      )}

      {/* Centered Logo */}
      <Link href="/" className="absolute left-1/2 top-[5px] -translate-x-1/2">
        <div className="relative h-[90px] w-[110px]">
          <Image
            src="/images/header/logo.png"
            alt="Otter Beer Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </Link>

      {/* Right-side group: Social icons, Language selector, Contact button */}
      <div className="absolute right-[41px] top-[25px] flex items-center gap-4">
        {/* Social Icon - Facebook */}
        <a
          href="https://facebook.com/otterbeer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[40px] w-[30px] items-center justify-center transition-opacity hover:opacity-80"
          aria-label="Facebook"
        >
          <Image
            src="/images/header/social-facebook.png"
            alt="Facebook"
            width={40}
            height={40}
            className="object-contain"
          />
        </a>

        {/* Social Icon - Instagram */}
        <a
          href="https://instagram.com/otterbeer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-[29px] w-[29px] items-center justify-center transition-opacity hover:opacity-80"
          aria-label="Instagram"
        >
          <Image
            src="/images/header/social-instagram.png"
            alt="Instagram"
            width={39}
            height={39}
            className="object-contain"
          />
        </a>

        {/* Language Selector Dropdown */}
        <div className="relative bg-surface-container">
          <button
            onClick={() => setLanguageOpen(!languageOpen)}
            className="flex h-[37px] w-[64px] items-center justify-center gap-2 transition-colors hover:bg-surface-container-high"
            aria-label="Select language"
          >
            <span
              className="text-[16px] font-normal uppercase text-on-surface-variant"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {locale}
            </span>
            <svg
              className={`h-1.5 w-2.5 transition-transform ${languageOpen ? "" : "rotate-180"}`}
              viewBox="0 0 9 6"
              fill="currentColor"
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
          className="flex h-[50px] w-[120px] items-center justify-center rounded-sm bg-primary text-[18px] font-normal uppercase tracking-[0.9px] text-on-primary transition-colors hover:bg-primary-container"
          style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          Liên hệ
        </Link>
      </div>
    </header>
  );
}
