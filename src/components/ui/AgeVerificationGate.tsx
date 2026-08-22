"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE } from "@/config/locales";

interface AgeVerificationGateProps {
  locale?: string;
  isStandalone?: boolean;
  onVerified?: () => void;
}

const STORAGE_KEY = "otter_age_verified";
const COOKIE_NAME = "otter_age_verified";

export function AgeVerificationGate({
  locale = DEFAULT_LOCALE,
  isStandalone = false,
  onVerified,
}: AgeVerificationGateProps) {
  const router = useRouter();
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  const [isVerified, setIsVerified] = useState<boolean | null>(() =>
    isStandalone ? false : null
  );
  const [isDenied, setIsDenied] = useState(false);

  useEffect(() => {
    if (isStandalone) {
      return;
    }

    const checkVerification = () => {
      try {
        const hasLocalStorage = localStorage.getItem(STORAGE_KEY) === "true";
        const hasCookie = document.cookie
          .split("; ")
          .some((row) => row.startsWith(`${COOKIE_NAME}=true`));

        setIsVerified(hasLocalStorage || hasCookie);
      } catch {
        setIsVerified(false);
      }
    };

    checkVerification();
  }, [isStandalone]);

  const handleConfirmAge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      document.cookie = `${COOKIE_NAME}=true; path=/; max-age=2592000; SameSite=Lax`;
    } catch {
      // Ignore storage errors in restricted contexts
    }

    setIsVerified(true);
    if (onVerified) {
      onVerified();
    }

    if (isStandalone) {
      router.push(prefix || "/");
    }
  };

  const handleDenyAge = () => {
    setIsDenied(true);
  };

  const handleReset = () => {
    setIsDenied(false);
  };

  if (isVerified === true && !isStandalone) {
    return null;
  }

  if (isVerified === null && !isStandalone) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-verification-heading"
      className={
        isStandalone
          ? "relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#786d5c]"
          : "fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#786d5c]"
      }
    >
      {/* Background Graphic */}
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        <Image
          src="/images/age-verification-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Main Card Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col items-center overflow-y-auto px-5 py-8 text-center sm:px-6 sm:py-12">
        {/* Logo Badge */}
        <div className="relative mb-4 flex items-center justify-center transition-transform duration-300 hover:scale-105 sm:mb-6">
          <Image
            src="/images/otter-beer-logo-yellow-bg.png"
            alt="Otter Beer"
            width={208}
            height={208}
            priority
            className="h-28 w-28 rounded-2xl object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)] sm:h-44 sm:w-44 md:h-52 md:w-52"
          />
        </div>

        {!isDenied ? (
          <>
            {/* Age Question */}
            <h1
              id="age-verification-heading"
              className="font-display text-5xl uppercase leading-tight tracking-wide text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] sm:text-5xl md:text-6xl lg:text-7xl"
            >
              ARE YOU 18+?
            </h1>

            {/* Buttons Row */}
            <div className="mt-6 flex w-full max-w-xs flex-row items-center justify-center gap-3 sm:mt-8 sm:max-w-none sm:gap-6">
              {/* YES Button */}
              <button
                type="button"
                onClick={handleConfirmAge}
                className="group relative min-w-0 flex-1 cursor-pointer rounded-none border-2 border-white bg-[#1a3b78] px-4 py-3 font-display text-base tracking-widest text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#224b96] hover:shadow-2xl active:scale-95 sm:min-w-[140px] sm:flex-none sm:px-8 sm:py-3 sm:text-xl"
              >
                <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  YES
                </span>
              </button>

              {/* NO Button */}
              <button
                type="button"
                onClick={handleDenyAge}
                className="group relative min-w-0 flex-1 cursor-pointer rounded-none border-2 border-white bg-[#cf8e10] px-4 py-3 font-display text-base tracking-widest text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-[#df9c16] hover:shadow-2xl active:scale-95 sm:min-w-[140px] sm:flex-none sm:px-8 sm:py-3 sm:text-xl"
              >
                <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                  NO
                </span>
              </button>
            </div>
          </>
        ) : (
          /* Underage Denial View */
          <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <h1
              id="age-verification-heading"
              className="font-display text-4xl uppercase leading-tight tracking-wide text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] sm:text-4xl md:text-5xl"
            >
              ACCESS RESTRICTED
            </h1>
            <p className="mt-3 max-w-md text-md font-medium text-[#1B3D84]/80  sm:mt-4 sm:text-base">
              You must be 18 years of age or older to enter Otter Beer. We
              promote and support responsible drinking.
            </p>

            <div className="mt-5 flex items-center justify-center sm:mt-6">
              <a
                href="https://www.responsibility.org"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-none border-2 border-white bg-[#1a3b78] px-6 py-2.5 text-center font-display text-sm tracking-wider text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-[#224b96] active:scale-95 sm:px-8 sm:py-3"
              >
                LEARN MORE
              </a>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="group mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1B3D84]/50 transition-all duration-200 hover:text-[#1B3D84]/90"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform duration-500 group-hover:-rotate-180"
              >
                <path
                  d="M4 12a8 8 0 0 1 14.5-4.5M20 12a8 8 0 0 1-14.5 4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path d="M18.5 3v4.5H14M5.5 21v-4.5H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="underline-offset-4 group-hover:underline">
                I made a mistake (re-verify)
              </span>
            </button>
          </div>
        )}
      </div>
    </div >
  );
}