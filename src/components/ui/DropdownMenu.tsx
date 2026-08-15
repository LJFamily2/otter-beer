"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface DropdownMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  dividerBefore?: boolean;
}

/**
 * Click-triggered dropdown panel (user menu, action menu) — closes on
 * outside click or Escape.
 * AI agents: customize via props (trigger, header, items), not by editing
 * this file's markup. See docs/component-library.md for the full prop
 * reference.
 */
export function DropdownMenu({
  trigger,
  header,
  items,
  className = "",
}: {
  trigger: ReactNode;
  header?: { title: string; subtitle?: string };
  items: DropdownMenuItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button type="button" onClick={() => setOpen((prev) => !prev)} aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 w-56 rounded border border-outline-variant/30 bg-surface-container-lowest py-2 shadow-md"
        >
          {header ? (
            <div className="border-b border-outline-variant/20 px-4 py-3">
              <p className="text-sm font-bold text-on-surface">{header.title}</p>
              {header.subtitle ? <p className="text-xs text-on-surface-variant">{header.subtitle}</p> : null}
            </div>
          ) : null}
          <ul className="py-1">
            {items.map((item) => {
              const content = (
                <span
                  className={`flex items-center gap-3 px-4 py-2 text-base ${
                    item.danger ? "text-error" : "text-on-surface-variant"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </span>
              );
              return (
                <li key={item.label} className={item.dividerBefore ? "mt-1 border-t border-outline-variant/20 pt-1" : ""}>
                  {item.href ? (
                    <Link href={item.href} className="block no-underline" role="menuitem" onClick={() => setOpen(false)}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      className="block w-full text-left"
                      onClick={() => {
                        item.onClick?.();
                        setOpen(false);
                      }}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
