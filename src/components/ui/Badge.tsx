import type { ReactNode } from "react";

export type BadgeVariant = "neutral" | "primary" | "outline" | "overlay";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: "bg-primary-fixed text-on-primary-fixed",
  neutral: "bg-surface-container-high text-on-surface",
  outline: "border border-outline-variant text-on-surface-variant",
  // Sits on top of a photo (featured/card headers) — needs its own backdrop
  // blur + translucency, distinct enough from the flat variants above.
  overlay:
    "border border-primary bg-white/85 font-bold uppercase tracking-wide text-primary backdrop-blur-[2px]",
};

/** Small pill used for post status, tags, and category labels. */
export function Badge({
  variant = "neutral",
  className = "",
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
