/**
 * Small generic stroke icons for the admin UI — plain geometric shapes, not
 * sourced from any design file, so no vector-fidelity concerns.
 */
import type { SVGProps } from "react";

function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function NewsBlogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <rect x="3" y="2.5" width="14" height="15" rx="1.5" />
      <path d="M6.5 6.5h7M6.5 10h7M6.5 13.5h4" />
    </IconBase>
  );
}

export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M8 17H4.5A1.5 1.5 0 013 15.5v-11A1.5 1.5 0 014.5 3H8" />
      <path d="M13 13.5L17 10l-4-3.5" />
      <path d="M17 10H8" />
    </IconBase>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M10 4v12M4 10h12" />
    </IconBase>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M16.5 16.5l-3.6-3.6" />
    </IconBase>
  );
}

export function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12.5 3.5l4 4L6 18H2v-4l10.5-10.5z" />
    </IconBase>
  );
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M3 5.5h14M8 5.5V3.8c0-.7.6-1.3 1.3-1.3h1.4c.7 0 1.3.6 1.3 1.3v1.7" />
      <path d="M5.5 5.5V16a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V5.5" />
      <path d="M8.3 9v5M11.7 9v5" />
    </IconBase>
  );
}
