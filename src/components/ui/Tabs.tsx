"use client";

import { useState } from "react";

export type TabsVariant = "underline" | "pill";

export interface TabItem {
  value: string;
  label: string;
}

/**
 * Tab switcher — underline or pill-toggle visual style, controlled (pass
 * `value`+`onChange`) or uncontrolled (pass `defaultValue`).
 * AI agents: customize via props (items, variant, value/defaultValue,
 * onChange), not by editing this file's markup. See
 * docs/component-library.md for the full prop reference.
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  variant = "underline",
  className = "",
}: {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: TabsVariant;
  className?: string;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.value);
  const activeValue = value ?? internalValue;

  function select(next: string) {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  }

  if (variant === "pill") {
    return (
      <div className={`inline-flex gap-0 rounded bg-surface-container-high p-1 ${className}`}>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => select(item.value)}
            className={`rounded-sm px-6 py-2 text-xs font-medium ${
              activeValue === item.value
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-8 border-b border-outline-variant/30 ${className}`}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => select(item.value)}
          className={`pb-3.5 text-sm font-bold tracking-wide ${
            activeValue === item.value
              ? "border-b-2 border-secondary-container text-primary"
              : "text-on-surface-variant"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
