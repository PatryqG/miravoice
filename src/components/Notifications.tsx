import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import { timeAgo } from "@/lib/security";
import { Icon, type IconName } from "@/components/Icons";
import { EmptyState, Modal } from "@/components/ui";
import { cn } from "@/utils/cn";

const notificationIcon: Record<string, IconName> = {
  video: "playCircle",
  sub: "users",
  lore: "book",
  system: "sparkles",
};

export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, markAllNotificationsRead, clearNotifications, navigate } = useApp();
  const unread = data.notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (open) markAllNotificationsRead();
  }, [open, markAllNotificationsRead]);

  return (
    <Modal open={open} onClose={onClose} title={`Powiadomienia${unread ? ` · ${unread}` : ""}`}>
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[var(--muted)]">Aktywność kanałów i nowości w fandomie.</p>
          {data.notifications.length > 0 && (
            <button type="button" onClick={clearNotifications} className="text-[11px] font-bold text-[var(--brand-2)] hover:underline">
              Wyczyść wszystko
            </button>
          )}
        </div>
        {data.notifications.length === 0 ? (
          <EmptyState icon="bell" title="Cisza przed burzą" description="Tutaj pojawią się nowe odcinki, wpisy lore i aktywność subskrybowanych kanałów. Włącz dzwonek przy kanale, aby nic Cię nie ominęło." />
        ) : (
          <div className="space-y-2">
            {data.notifications.map((n) => (
              <div key={n.id} className={cn("flex gap-3 rounded-2xl border p-3", n.read ? "border-[var(--line)] bg-[var(--surface)]" : "border-[color-mix(in_srgb,var(--accent)_60%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))]")}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-[var(--accent)]">
                  <Icon name={notificationIcon[n.type] ?? "bell"} size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold leading-snug">{n.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">{n.body}</p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="text-[10px] font-medium text-[var(--muted)]">{timeAgo(n.time)}</span>
                    {n.target && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate("videos");
                          setTimeout(() => window.dispatchEvent(new CustomEvent("mira:open-video", { detail: { id: n.target } })), 0);
                        }}
                        className="text-[10px] font-bold text-[var(--brand-2)] hover:underline"
                      >
                        Zobacz materiał
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => { onClose(); navigate("profile"); }}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full border border-[var(--line)] py-2.5 text-xs font-bold transition hover:bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))]"
        >
          Ustawienia powiadomień <Icon name="chevronRight" size={13} />
        </button>
      </div>
    </Modal>
  );
}

interface SearchGroup {
  title: string;
  icon: IconName;
  items: { id: string; label: string; sub?: string; image?: string; onClick: () => void }[];
}

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { content, navigate, notify } = useApp();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const openVideo = (id: string) => {
    onClose();
    navigate("videos");
    setTimeout(() => window.dispatchEvent(new CustomEvent("mira:open-video", { detail: { id } })), 0);
  };

  const groups: SearchGroup[] = q.length < 2 ? [] : [
    {
      title: "Wideo",
      icon: "playCircle" as IconName,
      items: content.videos
        .filter((v) => `${v.title} ${v.category} ${v.channelName} ${v.description}`.toLowerCase().includes(q))
        .slice(0, 4)
        .map((v) => ({ id: v.id, label: v.title, sub: `${v.channelName} · ${v.category}`, image: v.thumbnail, onClick: () => openVideo(v.id) })),
    },
    {
      title: "Bohaterowie i lore",
      icon: "butterfly" as IconName,
      items: content.lore
        .filter((l) => `${l.name} ${l.power} ${l.kwami} ${l.holder} ${l.description}`.toLowerCase().includes(q))
        .slice(0, 4)
        .map((l) => ({ id: l.id, label: l.name, sub: `${l.category} · ${l.power}`, onClick: () => { onClose(); navigate("lore"); } })),
    },
    {
      title: "Aktorzy i twórcy",
      icon: "users" as IconName,
      items: content.actors
        .filter((a) => `${a.name} ${a.role} ${a.character}`.toLowerCase().includes(q))
        .slice(0, 3)
        .map((a) => ({ id: a.id, label: a.name, sub: a.role, image: a.image, onClick: () => { onClose(); navigate("actors"); } })),
    },
    {
      title: "Kanały",
      icon: "community" as IconName,
      items: content.channels
        .filter((c) => `${c.name} ${c.handle} ${c.description}`.toLowerCase().includes(q))
        .slice(0, 3)
        .map((c) => ({ id: c.id, label: c.name, sub: c.handle, image: c.avatar, onClick: () => { onClose(); navigate("community"); } })),
    },
  ].filter((g) => g.items.length > 0);

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <Modal open={open} onClose={onClose} title="Szukaj w MiraVoice" wide>
      <div className="p-4 sm:p-5">
        <div className="relative">
          <Icon name="search" size={19} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value.slice(0, 80))}
            placeholder="Szukaj odcinków, bohaterów, kanałów…"
            className="field !rounded-full !py-3.5 pl-11 pr-4 text-sm"
            aria-label="Szukaj"
          />
        </div>

        {q.length < 2 ? (
          <div className="mt-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Popularne teraz</p>
            <div className="flex flex-wrap gap-2">
              {["Biedronka", "Czarny Kot", "Kwami", "Motyl", "fan film", "teorie"].map((tag) => (
                <button key={tag} type="button" onClick={() => setQuery(tag)} className="chip hover:border-[var(--brand)]">{tag}</button>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Wideo", icon: "playCircle" as IconName, page: "videos" as const },
                { label: "Lore", icon: "butterfly" as IconName, page: "lore" as const },
                { label: "Aktorzy", icon: "users" as IconName, page: "actors" as const },
                { label: "Historia", icon: "clock" as IconName, page: "history" as const },
              ].map((item) => (
                <button key={item.label} type="button" onClick={() => { onClose(); navigate(item.page); }} className="card flex flex-col items-start gap-2 p-3 text-left transition hover:border-[var(--brand)]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_30%,var(--surface))] text-[var(--brand)]"><Icon name={item.icon} size={16} /></span>
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : total === 0 ? (
          <div className="py-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))] text-[var(--muted)]"><Icon name="search" size={22} /></span>
            <p className="mt-3 text-sm font-bold">Brak wyników dla „{query}”</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Spróbuj „Biedronka”, „kwami” albo nazwy kanału.</p>
            <button type="button" onClick={() => { notify("Nie znalazłeś? Zajrzyj do pełnego archiwum lore.", "info"); onClose(); navigate("lore"); }} className="mt-3 text-xs font-bold text-[var(--brand-2)] hover:underline">Przeglądaj całe lore</button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]"><Icon name={group.icon} size={12} /> {group.title}</p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button key={item.id} type="button" onClick={item.onClick} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))]">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_28%,var(--surface))] font-display text-sm font-extrabold text-[var(--brand)]">{item.label[0]}</span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold">{item.label}</span>
                        {item.sub && <span className="block truncate text-[10px] text-[var(--muted)]">{item.sub}</span>}
                      </span>
                      <Icon name="chevronRight" size={14} className="text-[var(--muted)]" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

export function SearchHint({ children }: { children: ReactNode }) {
  return <span className="text-[var(--muted)]">{children}</span>;
}
