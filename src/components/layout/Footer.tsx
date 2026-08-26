import Link from "next/link";
import { DEFAULT_LOCALE } from "@/config/locales";

interface FooterProps {
  locale?: string;
}

export function Footer({ locale = DEFAULT_LOCALE }: FooterProps) {
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  return (
    <footer className="relative w-full overflow-hidden bg-background text-primary">
      {/* Subtle brand texture, same decorative pattern used on the privacy page */}
      <div className="heritage-pattern pointer-events-none absolute inset-0 z-0" />

      {/* Footer Content */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-14">
        {/* Top Navigation & Action Row */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:gap-6">
          {/* Left spacer for balance on desktop */}
          <div className="hidden lg:block lg:w-32" aria-hidden="true" />

          {/* Center Main Nav Links */}
          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-12 lg:gap-16"
          >
            <Link
              href={`${prefix}/about`}
              className="font-display text-2xl tracking-wide text-primary transition-colors duration-200 hover:text-primary-container sm:text-3xl lg:text-4xl"
            >
              OUR STORY
            </Link>
            <Link
              href={`${prefix}/about#heritage`}
              className="font-display text-2xl tracking-wide text-primary transition-colors duration-200 hover:text-primary-container sm:text-3xl lg:text-4xl"
            >
              HERITAGE
            </Link>
            <Link
              href={`${prefix}/events`}
              className="font-display text-2xl tracking-wide text-primary transition-colors duration-200 hover:text-primary-container sm:text-3xl lg:text-4xl"
            >
              TAPROOM
            </Link>
            <Link
              href={`${prefix}/menu`}
              className="font-display text-2xl tracking-wide text-primary transition-colors duration-200 hover:text-primary-container sm:text-3xl lg:text-4xl"
            >
              SHOP
            </Link>
          </nav>

          {/* Right Social & Utility Icons */}
          <div className="flex items-center gap-5 sm:gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-primary transition-transform duration-200 hover:scale-110 hover:text-primary-container active:scale-95"
            >
              <CameraIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            </a>

            <button
              type="button"
              aria-label="Scan QR Code"
              className="cursor-pointer text-primary transition-transform duration-200 hover:scale-110 hover:text-primary-container active:scale-95"
            >
              <QrCodeIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>

            <a
              href={`${prefix}/contact`}
              aria-label="Threads / Social"
              className="text-primary transition-transform duration-200 hover:scale-110 hover:text-primary-container active:scale-95"
            >
              <AtSymbolIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            </a>
          </div>
        </div>

        {/* Divider Line */}
        <div className="my-7 h-[1px] w-full bg-primary/20 sm:my-8" />

        {/* Bottom Legal & Secondary Links */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          {/* Copyright Notice */}
          <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-primary/90 sm:text-xs">
            © 2024 OTTER BEER COMPANY. BREWED WITH HONOR.
          </p>

          {/* Secondary Utility Links */}
          <nav
            aria-label="Legal and Contact Links"
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8"
          >
            <Link
              href={`${prefix}/privacy`}
              className="text-[11px] font-semibold uppercase tracking-wider text-primary underline underline-offset-4 decoration-primary/70 transition-colors duration-200 hover:text-primary-container hover:decoration-primary-container sm:text-xs"
            >
              PRIVACY POLICY
            </Link>
            <Link
              href={`${prefix}/terms`}
              className="text-[11px] font-semibold uppercase tracking-wider text-primary transition-colors duration-200 hover:text-primary-container hover:underline hover:underline-offset-4 sm:text-xs"
            >
              TERMS OF SERVICE
            </Link>
            <Link
              href={`${prefix}/wholesale`}
              className="text-[11px] font-semibold uppercase tracking-wider text-primary transition-colors duration-200 hover:text-primary-container hover:underline hover:underline-offset-4 sm:text-xs"
            >
              WHOLESALE
            </Link>
            <Link
              href={`${prefix}/contact`}
              className="text-[11px] font-semibold uppercase tracking-wider text-primary transition-colors duration-200 hover:text-primary-container hover:underline hover:underline-offset-4 sm:text-xs"
            >
              CONTACT
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────

function CameraIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4 6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h16a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-2.382l-1.106-2.21A2 2 0 0 0 14.724 2H9.276a2 2 0 0 0-1.788 1.79L6.382 6H4zm8 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6.5-7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function QrCodeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* Top Left Finder */}
      <path d="M2 2h7v7H2V2zm2 2v3h3V4H4z" />
      <path d="M5 5h1v1H5V5z" />
      {/* Top Right Finder */}
      <path d="M15 2h7v7h-7V2zm2 2v3h3V4h-3z" />
      <path d="M18 5h1v1h-1V5z" />
      {/* Bottom Left Finder */}
      <path d="M2 15h7v7H2v-7zm2 2v3h3v-3H4z" />
      <path d="M5 18h1v1H5v-1z" />
      {/* QR Data modules */}
      <path d="M11 2h2v3h-2V2zm0 6h2v3h-2V8zm-8 4h3v2H3v-2zm8 3h2v2h-2v-2zm-3 3h2v3H8v-3zm3 1h2v3h-2v-3zm4-7h3v2h-3v-2zm3 3h2v2h-2v-2zm-3 3h3v2h-3v-2zm3 3h2v2h-2v-2zm2-9h2v2h-2V9zm-5 7h2v2h-2v-2z" />
    </svg>
  );
}

function AtSymbolIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  );
}
