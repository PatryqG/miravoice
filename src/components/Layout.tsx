import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "@/lib/store";
import type { Page } from "@/types";
import { Icon, Logo, type IconName } from "@/components/Icons";
import { Avatar } from "@/components/ui";
import { AuthModal } from "@/components/AuthModal";
import { NotificationsPanel, SearchModal } from "@/components/Notifications";
import { cn } from "@/utils/cn";

interface NavItem {
  page: Page;
  label: string;
  icon: IconName;
  tag?: string;
}

const mainNav: NavItem[] = [
  { page: "home", label: "Odkrywaj", icon: "home" },
  { page: "videos", label: "Wideo", icon: "video" },
  { page: "actors", label: "Aktorzy", icon: "users" },
  { page: "history", label: "Historia", icon: "clock" },
  { page: "lore", label: "Miraculous", icon: "butterfly", tag: "lore" },
  { page: "community", label: "Społeczność", icon: "community" },
  { page: "about", label: "O nas", icon: "info" },
];

const workspaceNav: NavItem[] = [
  { page: "studio", label: "Studio twórcy", icon: "film" },
  { page: "admin", label: "Panel admina", icon: "lock" },
  { page: "security", label: "Bezpieczeństwo", icon: "shield" },
];

function NavLink({
  item,
  active,
  onClick,
  compact = false,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl text-left transition",
        compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-[13px]",
        active
          ? "bg-[var(--brand)] font-bold text-white shadow-[0_3px_0_#082119]"
          : "font-semibold text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))] hover:text-[var(--ink)]"
      )}
    >
      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", active ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))] text-[var(--brand-2)] group-hover:bg-[var(--surface)]")}>
        <Icon name={item.icon} size={16} />
      </span>
      <span className="flex-1">{item.label}</span>
      {item.tag && (
        <span className={cn("rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide", active ? "bg-white/20 text-white" : "bg-[var(--accent)] text-[var(--accent-ink)]")}>
          {item.tag}
        </span>
      )}
      {active && !item.tag && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
    </button>
  );
}

function DesktopSidebar() {
  const { page, navigate, content, currentUser, myChannel, setAuthOpen } = useApp();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-[var(--line)] bg-[var(--surface)] lg:flex">
      <button type="button" onClick={() => navigate("home")} className="flex items-center gap-3 px-5 pb-5 pt-6 text-left">
        <Logo size={42} />
        <span className="min-w-0">
          <span className="block truncate font-display text-[1.25rem] font-extrabold leading-none tracking-[-0.05em]">{content.appearance.siteName}</span>
          <span className="mt-1 block truncate text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{content.appearance.tagline}</span>
        </span>
      </button>

      <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface))] px-2.5 py-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand-2)] opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand-2)]" />
        </span>
        <p className="text-[10px] font-bold text-[var(--brand)]">Sezon 6 · fandom online</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3" aria-label="Nawigacja główna">
        <p className="mb-1.5 px-3 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Odkrywaj</p>
        <div className="space-y-0.5">
          {mainNav.map((item) => (
            <NavLink key={item.page} item={item} active={page === item.page} onClick={() => navigate(item.page)} />
          ))}
        </div>
        <p className="mb-1.5 mt-5 px-3 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Twoja przestrzeń</p>
        <div className="space-y-0.5">
          {workspaceNav.map((item) => (
            <NavLink key={item.page} item={item} active={page === item.page} onClick={() => navigate(item.page)} />
          ))}
        </div>
      </nav>

      <div className="border-t border-[var(--line)] p-3">
        {currentUser ? (
          <button type="button" onClick={() => navigate("profile")} className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))]">
            <Avatar src={currentUser.avatar} name={currentUser.name} size={34} ring />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-extrabold">{currentUser.name}</span>
              <span className="block truncate text-[10px] text-[var(--muted)]">{myChannel ? myChannel.handle : "fan · bez kanału"}</span>
            </span>
            <Icon name="chevronRight" size={14} className="text-[var(--muted)]" />
          </button>
        ) : (
          <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary w-full !py-2.5 text-xs">
            <Icon name="google" size={15} filled /> Zaloguj się
          </button>
        )}
        <p className="mt-2 px-1 text-center text-[8px] font-medium uppercase tracking-widest text-[var(--muted)]">
          {currentUser ? "Konto lokalne · demo" : "Dołącz do fandomu"}
        </p>
      </div>
    </aside>
  );
}

