import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "home" | "play" | "video" | "sparkles" | "butterfly" | "users" | "book" | "community"
  | "info" | "search" | "bell" | "chevronRight" | "chevronLeft" | "chevronDown" | "menu" | "x"
  | "check" | "lock" | "shield" | "settings" | "palette" | "film" | "heart" | "bookmark"
  | "share" | "comment" | "send" | "user" | "logout" | "google" | "eye" | "clock" | "plus"
  | "trash" | "edit" | "arrowUpRight" | "playCircle" | "volume" | "pause" | "sun" | "moon"
  | "download" | "upload" | "alert" | "checkCircle" | "external" | "more" | "grid" | "list"
  | "instagram" | "youtube" | "mail" | "link" | "refresh" | "filter" | "crown" | "bellOff"
  | "arrowRight" | "logo";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  filled?: boolean;
}

const paths: Record<string, ReactNode> = {
  home: <><path d="m3 10.5 9-7.5 9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></>,
  play: <path d="M8 5.5v13l10-6.5-10-6.5Z" />,
  video: <><rect x="2.5" y="5" width="14" height="14" rx="3" /><path d="m16.5 10 4-2v8l-4-2" /></>,
  sparkles: <><path d="m12 3 1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /><path d="m5 14 .7 1.8L7.5 16.5l-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7L5 14Z" /></>,
  butterfly: <><path d="M12 7.2C9.7 3.3 3.3 3 3.5 8.1c.1 3 3.1 5.2 7.4 5.5" /><path d="M12 7.2c2.3-3.9 8.7-4.2 8.5.9-.1 3-3.1 5.2-7.4 5.5" /><path d="M12 7.2v10.3" /><path d="M12 13.7c-2.2.1-4.8 1.2-5.2 3.4-.5 2.4 3.2 3.4 5.2.4" /><path d="M12 13.7c2.2.1 4.8 1.2 5.2 3.4.5 2.4-3.2 3.4-5.2.4" /><path d="M9.5 5 8 3.2M14.5 5 16 3.2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /><path d="M8 7h8M8 11h5" /></>,
  community: <><circle cx="12" cy="12" r="9" /><path d="M3.5 9h17M3.5 15h17" /><path d="M12 3c2.4 2.5 3.5 5.5 3.5 9s-1.1 6.5-3.5 9c-2.4-2.5-3.5-5.5-3.5-9S9.6 5.5 12 3Z" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  bellOff: <><path d="M13.7 21a2 2 0 0 1-3.4 0M18 8a6 6 0 0 0-9.3-5M6 8c0 7-3 7-3 9h14M3 3l18 18" /></>,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m5 12 4 4L19 6" />,
  lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z" /></>,
  palette: <><circle cx="12" cy="12" r="9" /><path d="M12 3c-5 0-9 4-9 9s4 9 9 9c2.8 0 3-1.5 2-3.1-1.2-1.9.5-3.9 2.7-3.9H19c1.2 0 2-1 2-2.2C21 6.7 17 3 12 3Z" /><circle cx="7.5" cy="10" r=".8" fill="currentColor" /><circle cx="10" cy="6.8" r=".8" fill="currentColor" /><circle cx="14" cy="6.8" r=".8" fill="currentColor" /><circle cx="17" cy="9.5" r=".8" fill="currentColor" /></>,
  film: <><rect x="2.5" y="4" width="19" height="16" rx="2" /><path d="M7 4v16M17 4v16M2.5 9h4.5M2.5 15h4.5M17 9h4.5M17 15h4.5" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z" />,
  bookmark: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" /></>,
  comment: <path d="M21 15a3 3 0 0 1-3 3H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9Z" />,
  send: <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  google: <path d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.2h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.4 3-7.5Z M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.2v2.6A10 10 0 0 0 12 22Z M6.5 14a6 6 0 0 1 0-3.9V7.5H3.2a10 10 0 0 0 0 9L6.5 14Z M12 6.1c1.5 0 2.8.5 3.9 1.5l2.8-2.8A10 10 0 0 0 3.2 7.5l3.3 2.6A5.9 5.9 0 0 1 12 6.1Z" />, 
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></>,
  arrowUpRight: <><path d="M7 17 17 7M7 7h10v10" /></>,
  arrowRight: <><path d="M4 12h16M14 6l6 6-6 6" /></>,
  playCircle: <><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4V8Z" /></>,
  volume: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>,
  pause: <><path d="M8 4v16M16 4v16" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  download: <><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 21h14" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 21h14" /></>,
  alert: <><path d="M12 3 2 21h20L12 3Z" /><path d="M12 9v5M12 17h.01" /></>,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  external: <><path d="M15 3h6v6M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" fill="currentColor" /><circle cx="3.5" cy="12" r="1" fill="currentColor" /><circle cx="3.5" cy="18" r="1" fill="currentColor" /></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></>,
  youtube: <><path d="M21 12s0-4-1-5-8-1-8-1-7 0-8 1-1 5-1 5 0 4 1 5 8 1 8 1 7 0 8-1 1-5 1-5Z" /><path d="m10 9 5 3-5 3V9Z" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" /></>,
  refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M6.1 9a7 7 0 0 1 11.3-2L20 12M4 12l2.6 5A7 7 0 0 0 18 15" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />,
  crown: <><path d="m3 7 4 4 5-7 5 7 4-4-2 12H5L3 7Z" /><path d="M6 22h12" /></>,
  logo: <></>,
};

