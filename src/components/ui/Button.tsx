import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-container",
  secondary:
    "border border-[rgba(196,198,210,0.5)] bg-transparent text-on-surface-variant hover:bg-surface-container",
};

/** Shared class string so both a real <button> and a styled <Link> (e.g. "Tạo bài viết") can look identical. */
export function buttonVariants(variant: ButtonVariant = "primary"): string {
  return `inline-flex items-center justify-center gap-2 rounded px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button className={`${buttonVariants(variant)} ${className}`} {...props} />
  );
}
