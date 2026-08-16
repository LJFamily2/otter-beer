"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";

interface SelectOption {
  value: string;
  label: string;
}

/**
 * Dropdown select — a custom-rendered listbox, NOT a native <select>. A
 * native <select>'s trigger can be styled with CSS, but its options popup
 * is drawn by the browser/OS and can't be restyled from HTML/CSS at all —
 * that's what showed up as the plain gray browser dropdown this replaces.
 * Closes on outside click, Escape, or picking an option; Up/Down + Enter
 * navigate while open.
 * AI agents: customize via props (label, options, placeholder, error,
 * value/defaultValue, onChange), not by editing this file's markup. See
 * docs/component-library.md for the full prop reference.
 */
interface SelectProps {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  wrapperClassName?: string;
}

export function Select({
  label,
  options,
  placeholder,
  error,
  value,
  defaultValue,
  onChange,
  name,
  required,
  disabled,
  id,
  className = "",
  wrapperClassName = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedValue = value ?? internalValue;
  const selectedIndex = options.findIndex((o) => o.value === selectedValue);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function selectValue(next: string) {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
    setOpen(false);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent) {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  function handleOptionKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = options[Math.min(index + 1, options.length - 1)];
      if (next) selectValue(next.value);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = options[Math.max(index - 1, 0)];
      if (prev) selectValue(prev.value);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${wrapperClassName}`} ref={rootRef}>
      {label ? (
        <label
          htmlFor={selectId}
          className={`text-sm font-bold tracking-wide ${error ? "text-error" : "text-on-surface"}`}
        >
          {label}
          {required ? <span className="text-error"> *</span> : null}
        </label>
      ) : null}
      <div className="relative">
        <button
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleTriggerKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex w-full cursor-pointer items-center justify-between rounded-sm border bg-surface-container-lowest px-[17px] py-[13px] text-left text-base shadow-sm outline-none transition-colors focus:border-secondary-fixed-dim disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? "border-error" : "border-outline-variant"
          } ${selectedOption ? "text-on-surface" : "text-outline"} ${className}`}
        >
          <span>{selectedOption?.label ?? placeholder ?? ""}</span>
          <ChevronDownIcon
            width={18}
            height={18}
            className={`shrink-0 text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open ? (
          <ul
            role="listbox"
            tabIndex={-1}
            aria-labelledby={selectId}
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-sm border border-outline-variant/30 bg-surface-container-lowest py-1 shadow-md"
          >
            {options.map((option, index) => {
              const isSelected = option.value === selectedValue;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onClick={() => selectValue(option.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectValue(option.value);
                    } else {
                      handleOptionKeyDown(event, index);
                    }
                  }}
                  className={`cursor-pointer px-4 py-2 text-base outline-none ${
                    isSelected
                      ? "bg-primary text-on-primary"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {option.label}
                </li>
              );
            })}
          </ul>
        ) : null}
        {name ? <input type="hidden" name={name} value={selectedValue} /> : null}
      </div>
      {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
    </div>
  );
}