export function Icon({ name, size = 20, filled = false, className, ...props }: IconProps) {
  const solid = filled ? "fill-current" : "fill-none";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g className={solid}>{paths[name] ?? paths.sparkles}</g>
    </svg>
  );
}

export function Logo({ size = 42, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <rect width="48" height="48" rx="13" fill="var(--brand)" />
      <path
        d="M12 33V18l6-4 6 4v15"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29 17c4-3.5 8-3.4 8.4 0-3.4 1.4-4.8 4.2-4.3 7.8 3.4-.6 5.3 1.7 3.6 4.4-2.4 3.8-7.3 3.6-11 .4"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="28" cy="38" r="2.4" fill="var(--accent)" />
    </svg>
  );
}

export function HeroGlyph({ glyph, size = 56, color = "currentColor" }: { glyph: string; size?: number; color?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (glyph) {
    case "ladybug":
      return <svg {...common}><ellipse cx="32" cy="36" rx="17" ry="20" /><path d="M32 17c-6-5-13-4-13 2 0 4 5 7 13 8M32 17c6-5 13-4 13 2 0 4-5 7-13 8" /><path d="M32 27v28M22 30l-5-4M42 30l5-4M22 41l-6 2M42 41l6 2" /><circle cx="25" cy="35" r="2" fill={color} /><circle cx="39" cy="35" r="2" fill={color} /><circle cx="28" cy="45" r="2" fill={color} /><circle cx="36" cy="45" r="2" fill={color} /></svg>;
    case "cat":
      return <svg {...common}><path d="M14 26 12 9l14 9h12l14-9-2 17c2 5 2 11-1 16-4 7-11 10-18 10S18 49 13 42c-3-5-3-11 1-16Z" /><path d="M23 34h5M36 34h5M28 41l4 2 4-2M22 40l-8-2M22 45l-8 4M42 40l8-2M42 45l8 4" /></svg>;
    case "butterfly":
      return <svg {...common}><path d="M32 24C26 14 12 13 12 24c0 7 8 12 17 13" /><path d="M32 24c6-10 20-11 20 0 0 7-8 12-17 13" /><path d="M32 24v20" /><path d="M32 37c-5 0-11 3-11 8 0 6 8 6 11 0M32 37c5 0 11 3 11 8 0 6-8 6-11 0" /><path d="M27 18 23 13M37 18l4-5" /></svg>;
    case "fox":
      return <svg {...common}><path d="M13 15 9 5l13 7h20l13-7-4 10c5 5 7 11 5 18-3 11-12 19-24 19S11 44 8 33c-2-7 0-13 5-18Z" /><path d="M23 34h5M36 34h5M28 43c2 2 6 2 8 0M27 38l5 2 5-2M17 40l-6 2M47 40l6 2" /></svg>;
    case "bee":
      return <svg {...common}><ellipse cx="32" cy="38" rx="15" ry="19" /><path d="M22 25c-7-3-12-9-8-14 4-4 11 0 14 6M42 25c7-3 12-9 8-14-4-4-11 0-14 6" /><path d="M18 31h28M18 41h28M32 22v34" /></svg>;
    case "turtle":
      return <svg {...common}><path d="M7 43c0-14 11-24 25-24s25 10 25 24H7Z" /><path d="M32 19v24M17 27l8 16M47 27l-8 16M10 35h44" /><circle cx="32" cy="30" r="5" /><path d="M7 47h50" /></svg>;
    case "snake":
      return <svg {...common}><path d="M46 13c0-5-5-7-9-5s-5 7-1 9 12 2 14 9-2 14-10 15-15-3-21 1-5 12 4 14" /><circle cx="34" cy="15" r="1.5" fill={color} /><path d="M42 9l5-4M22 57l-4 3" /></svg>;
    case "peacock":
      return <svg {...common}><circle cx="32" cy="28" r="12" /><circle cx="32" cy="28" r="4" /><path d="M32 16c-2-6 2-11 8-9M32 16c2-6-2-11-8-9M22 34c-7 8-2 18 6 23M42 34c7 8 2 18-6 23M23 44c-6 9 2 14 9 15M41 44c6 9-2 14-9 15" /></svg>;
    case "creation":
      return <svg {...common}><path d="m32 6 5 17 17 5-17 5-5 17-5-17-17-5 17-5 5-17Z" /><circle cx="49" cy="13" r="3" /><circle cx="13" cy="49" r="2" /></svg>;
    case "destruction":
      return <svg {...common}><path d="m34 5-22 33h17l-3 21 24-35H33l1-19Z" /></svg>;
    case "illusion":
      return <svg {...common}><path d="M6 32s9-15 26-15 26 15 26 15-9 15-26 15S6 32 6 32Z" /><circle cx="32" cy="32" r="7" /><path d="M10 10l8 8M46 10l-8 8" /></svg>;
    case "protection":
      return <svg {...common}><path d="M32 5 53 13v17c0 14-9 24-21 29C20 54 11 44 11 30V13L32 5Z" /><path d="m22 31 7 7 14-15" /></svg>;
    case "artifact":
      return <svg {...common}><circle cx="32" cy="32" r="17" /><circle cx="32" cy="32" r="8" /><path d="M32 15v9M32 40v9M15 32h9M40 32h9" /><circle cx="32" cy="32" r="2.5" fill={color} /></svg>;
    case "book":
      return <svg {...common}><path d="M11 11c8-4 14-3 21 2 7-5 13-6 21-2v39c-8-4-14-3-21 2-7-5-13-6-21-2V11Z" /><path d="M32 13v39M19 21c4-1 6-1 9 1M19 30c4-1 6-1 9 1M36 22c3-2 5-2 9-1M36 31c3-2 5-2 9-1" /></svg>;
    case "order":
      return <svg {...common}><circle cx="32" cy="32" r="24" /><path d="m32 13 5 14 15 5-15 5-5 14-5-14-15-5 15-5 5-14Z" /></svg>;
    default:
      return <svg {...common}><circle cx="32" cy="32" r="20" /><circle cx="26" cy="28" r="2.5" fill={color} /><circle cx="38" cy="28" r="2.5" fill={color} /><path d="M24 39c4 4 12 4 16 0M24 20c2-4 5-5 8-5s6 1 8 5" /></svg>;
  }
}
