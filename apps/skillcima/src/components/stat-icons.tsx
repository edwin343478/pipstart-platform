import type { SVGProps } from "react";

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-[18px] w-[18px] text-brand-accent"
      {...props}
    >
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 6.5V10l2.5 1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LevelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-[18px] w-[18px] text-brand-accent"
      {...props}
    >
      <path
        d="M5 15V11M10 15V7M15 15V3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-[18px] w-[18px] text-brand-accent"
      {...props}
    >
      <path
        d="M3 3h6.5L17 10.5 10.5 17 3 10.5V3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <circle cx="7" cy="7" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function SignalOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-[18px] w-[18px] text-brand-accent"
      {...props}
    >
      <path
        d="M6.5 12a5 5 0 0 1 7-4.6M9.3 8.9a2.2 2.2 0 0 1 2.9 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <circle cx="10" cy="15" r="1.1" fill="currentColor" />

      <path
        d="M3.5 3.5l13 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
