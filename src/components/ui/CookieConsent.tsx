"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "otter_beer_cookie_consent";

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem(STORAGE_KEY);
    if (!savedConsent) {
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsented: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allConsented));
    setIsOpen(false);
  };

  const handleRejectNonEssential = () => {
    const minimalConsent: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalConsent));
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setShowSettings(false);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Bottom Sticky Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-outline-variant/30 gold-border-top shadow-md">
        <div className="mx-auto max-w-[1280px] p-5 md:px-16 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2 text-primary">
              <svg
                className="w-6 h-6 fill-current text-primary"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M21.59 11.59a9.98 9.98 0 0 0-8.58-8.58 1 1 0 0 0-1.11 1.11c.14.91-.18 1.83-.83 2.48s-1.57.97-2.48.83a1 1 0 0 0-1.11 1.11c.54 2.87-1.4 5.56-4.32 5.96a1 1 0 0 0-.86 1.14 10 10 0 1 0 19.29-4.05ZM8.5 15a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm3.5-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm4.5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
              </svg>
              <h2 className="font-display text-xl uppercase tracking-wide">
                Your Privacy Choice
              </h2>
            </div>
            <p className="text-sm text-on-surface-variant max-w-4xl leading-relaxed">
              We use cookies to enhance your coastal browsing experience, serve
              personalized content, and analyze our traffic. By clicking
              &quot;Accept All&quot;, you consent to our use of cookies. Read
              our{" "}
              <Link
                href="/privacy"
                className="text-primary underline hover:text-secondary transition-colors"
              >
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowSettings(true)}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-primary border border-primary hover:bg-surface-container transition-colors rounded-sm w-full sm:w-auto text-center"
            >
              Settings
            </button>
            <button
              onClick={handleRejectNonEssential}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant border border-outline-variant hover:bg-surface-container transition-colors rounded-sm w-full sm:w-auto text-center"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-on-primary bg-mahogany hover:bg-primary transition-colors rounded-sm w-full sm:w-auto text-center"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-surface-container-lowest border border-outline-variant rounded-sm p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-surface-variant pb-4">
              <h3 className="font-display text-2xl uppercase text-primary">
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 p-3 bg-surface-container-low rounded-sm">
                <div>
                  <h4 className="font-bold text-sm text-on-surface uppercase">
                    Essential Cookies
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Necessary for security, authentication, and core website operation.
                  </p>
                </div>
                <span className="text-xs font-mono uppercase bg-primary/10 text-primary px-2 py-1 rounded-xs">
                  Always Active
                </span>
              </div>

              <div className="flex items-start justify-between gap-4 p-3 border border-outline-variant/40 rounded-sm">
                <div>
                  <h4 className="font-bold text-sm text-on-surface uppercase">
                    Analytics Cookies
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Helps us measure site performance and visitor interactions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      analytics: e.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 rounded-xs border-outline text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-start justify-between gap-4 p-3 border border-outline-variant/40 rounded-sm">
                <div>
                  <h4 className="font-bold text-sm text-on-surface uppercase">
                    Marketing Cookies
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Used to deliver relevant announcements and tailored content.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      marketing: e.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4 rounded-xs border-outline text-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-surface-variant pt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant border border-outline-variant hover:bg-surface-container rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-on-primary bg-primary hover:bg-primary-container rounded-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
