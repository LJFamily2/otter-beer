import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "./icons";

interface SelectOption {
  value: string;
  label: string;
}

/**
 * Dropdown select — label + options list, native <select> under a styled
 * shell for full accessibility/keyboard support.
 * AI agents: customize via props (label, options, placeholder, error,
 * ...rest native select attributes), not by editing this file's markup.
 * See docs/component-library.md for the full prop reference.
 */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  wrapperClassName?: string;
}

export function Select({
  label,
  options,
  placeholder,
  error,
  id,
  className = "",
  wrapperClassName = "",
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`flex flex-col gap-2 ${wrapperClassName}`}>
      {label ? (
        <label
          htmlFor={selectId}
          className={`text-sm font-bold tracking-wide ${error ? "text-error" : "text-on-surface"}`}
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-sm border bg-surface-container-lowest px-[17px] py-[13px] pr-10 text-base text-on-surface shadow-sm outline-none transition-colors focus:border-secondary-fixed-dim disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? "border-error" : "border-outline-variant"
          } ${className}`}
          aria-invalid={Boolean(error)}
          defaultValue={props.defaultValue ?? (placeholder ? "" : undefined)}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          width={18}
          height={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
      </div>
      {error ? <p className="text-xs font-medium text-error">{error}</p> : null}
    </div>
  );
}
