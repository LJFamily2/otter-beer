"use client";

import { useSyncExternalStore, useState, type ReactNode } from "react";
import { AgeVerificationGate } from "@/components/ui/AgeVerificationGate";

const STORAGE_KEY = "otter_age_verified";
const COOKIE_NAME = "otter_age_verified";

interface AgeGateWrapperProps {
  children: ReactNode;
  locale: string;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("otter_age_verified_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("otter_age_verified_change", callback);
  };
}

function getClientSnapshot(): boolean {
  try {
    const hasLocalStorage = localStorage.getItem(STORAGE_KEY) === "true";
    const hasCookie = document.cookie
      .split("; ")
      .some((row) => row.startsWith(`${COOKIE_NAME}=true`));

    return hasLocalStorage || hasCookie;
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export function AgeGateWrapper({ children, locale }: AgeGateWrapperProps) {
  const isVerifiedExternal = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  // Local state for immediate React-level unlock before storage event fires
  const [localVerified, setLocalVerified] = useState(false);

  const isVerified = isVerifiedExternal || localVerified;

  // If unverified, show ONLY the full-screen gate (no header, footer, or page content)
  if (!isVerified) {
    return (
      <AgeVerificationGate
        locale={locale}
        isStandalone={true}
        onVerified={() => {
          setLocalVerified(true);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("otter_age_verified_change"));
          }
        }}
      />
    );
  }

  // Once verified, render full layout (header, page content, footer)
  return <>{children}</>;
}
