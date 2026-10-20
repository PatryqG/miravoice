import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Icon, type IconName } from "@/components/Icons";

export function Avatar({
  src,
  name,
  size = 40,
  className = "",
  ring = false,
}: {
  src?: string;
  name: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    setBroken(false);
  }, [src]);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--brand)] font-bold text-[var(--accent)]",
        ring && "ring-2 ring-[var(--surface)] outline outline-2 outline-[var(--accent)]",
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
      aria-label={name}
    >
      {src && !broken ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials || <Icon name="user" size={size * 0.5} />
      )}
    </span>
  );
}

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--accent)]",
        className
      )}
      title="Kanał zweryfikowany"
    >
      <Icon name="check" size={10} strokeWidth={3} />
    </span>
  );
}

export function Badge({
  children,
  tone = "soft",
  className = "",
}: {
  children: ReactNode;
  tone?: "soft" | "brand" | "accent" | "outline" | "dark";
  className?: string;
}) {
  const tones = {
    soft: "bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))] text-[var(--brand)]",
    brand: "bg-[var(--brand)] text-white",
    accent: "bg-[var(--accent)] text-[var(--accent-ink)]",
    outline: "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]",
    dark: "bg-[var(--ink)] text-[var(--surface)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--brand-2)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] ring-1 ring-[var(--brand)]" />
            {eyebrow}
          </p>
        )}
        <h2 className="text-balance text-[1.45rem] font-extrabold leading-tight sm:text-[1.75rem]">{title}</h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: IconName;
  children?: ReactNode;
}) {
  return (
    <div className="relative mb-7 overflow-hidden rounded-[calc(var(--radius)+6px)] bg-[var(--brand)] p-6 text-white sm:p-8">
      <div className="graffiti-dots absolute inset-0 opacity-[0.18]" />
      <div className="absolute -right-12 -top-14 h-52 w-52 rounded-full border-[28px] border-[var(--accent)] opacity-20" />
      <div className="absolute bottom-[-75px] right-24 h-40 w-40 rotate-12 rounded-3xl border border-white/10" />
      <div className="relative max-w-3xl">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] backdrop-blur">
          <Icon name={icon} size={14} />
          {eyebrow}
        </span>
        <h1 className="text-balance text-3xl font-extrabold leading-[1.04] sm:text-4xl lg:text-[2.8rem]">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">{description}</p>
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
  hideHeader = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
  hideHeader?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#06150f]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Okno dialogowe"}
        className={cn(
          "animate-pop max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] border border-[var(--line)] bg-[var(--surface)] shadow-2xl sm:rounded-[28px]",
          wide ? "sm:max-w-5xl" : "sm:max-w-xl"
        )}
      >
        {!hideHeader && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] px-5 py-4 backdrop-blur">
            <h2 className="font-display text-lg font-extrabold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))] text-[var(--muted)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  icon = "sparkles",
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_40%,var(--surface))] text-[var(--brand)]">
        <Icon name={icon} size={26} />
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[var(--muted)]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
      <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function SuccessNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800">
      <Icon name="checkCircle" size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
        checked
          ? "border-[var(--brand)] bg-[var(--brand)]"
          : "border-[var(--line)] bg-[color-mix(in_srgb,var(--ink)_12%,var(--surface))]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4.5 w-4.5 rounded-full shadow-sm transition-all",
          checked ? "left-[22px] bg-[var(--accent)]" : "left-0.5 bg-white"
        )}
        style={{ height: 18, width: 18 }}
      />
    </button>
  );
}

export function Stat({ value, label, icon }: { value: string; label: string; icon?: IconName }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 font-display text-xl font-extrabold">
        {icon && <Icon name={icon} size={16} className="text-[var(--brand-2)]" />}
        {value}
      </div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</p>
    </div>
  );
}