function Topbar({
  onSearch,
  onNotifications,
  onMenu,
}: {
  onSearch: () => void;
  onNotifications: () => void;
  onMenu: () => void;
}) {
  const { currentUser, navigate, data, setAuthOpen, content } = useApp();
  const unread = data.notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-[62px] max-w-[1500px] items-center gap-3 px-3 sm:px-5 lg:h-[70px] lg:px-8">
        <button type="button" onClick={() => navigate("home")} className="flex items-center gap-2.5 lg:hidden" aria-label="Strona główna">
          <Logo size={34} />
          <span className="font-display text-[1.15rem] font-extrabold tracking-[-0.05em]">{content.appearance.siteName}</span>
        </button>

        <button
          type="button"
          onClick={onSearch}
          className="hidden h-10 flex-1 items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-left text-xs text-[var(--muted)] transition hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--line))] md:flex lg:max-w-md"
        >
          <Icon name="search" size={16} />
          <span className="flex-1">Szukaj w lore, wideo i kanałach…</span>
          <kbd className="rounded border border-[var(--line)] bg-[color-mix(in_srgb,var(--ink)_4%,var(--surface))] px-1.5 py-0.5 text-[9px] font-bold">⌘ K</kbd>
        </button>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button type="button" onClick={onSearch} className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--brand)_7%,transparent)] hover:text-[var(--ink)] md:hidden" aria-label="Szukaj">
            <Icon name="search" size={19} />
          </button>
          <button type="button" onClick={onNotifications} className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--brand)_7%,transparent)] hover:text-[var(--ink)]" aria-label={`Powiadomienia${unread ? `, ${unread} nowych` : ""}`}>
            <Icon name="bell" size={19} />
            {unread > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[var(--bg)] bg-[var(--brand)] px-0.5 text-[8px] font-extrabold text-[var(--accent)]">{unread}</span>}
          </button>
          <span className="mx-0.5 hidden h-6 w-px bg-[var(--line)] sm:block" />
          {currentUser ? (
            <button type="button" onClick={() => navigate("profile")} className="flex items-center gap-2 rounded-full p-0.5 pr-2 transition hover:bg-[color-mix(in_srgb,var(--brand)_7%,transparent)]">
              <Avatar src={currentUser.avatar} name={currentUser.name} size={30} />
              <span className="hidden max-w-[110px] truncate text-[11px] font-bold sm:block">{currentUser.name.split(" ")[0]}</span>
              <Icon name="chevronDown" size={13} className="hidden text-[var(--muted)] sm:block" />
            </button>
          ) : (
            <button type="button" onClick={() => setAuthOpen(true)} className="hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-[11px] font-bold transition hover:border-[var(--brand)] sm:flex">
              <Icon name="google" size={13} filled /> Zaloguj
            </button>
          )}
          <button type="button" onClick={onMenu} className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[color-mix(in_srgb,var(--brand)_7%,transparent)] lg:hidden" aria-label="Menu">
            <Icon name={currentUser ? "user" : "menu"} size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const { page, navigate, currentUser, setAuthOpen } = useApp();
  const items: NavItem[] = [
    { page: "home", label: "Start", icon: "home" },
    { page: "videos", label: "Wideo", icon: "video" },
    { page: "lore", label: "Lore", icon: "butterfly" },
    { page: "community", label: "Fandom", icon: "community" },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="Nawigacja mobilna">
      <div className="mx-auto grid max-w-md grid-cols-5 px-1">
        {items.map((item) => {
          const active = page === item.page;
          return (
            <button key={item.page} type="button" onClick={() => navigate(item.page)} className={cn("relative flex flex-col items-center gap-0.5 py-2", active ? "text-[var(--brand)]" : "text-[var(--muted)]")}>
              {active && <span className="absolute top-0 h-[3px] w-7 rounded-b-full bg-[var(--accent)]" />}
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", active && "bg-[var(--brand)] text-[var(--accent)]")}><Icon name={item.icon} size={19} /></span>
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          );
        })}
        <button type="button" onClick={() => (currentUser ? navigate("profile") : setAuthOpen(true))} className={cn("relative flex flex-col items-center gap-0.5 py-2", page === "profile" ? "text-[var(--brand)]" : "text-[var(--muted)]")}>
          {page === "profile" && <span className="absolute top-0 h-[3px] w-7 rounded-b-full bg-[var(--accent)]" />}
          {currentUser ? (
            <Avatar src={currentUser.avatar} name={currentUser.name} size={28} className={page === "profile" ? "outline outline-2 outline-[var(--brand)]" : ""} />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg"><Icon name="user" size={19} /></span>
          )}
          <span className="text-[9px] font-bold">Profil</span>
        </button>
      </div>
    </nav>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate, currentUser, myChannel, setAuthOpen, signOut, page, content } = useApp();
  const go = (next: Page) => { onClose(); navigate(next); };
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu aplikacji">
      <div className="absolute inset-0 bg-[#04120d]/55 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-pop absolute inset-y-0 right-0 flex w-[88%] max-w-[350px] flex-col overflow-y-auto bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-4">
          <div className="flex items-center gap-2"><Logo size={32} /><span className="font-display font-extrabold">{content.appearance.siteName}</span></div>
          <button type="button" onClick={onClose} aria-label="Zamknij menu" className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))]"><Icon name="x" size={18} /></button>
        </div>
        <div className="p-4">
          {currentUser ? (
            <button type="button" onClick={() => go("profile")} className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--accent)_15%,var(--surface))] p-3 text-left">
              <Avatar src={currentUser.avatar} name={currentUser.name} size={42} ring />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold">{currentUser.name}</span>
                <span className="block truncate text-[10px] text-[var(--muted)]">{myChannel ? myChannel.handle : "fan bez kanału"}</span>
              </span>
              <Icon name="chevronRight" size={15} />
            </button>
          ) : (
            <button type="button" onClick={() => { onClose(); setAuthOpen(true); }} className="btn-primary mb-4 w-full !py-3 text-xs"><Icon name="google" size={15} filled /> Zaloguj się przez Google</button>
          )}
          <p className="mb-1.5 px-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Odkrywaj</p>
          <div className="space-y-0.5">
            {mainNav.map((item) => <NavLink key={item.page} item={item} active={page === item.page} onClick={() => go(item.page)} />)}
          </div>
          <p className="mb-1.5 mt-4 px-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">Twoja przestrzeń</p>
          <div className="space-y-0.5">
            {workspaceNav.map((item) => <NavLink key={item.page} item={item} active={page === item.page} onClick={() => go(item.page)} />)}
          </div>
          {currentUser && (
            <button type="button" onClick={() => { onClose(); signOut(); }} className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))]">
              <Icon name="logout" size={16} /> Wyloguj się
            </button>
          )}
          <p className="mt-5 border-t border-[var(--line)] pt-4 text-[9px] leading-relaxed text-[var(--muted)]">
            MiraVoice to niezależny projekt fanowski. Konto i treści działają lokalnie w trybie demo. Panel admina ma osobne dane dostępowe, których aplikacja nie ujawnia.
          </p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const { navigate, content } = useApp();
  return (
    <footer className="mt-12 border-t border-[var(--line)] bg-[var(--surface)] pb-24 pt-8 lg:pb-8">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5"><Logo size={34} /><span className="font-display text-lg font-extrabold">{content.appearance.siteName}</span></div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-[var(--muted)]">
              Fanowski wszechświat, w którym każdy może opowiedzieć swoją historię. Szanujemy twórców, ludzi i ich granice.
            </p>
            <div className="mt-3 flex gap-2">
              {(["instagram", "youtube", "mail"] as IconName[]).map((icon) => (
                <button key={icon} type="button" onClick={() => navigate("about")} aria-label={icon} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"><Icon name={icon} size={15} /></button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">Aplikacja</p>
            <div className="space-y-1.5">
              {[{ label: "Odkrywaj", page: "home" }, { label: "Wideo", page: "videos" }, { label: "Miraculous", page: "lore" }, { label: "Historia", page: "history" }].map((l) => (
                <button key={l.page} type="button" onClick={() => navigate(l.page as Page)} className="block text-xs font-medium text-[var(--ink)]/70 transition hover:text-[var(--brand)]">{l.label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">Fandom</p>
            <div className="space-y-1.5">
              {[{ label: "Społeczność", page: "community" }, { label: "Aktorzy", page: "actors" }, { label: "O nas", page: "about" }, { label: "Studio twórcy", page: "studio" }].map((l) => (
                <button key={l.page} type="button" onClick={() => navigate(l.page as Page)} className="block text-xs font-medium text-[var(--ink)]/70 transition hover:text-[var(--brand)]">{l.label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">Zaufanie i dane</p>
            <div className="space-y-1.5">
              {[{ label: "Bezpieczeństwo", page: "security" }, { label: "Panel administratora", page: "admin" }, { label: "Twoje konto", page: "profile" }].map((l) => (
                <button key={l.page} type="button" onClick={() => navigate(l.page as Page)} className="block text-xs font-medium text-[var(--ink)]/70 transition hover:text-[var(--brand)]">{l.label}</button>
              ))}
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--accent)_22%,var(--surface))] px-2 py-1 text-[9px] font-bold text-[var(--brand)]"><Icon name="shield" size={11} /> Tryb bezpieczny</div>
          </div>
        </div>
        <div className="mt-7 flex flex-col justify-between gap-2 border-t border-[var(--line)] pt-4 text-[9.5px] leading-relaxed text-[var(--muted)] sm:flex-row">
          <p>© 2026 {content.appearance.siteName}. Projekt fanowski, tworzony przez społeczność.</p>
          <p>Niezwiązany z oficjalnymi właścicielami marki Miraculous. Wersja demo · dane na urządzeniu.</p>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { content, page, navigate } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [page]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <DesktopSidebar />
      <div className="lg:pl-[252px]">
        <Topbar onSearch={() => setSearchOpen(true)} onNotifications={() => setNotificationsOpen(true)} onMenu={() => setMenuOpen(true)} />
        {content.appearance.announcement && announcementVisible && (
          <div className="border-b border-[var(--line)] bg-[var(--accent)] px-4 py-2 text-[var(--accent-ink)]">
            <div className="mx-auto flex max-w-[1500px] items-center gap-2 lg:px-4">
              <Icon name="sparkles" size={14} className="shrink-0" />
              <p className="min-w-0 flex-1 truncate text-[10.5px] font-bold">{content.appearance.announcement}</p>
              <button type="button" onClick={() => navigate("community")} className="hidden text-[10px] font-extrabold underline underline-offset-2 sm:block">Sprawdź</button>
              <button type="button" onClick={() => setAnnouncementVisible(false)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-black/10" aria-label="Zamknij komunikat"><Icon name="x" size={13} /></button>
            </div>
          </div>
        )}
        <main className="mx-auto max-w-[1500px] px-3 pb-24 pt-4 sm:px-5 sm:pt-6 lg:px-8 lg:pb-8">{children}</main>
        <Footer />
      </div>
      <BottomNav />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <AuthModal />
    </div>
  );
}
