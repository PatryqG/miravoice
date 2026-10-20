import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useApp } from "@/lib/store";
import type { Actor, Appearance, LoreEntry, TimelineEvent, Video, VideoCategory } from "@/types";
import { DEFAULT_APPEARANCE } from "@/data";
import { Badge, ErrorNote, Modal, SuccessNote } from "@/components/ui";
import { HeroGlyph, Icon, type IconName } from "@/components/Icons";
import { ADMIN_SESSION_MINUTES, formatNumber, makeId, safeExternalUrl, safeHex, safeImageUrl } from "@/lib/security";
import { cn } from "@/utils/cn";

type AdminTab = "wyglad" | "wideo" | "lore" | "aktorzy" | "historia" | "strona" | "dane";

const adminTabs: { id: AdminTab; label: string; icon: IconName }[] = [
  { id: "wyglad", label: "Wygląd", icon: "palette" },
  { id: "wideo", label: "Wideo", icon: "video" },
  { id: "lore", label: "Lore", icon: "butterfly" },
  { id: "aktorzy", label: "Aktorzy", icon: "users" },
  { id: "historia", label: "Historia", icon: "clock" },
  { id: "strona", label: "O nas i treści", icon: "book" },
  { id: "dane", label: "Dane i audyt", icon: "shield" },
];

const glyphs = ["ladybug", "cat", "butterfly", "fox", "bee", "turtle", "snake", "peacock", "kwami", "creation", "destruction", "illusion", "protection", "artifact", "book", "order"];

const presets: { name: string; description: string; colors: Pick<Appearance, "brand" | "brand2" | "accent" | "accentInk" | "bg" | "surface" | "ink" | "muted" | "line" | "mode"> }[] = [
  { name: "Zielone graffiti", description: "Domyślny klimat MiraVoice", colors: { brand: "#0c3b2e", brand2: "#175844", accent: "#c8f169", accentInk: "#16220d", bg: "#f4f7ef", surface: "#ffffff", ink: "#10231b", muted: "#63736a", line: "#dfe8d9", mode: "jasny" } },
  { name: "Nocny ogród", description: "Ciemny, kinowy motyw", colors: { brand: "#14281f", brand2: "#2c5b40", accent: "#d6ff72", accentInk: "#14210c", bg: "#0b1511", surface: "#15231c", ink: "#ecf5e9", muted: "#9bb2a4", line: "#2a3c32", mode: "ciemny" } },
  { name: "Kremowy fanzine", description: "Papier, tusz i dużo powietrza", colors: { brand: "#253c2f", brand2: "#4b6b46", accent: "#f0c75e", accentInk: "#2b2105", bg: "#f7f2e4", surface: "#fffaf0", ink: "#222a20", muted: "#7a7b68", line: "#e6ddc7", mode: "kremowy" } },
  { name: "Neonowy motyl", description: "Odważny, twórczy kontrast", colors: { brand: "#2b1a42", brand2: "#5130a1", accent: "#c8f169", accentInk: "#1b2a0c", bg: "#f7f3ff", surface: "#ffffff", ink: "#241a36", muted: "#756687", line: "#e6daf5", mode: "jasny" } },
];

const emptyVideo = () => ({
  id: "", title: "", description: "", category: "Analizy" as VideoCategory,
  duration: "00:00", thumbnail: "", videoUrl: "", channelId: "", official: true, episode: "",
});

const emptyActor = () => ({ id: "", name: "", role: "", character: "", bio: "", image: "", city: "", tags: "" });

const emptyHistory = (): TimelineEvent => ({ id: "", year: "", era: "", title: "", description: "", accent: false });

const defaultLore = (): LoreEntry => ({
  id: "", name: "", category: "Bohaterowie", kwami: "", power: "", holder: "",
  description: "", quote: "", color: "#0c3b2e", accent: "#e8f7d8", glyph: "artifact", first: "", danger: 3,
});

function AdminImage({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [message, setMessage] = useState("");
  const upload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 650_000) { setMessage("Maks. 650 KB lub użyj linku."); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") { onChange(reader.result); setMessage(file.name); } };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        {value ? <img src={value} alt="" className="h-16 w-24 shrink-0 rounded-lg border border-[var(--line)] object-cover" /> : <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--line)] text-[var(--muted)]"><Icon name="upload" size={17} /></span>}
        <div className="min-w-0 flex-1">
          <input className="field !py-2 text-[10px]" value={value.startsWith("data:") ? "Obraz wgrany lokalnie" : value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" aria-label={label} />
          <label className="mt-1 inline-flex cursor-pointer items-center gap-1 rounded-full border border-[var(--line)] px-2 py-1 text-[8.5px] font-bold text-[var(--brand)] hover:border-[var(--brand)]"><Icon name="upload" size={10} /> Wgraj obraz<input type="file" accept="image/*" className="hidden" onChange={upload} /></label>
          <p className="mt-0.5 truncate text-[8px] text-[var(--muted)]">{message || "Link https lub plik do 650 KB."}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminPage() {
  const {
    adminSession, adminAttempts, adminLockLeft, adminLogin, adminLogout, touchAdminSession,
    content, data, adminSetAppearance, adminUpdateContent, adminUpsertVideo, adminDeleteVideo,
    adminUpsertLore, adminDeleteLore, adminUpsertActor, adminDeleteActor,
    adminUpsertHistory, adminDeleteHistory, exportContent, importContent, resetDemo, notify, navigate,
  } = useApp();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<AdminTab>("wyglad");
  const [remaining, setRemaining] = useState(ADMIN_SESSION_MINUTES * 60);
  const [draft, setDraft] = useState<Appearance>(content.appearance);
  const [appearanceError, setAppearanceError] = useState("");
  const [appearanceSaved, setAppearanceSaved] = useState(true);

  const [videoModal, setVideoModal] = useState(false);
  const [videoForm, setVideoForm] = useState(emptyVideo());
  const [videoError, setVideoError] = useState("");
  const [loreModal, setLoreModal] = useState(false);
  const [loreForm, setLoreForm] = useState<LoreEntry>(defaultLore());
  const [loreError, setLoreError] = useState("");
  const [actorModal, setActorModal] = useState(false);
  const [actorForm, setActorForm] = useState(emptyActor());
  const [actorError, setActorError] = useState("");
  const [historyModal, setHistoryModal] = useState(false);
  const [historyForm, setHistoryForm] = useState<TimelineEvent>(emptyHistory());
  const [historyError, setHistoryError] = useState("");
  const [about, setAbout] = useState({
    aboutTitle: content.aboutTitle, aboutBody: content.aboutBody, mission: content.mission, email: content.email,
  });
  const [importError, setImportError] = useState("");

  useEffect(() => {
    if (!adminSession) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((adminSession.expiresAt - Date.now()) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [adminSession]);

  useEffect(() => {
    setDraft(content.appearance);
  }, [content.appearance]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setLoginError("");
    const result = await adminLogin(login, password);
    setBusy(false);
    if (!result.ok) {
      setLoginError(result.error ?? "Logowanie nie powiodło się.");
      setPassword("");
    } else {
      setLogin("");
      setPassword("");
    }
  };

  const setA = <K extends keyof Appearance>(key: K, value: Appearance[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setAppearanceSaved(false);
  };

  const applyPreset = (preset: (typeof presets)[number]) => {
    setDraft((prev) => ({ ...prev, ...preset.colors }));
    setAppearanceSaved(false);
    setAppearanceError("");
  };

  const saveAppearance = () => {
    if (!safeImageUrl(draft.heroImage, true)) {
      setAppearanceError("Zdjęcie hero musi być bezpiecznym adresem https lub wgranym obrazem.");
      return;
    }
    if (draft.siteName.trim().length < 2) {
      setAppearanceError("Nazwa aplikacji musi mieć min. 2 znaki.");
      return;
    }
    const safeDraft: Appearance = {
      ...draft,
      siteName: draft.siteName.slice(0, 32),
      tagline: draft.tagline.slice(0, 50),
      heroTitle: draft.heroTitle.slice(0, 120),
      heroSubtitle: draft.heroSubtitle.slice(0, 300),
      heroBadge: draft.heroBadge.slice(0, 50),
      heroPrimaryCta: draft.heroPrimaryCta.slice(0, 40),
      announcement: draft.announcement.slice(0, 180),
      brand: safeHex(draft.brand, DEFAULT_APPEARANCE.brand),
      brand2: safeHex(draft.brand2, DEFAULT_APPEARANCE.brand2),
      accent: safeHex(draft.accent, DEFAULT_APPEARANCE.accent),
      accentInk: safeHex(draft.accentInk, DEFAULT_APPEARANCE.accentInk),
      bg: safeHex(draft.bg, DEFAULT_APPEARANCE.bg),
      surface: safeHex(draft.surface, DEFAULT_APPEARANCE.surface),
      ink: safeHex(draft.ink, DEFAULT_APPEARANCE.ink),
      muted: safeHex(draft.muted, DEFAULT_APPEARANCE.muted),
      line: safeHex(draft.line, DEFAULT_APPEARANCE.line),
    };
    adminSetAppearance(safeDraft, "Zaktualizowano wygląd i branding aplikacji");
    touchAdminSession();
    setDraft(safeDraft);
    setAppearanceError("");
    setAppearanceSaved(true);
    notify("Wygląd aplikacji został zapisany lokalnie.");
  };

  const resetAppearance = () => {
    setDraft(DEFAULT_APPEARANCE);
    setAppearanceSaved(false);
    setAppearanceError("");
    notify("Przywrócono domyślne wartości w podglądzie. Zapisz, aby je zastosować.", "info");
  };

  const downloadConfig = () => {
    const blob = new Blob([exportContent()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "miravoice-konfiguracja.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Konfiguracja wyeksportowana.");
    touchAdminSession();
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const result = importContent(reader.result);
      setImportError(result.ok ? "" : result.error ?? "Import nie powiódł się.");
      if (result.ok) touchAdminSession();
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const openVideo = (video?: Video) => {
    if (video) {
      setVideoForm({ id: video.id, title: video.title, description: video.description, category: video.category, duration: video.duration, thumbnail: video.thumbnail, videoUrl: video.videoUrl ?? "", channelId: video.channelId, official: Boolean(video.official), episode: video.episode ?? "" });
    } else {
      setVideoForm({ ...emptyVideo(), channelId: content.channels[0]?.id ?? "" });
    }
    setVideoError("");
    setVideoModal(true);
  };

  const saveVideo = (e: FormEvent) => {
    e.preventDefault();
    const channel = content.channels.find((c) => c.id === videoForm.channelId);
    const thumb = safeImageUrl(videoForm.thumbnail, true);
    if (videoForm.title.trim().length < 5) { setVideoError("Tytuł musi mieć min. 5 znaków."); return; }
    if (!thumb) { setVideoError("Miniatura musi być bezpiecznym linkiem https lub wgranym obrazem."); return; }
    if (!channel) { setVideoError("Wybierz kanał publikacji."); return; }
    const safeVideoUrl = videoForm.videoUrl.trim() ? safeExternalUrl(videoForm.videoUrl) : null;
    if (videoForm.videoUrl.trim() && !safeVideoUrl) {
      setVideoError("Adres wideo musi być poprawnym linkiem http(s).");
      return;
    }
    const existing = content.videos.find((v) => v.id === videoForm.id);
    const video: Video = {
      id: existing?.id ?? makeId("v"),
      title: videoForm.title.trim().slice(0, 100),
      description: videoForm.description.trim().slice(0, 800),
      category: videoForm.category,
      duration: videoForm.duration || "00:00",
      views: existing?.views ?? 0,
      likes: existing?.likes ?? 0,
      date: existing?.date ?? new Date().toISOString(),
      thumbnail: thumb,
      channelId: channel.id,
      channelName: channel.name,
      videoUrl: safeVideoUrl ?? undefined,
      official: videoForm.official,
      episode: videoForm.episode || undefined,
    };
    adminUpsertVideo(video);
    touchAdminSession();
    notify(existing ? "Wideo zaktualizowane." : "Nowe wideo dodane do biblioteki.");
    setVideoModal(false);
  };

  const saveLore = (e: FormEvent) => {
    e.preventDefault();
    if (loreForm.name.trim().length < 2) { setLoreError("Nazwa musi mieć min. 2 znaki."); return; }
    if (loreForm.description.trim().length < 10) { setLoreError("Opis musi mieć min. 10 znaków."); return; }
    adminUpsertLore({ ...loreForm, id: loreForm.id || makeId("l"), name: loreForm.name.slice(0, 50), description: loreForm.description.slice(0, 800), quote: loreForm.quote.slice(0, 180) });
    touchAdminSession();
    notify("Wpis lore zapisany.");
    setLoreModal(false);
  };

  const saveActor = (e: FormEvent) => {
    e.preventDefault();
    if (actorForm.name.trim().length < 3) { setActorError("Imię i nazwisko musi mieć min. 3 znaki."); return; }
    if (!safeImageUrl(actorForm.image, true)) { setActorError("Zdjęcie musi być bezpiecznym linkiem https lub wgranym obrazem."); return; }
    const actor: Actor = {
      id: actorForm.id || makeId("a"), name: actorForm.name.slice(0, 50), role: actorForm.role.slice(0, 60),
      character: actorForm.character.slice(0, 50), bio: actorForm.bio.slice(0, 700), image: actorForm.image,
      city: actorForm.city.slice(0, 40), tags: actorForm.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6),
    };
    adminUpsertActor(actor);
    touchAdminSession();
    notify("Profil aktora zapisany.");
    setActorModal(false);
  };

  const saveHistory = (e: FormEvent) => {
    e.preventDefault();
    if (historyForm.title.trim().length < 3 || !historyForm.year.trim()) { setHistoryError("Uzupełnij rok i tytuł wydarzenia."); return; }
    adminUpsertHistory({ ...historyForm, id: historyForm.id || makeId("t"), year: historyForm.year.slice(0, 30), era: historyForm.era.slice(0, 30), title: historyForm.title.slice(0, 100), description: historyForm.description.slice(0, 600) });
    touchAdminSession();
    notify("Wydarzenie zapisane.");
    setHistoryModal(false);
  };

  if (!adminSession) {
    return (
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] shadow-xl">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <div className="relative hidden overflow-hidden bg-[var(--brand)] p-7 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="graffiti-dots absolute inset-0 opacity-20" />
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[30px] border-[var(--accent)] opacity-20" />
            <div className="relative"><span className="font-marker text-xl text-[var(--accent)]">miravoice</span><h1 className="mt-4 font-display text-3xl font-extrabold leading-tight">Za kulisami.<br />Pełna kontrola.</h1><p className="mt-3 max-w-xs text-xs leading-relaxed text-white/60">Panel treści, wyglądu i bezpieczeństwa. Zmiany zapisują się w tej przeglądarce i są natychmiast widoczne.</p></div>
            <div className="relative space-y-2">
              {["Edycja całego wyglądu aplikacji", "Dodawanie i usuwanie wideo", "Lore, aktorzy i historia w Twoich rękach"].map((x) => <div key={x} className="flex items-center gap-2 text-[10px] font-medium text-white/70"><Icon name="checkCircle" size={13} className="text-[var(--accent)]" /> {x}</div>)}
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur"><Icon name="shield" size={16} className="shrink-0 text-[var(--accent)]" /><p className="text-[9px] leading-relaxed text-white/65">Sesja wygasa po 20 minutach. Login i hasło są weryfikowane jako skróty SHA-256 — nie są wyświetlane.</p></div>
            </div>
          </div>
          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-[var(--accent)]"><Icon name="lock" size={18} /></span><div><h2 className="font-display text-lg font-extrabold">Panel administratora</h2><p className="text-[9px] text-[var(--muted)]">Dostęp tylko dla administratorów</p></div></div>
            <form onSubmit={handleLogin} className="mt-5 space-y-3">
              <div><label className="label" htmlFor="admin-login">Login administratora</label><input id="admin-login" type="text" className="field" autoComplete="username" spellCheck={false} autoCapitalize="none" maxLength={64} value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Wpisz login" required /></div>
              <div><label className="label" htmlFor="admin-password">Hasło</label><input id="admin-password" type="password" className="field" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              {loginError && <ErrorNote>{loginError}</ErrorNote>}
              {adminLockLeft > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[10px] font-semibold text-amber-700">Zbyt wiele prób. Odblokowanie za {adminLockLeft} s.</div>}
              {adminAttempts > 0 && adminLockLeft === 0 && <p className="text-[9px] text-[var(--muted)]">Pozostałe próby przed blokadą: {5 - adminAttempts}</p>}
              <button type="submit" disabled={busy || adminLockLeft > 0} className="btn-dark w-full !py-3 text-xs disabled:opacity-50">{busy ? "Weryfikacja…" : "Wejdź do panelu"} <Icon name="arrowRight" size={14} /></button>
            </form>
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-dashed border-[var(--line)] bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface))] p-3">
              <Icon name="lock" size={14} className="mt-0.5 shrink-0 text-[var(--brand)]" />
              <p className="text-[9.5px] leading-relaxed text-[var(--muted)]">Dane logowania administratora nie są wyświetlane w aplikacji. Login i hasło są weryfikowane jako zaszyfrowane skróty — skontaktuj się z właścicielem projektu, jeśli potrzebujesz dostępu.</p>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--brand)] p-3 text-white"><Icon name="alert" size={15} className="mt-0.5 shrink-0 text-[var(--accent)]" /><p className="text-[9px] leading-relaxed text-white/65">Wersja frontendowa: nie używaj tu prawdziwego hasła. Produkcyjnie logowanie i uprawnienia muszą być weryfikowane przez serwer.</p></div>
            <button type="button" onClick={() => navigate("security")} className="mt-3 flex w-full items-center justify-center gap-1 text-[9px] font-bold text-[var(--brand-2)] hover:underline">Dowiedz się więcej o bezpieczeństwie <Icon name="arrowUpRight" size={10} /></button>
          </div>
        </div>
      </div>
    );
  }

  const activeTab = adminTabs.find((t) => t.id === tab);
  const timeoutText = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[var(--radius)] bg-[#071d16] p-4 text-white sm:p-5">
        <div className="graffiti-dots absolute inset-0 opacity-15" />
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[22px] border-[var(--accent)] opacity-15" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-ink)]"><Icon name="shield" size={20} /></span>
            <div><h1 className="font-display text-xl font-extrabold leading-tight">Panel administratora</h1><p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9px] text-white/55"><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> sesja aktywna</span><span>· wygasa za {timeoutText}</span><span>· {data.audit.length} wpisów audytu</span></p></div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate("home")} className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-2 text-[9px] font-bold hover:bg-white/10"><Icon name="eye" size={12} /> Podgląd</button>
            <button type="button" onClick={adminLogout} className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-[9px] font-bold hover:bg-white/15"><Icon name="logout" size={12} /> Wyloguj</button>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-[10px] leading-relaxed text-amber-800">
        <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
        <div><strong>Tryb lokalny:</strong> zmiany są natychmiast widoczne w aplikacji i zapisywane w tej przeglądarce. Inni użytkownicy ich nie zobaczą, dopóki nie podłączysz backendu (np. Supabase) i prawdziwego logowania. Konfigurację możesz wyeksportować w zakładce „Dane i audyt”.</div>
      </div>

      <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-1">
        {adminTabs.map((item) => (
          <button key={item.id} type="button" onClick={() => { setTab(item.id); touchAdminSession(); }} className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold transition sm:flex-1 sm:justify-center", tab === item.id ? "bg-[var(--brand)] text-white" : "text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))]")}>
            <Icon name={item.icon} size={13} /> {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        <div><h2 className="font-display text-lg font-extrabold">{activeTab?.label}</h2><p className="text-[9px] text-[var(--muted)]">Zmiany są zapisywane w pamięci lokalnej. Pamiętaj o eksporcie kopii.</p></div>
        <Badge tone="soft"><Icon name="lock" size={10} /> uprawnienia administratora</Badge>
      </div>

      {tab === "wyglad" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <section className="card p-4 sm:p-5">
              <h3 className="font-display text-base font-extrabold">Presety klimatu</h3>
              <p className="text-[10px] text-[var(--muted)]">Wybierz punkt startowy, a potem dopasuj każdy detal.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {presets.map((preset) => (
                  <button key={preset.name} type="button" onClick={() => applyPreset(preset)} className="rounded-xl border border-[var(--line)] p-2.5 text-left transition hover:border-[var(--brand)] hover:shadow-sm">
                    <div className="flex gap-1">{["brand", "accent", "bg", "surface"].map((k) => <span key={k} className="h-4 w-4 rounded-full border border-black/10" style={{ background: preset.colors[k as keyof typeof preset.colors] }} />)}</div>
                    <p className="mt-2 text-[10px] font-extrabold">{preset.name}</p>
                    <p className="text-[8px] text-[var(--muted)]">{preset.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="card p-4 sm:p-5">
              <h3 className="font-display text-base font-extrabold">Tożsamość marki</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><label className="label" htmlFor="a-site">Nazwa aplikacji</label><input id="a-site" className="field" maxLength={32} value={draft.siteName} onChange={(e) => setA("siteName", e.target.value)} /></div>
                <div><label className="label" htmlFor="a-tag">Tagline pod logo</label><input id="a-tag" className="field" maxLength={50} value={draft.tagline} onChange={(e) => setA("tagline", e.target.value)} /></div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><label className="label" htmlFor="a-badge">Etykieta hero</label><input id="a-badge" className="field" maxLength={50} value={draft.heroBadge} onChange={(e) => setA("heroBadge", e.target.value)} /></div>
                <div><label className="label" htmlFor="a-cta">Tekst głównego przycisku</label><input id="a-cta" className="field" maxLength={40} value={draft.heroPrimaryCta} onChange={(e) => setA("heroPrimaryCta", e.target.value)} /></div>
              </div>
              <div className="mt-3"><label className="label" htmlFor="a-title">Nagłówek hero</label><textarea id="a-title" className="field min-h-[62px] resize-none font-display text-base font-bold" maxLength={120} value={draft.heroTitle} onChange={(e) => setA("heroTitle", e.target.value)} /></div>
              <div className="mt-3"><label className="label" htmlFor="a-sub">Opis hero</label><textarea id="a-sub" className="field min-h-[64px] resize-none text-xs" maxLength={300} value={draft.heroSubtitle} onChange={(e) => setA("heroSubtitle", e.target.value)} /></div>
              <div className="mt-3"><AdminImage label="Zdjęcie hero" value={draft.heroImage} onChange={(value) => setA("heroImage", value)} /></div>
              <div className="mt-3"><label className="label" htmlFor="a-ann">Pasek ogłoszenia</label><textarea id="a-ann" className="field min-h-[52px] resize-none text-xs" maxLength={180} value={draft.announcement} onChange={(e) => setA("announcement", e.target.value)} placeholder="Zostaw puste, aby ukryć pasek" /></div>
            </section>

            <section className="card p-4 sm:p-5">
              <h3 className="font-display text-base font-extrabold">Kolory interfejsu</h3>
              <p className="text-[10px] text-[var(--muted)]">Kolor tekstu i tła jest sprawdzany pod kątem czytelności. Używaj hexów, np. #175844.</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {([
                  ["brand", "Główny zielony"], ["brand2", "Zieleń pomocnicza"], ["accent", "Akcent / CTA"],
                  ["bg", "Tło aplikacji"], ["surface", "Karty i powierzchnie"], ["ink", "Główny tekst"],
                ] as [keyof Appearance, string][]).map(([key, title]) => (
                  <div key={key}>
                    <label className="label">{title}</label>
                    <div className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1">
                      <input type="color" value={safeHex(String(draft[key]), "#000000")} onChange={(e) => setA(key, e.target.value as Appearance[typeof key])} className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0" aria-label={title} />
                      <input className="min-w-0 flex-1 bg-transparent px-0.5 font-mono text-[10px] outline-none" maxLength={7} value={String(draft[key])} onChange={(e) => setA(key, e.target.value as Appearance[typeof key])} aria-label={`Kod koloru ${title}`} />
                    </div>
                  </div>
                ))}
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-[10px] font-bold text-[var(--brand-2)]">Zaawansowana paleta (tekst pomocniczy, obramowania)</summary>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {([
                    ["muted", "Tekst pomocniczy"], ["line", "Obramowania"], ["accentInk", "Tekst na akcencie"],
                  ] as [keyof Appearance, string][]).map(([key, title]) => (
                    <div key={key}>
                      <label className="label">{title}</label>
                      <div className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] p-1"><input type="color" value={safeHex(String(draft[key]), "#000000")} onChange={(e) => setA(key, e.target.value as Appearance[typeof key])} className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0" /><input className="min-w-0 flex-1 bg-transparent font-mono text-[9px] outline-none" maxLength={7} value={String(draft[key])} onChange={(e) => setA(key, e.target.value as Appearance[typeof key])} /></div>
                    </div>
                  ))}
                </div>
              </details>
            </section>

            <section className="card p-4 sm:p-5">
              <h3 className="font-display text-base font-extrabold">Forma i typografia</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><label className="label" htmlFor="a-font">Font nagłówków</label><select id="a-font" className="field" value={draft.headingFont} onChange={(e) => setA("headingFont", e.target.value as Appearance["headingFont"])}><option value="Bricolage Grotesque">Bricolage Grotesque</option><option value="Space Grotesk">Space Grotesk</option><option value="Permanent Marker">Permanent Marker (graffiti)</option></select></div>
                <div><label className="label" htmlFor="a-mode">Motyw bazowy</label><select id="a-mode" className="field" value={draft.mode} onChange={(e) => setA("mode", e.target.value as Appearance["mode"])}><option value="jasny">Jasny</option><option value="kremowy">Kremowy</option><option value="ciemny">Ciemny</option></select></div>
              </div>
              <div className="mt-3">
                <label className="label" htmlFor="a-radius">Zaokrąglenie rogów: {draft.radius}px</label>
                <input id="a-radius" type="range" min={0} max={32} value={draft.radius} onChange={(e) => setA("radius", Number(e.target.value))} className="w-full accent-[var(--brand)]" />
                <div className="flex justify-between text-[8px] text-[var(--muted)]"><span>Ostre</span><span>Miękkie</span><span>Bardzo okrągłe</span></div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--line)] px-3 py-2.5"><div><p className="text-[11px] font-bold">Tekstura graffiti</p><p className="text-[9px] text-[var(--muted)]">Delikatne ziarno i kropki na tłach.</p></div><button type="button" role="switch" aria-checked={draft.graffiti} onClick={() => setA("graffiti", !draft.graffiti)} className={cn("relative h-6 w-11 rounded-full transition", draft.graffiti ? "bg-[var(--brand)]" : "bg-[var(--line)]")} aria-label="Tekstura graffiti"><span className={cn("absolute top-0.5 h-5 w-5 rounded-full transition", draft.graffiti ? "left-[22px] bg-[var(--accent)]" : "left-0.5 bg-white shadow")} /></button></div>
            </section>
          </div>

          <aside className="space-y-3 xl:sticky xl:top-[86px] xl:self-start">
            <div className="card overflow-hidden">
              <div className="relative h-[230px] p-4 text-white" style={{ background: `linear-gradient(120deg, ${safeHex(draft.brand, "#0c3b2e")} 0%, ${safeHex(draft.brand, "#0c3b2e")}dd 55%, ${safeHex(draft.brand2, "#175844")} 100%)` }}>
                {draft.heroImage && <img src={safeImageUrl(draft.heroImage, true) ?? ""} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
                <div className="relative flex items-center justify-between"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15"><Icon name="butterfly" size={16} /></span><span className="font-display text-sm font-extrabold">{draft.siteName || "MiraVoice"}</span></div><span className="rounded-full bg-white/10 px-2 py-0.5 text-[7px] font-bold uppercase tracking-wider">podgląd</span></div>
                <div className="relative mt-7"><p className="text-[7px] font-extrabold uppercase tracking-widest" style={{ color: safeHex(draft.accent, "#c8f169") }}>{draft.heroBadge || "Nowość"}</p><h3 className="mt-1 font-display text-[22px] font-extrabold leading-[1.02]" style={{ fontFamily: `"${draft.headingFont}", sans-serif` }}>{draft.heroTitle || "Twój nagłówek"}</h3><p className="mt-1.5 line-clamp-2 text-[8px] leading-relaxed text-white/60">{draft.heroSubtitle}</p><span className="mt-3 inline-flex rounded-full px-3 py-1.5 text-[8px] font-extrabold" style={{ background: safeHex(draft.accent, "#c8f169"), color: safeHex(draft.accentInk, "#16220d"), borderRadius: `${Math.min(999, draft.radius)}px` }}>{draft.heroPrimaryCta || "Zobacz"}</span></div>
              </div>
              <div className="p-3" style={{ background: safeHex(draft.bg, "#f4f7ef") }}>
                <div className="rounded-xl p-3" style={{ background: safeHex(draft.surface, "#fff"), border: `1px solid ${safeHex(draft.line, "#dfe8d9")}`, borderRadius: `${draft.radius}px` }}>
                  <div className="flex items-center gap-2"><span className="h-6 w-6 rounded-full" style={{ background: safeHex(draft.accent, "#c8f169") }} /><div><p className="text-[9px] font-extrabold" style={{ color: safeHex(draft.ink, "#10231b") }}>Przykładowa karta</p><p className="text-[7px]" style={{ color: safeHex(draft.muted, "#63736a") }}>tak zobaczą to widzowie</p></div></div>
                  <div className="mt-2 flex gap-1.5"><span className="rounded-full px-2 py-1 text-[7px] font-bold" style={{ background: safeHex(draft.brand, "#0c3b2e"), color: "#fff" }}>Subskrybuj</span><span className="rounded-full px-2 py-1 text-[7px] font-bold" style={{ background: safeHex(draft.accent, "#c8f169"), color: safeHex(draft.accentInk, "#16220d") }}>Odtwórz</span></div>
                </div>
              </div>
            </div>
            {appearanceError && <ErrorNote>{appearanceError}</ErrorNote>}
            {!appearanceSaved && <p className="flex items-center gap-1 text-[9px] font-bold text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Niezapisane zmiany w podglądzie</p>}
            <button type="button" onClick={saveAppearance} className="btn-primary w-full !py-3 text-xs"><Icon name="check" size={14} /> Zapisz i zastosuj wygląd</button>
            <div className="flex gap-2">
              <button type="button" onClick={resetAppearance} className="btn-outline flex-1 !py-2 text-[10px]"><Icon name="refresh" size={12} /> Domyślne</button>
              <button type="button" onClick={() => setDraft(content.appearance)} className="btn-ghost flex-1 !py-2 text-[10px]">Odrzuć</button>
            </div>
            <div className="rounded-xl bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] p-3 text-[9px] leading-relaxed text-[var(--muted)]"><Icon name="info" size={12} className="mb-1 text-[var(--brand-2)]" /> Podgląd jest uproszczony. Po zapisaniu zmiany zobaczysz na całej stronie, także w panelu i na telefonie.</div>
          </aside>
        </div>
      )}

      {tab === "wideo" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] text-[var(--muted)]">{content.videos.length} materiałów w bibliotece. Jako admin możesz edytować każdy z nich.</p>
            <button type="button" onClick={() => openVideo()} className="btn-primary !py-2.5 text-[10px]"><Icon name="plus" size={13} /> Dodaj wideo</button>
          </div>
          <div className="space-y-2">
            {content.videos.map((video) => (
              <div key={video.id} className="card flex flex-wrap items-center gap-3 p-2.5">
                <img src={video.thumbnail} alt="" className="h-14 w-24 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="line-clamp-1 text-xs font-extrabold">{video.title}</p><p className="mt-0.5 text-[9px] text-[var(--muted)]">{video.channelName} · {video.category} · {video.duration} · {formatNumber(video.views)} wyśw.</p><div className="mt-1 flex gap-1">{video.official && <Badge tone="accent" className="!px-1.5 !py-0.5 !text-[7px]">MiraVoice</Badge>}{video.episode && <Badge tone="outline" className="!px-1.5 !py-0.5 !text-[7px]">{video.episode}</Badge>}</div></div>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => openVideo(video)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--brand)]" aria-label={`Edytuj ${video.title}`}><Icon name="edit" size={13} /></button>
                  <button type="button" onClick={() => { if (window.confirm("Usunąć ten materiał z całej aplikacji?")) { adminDeleteVideo(video.id); touchAdminSession(); notify("Wideo usunięte.", "info"); } }} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:border-red-200 hover:text-red-600" aria-label={`Usuń ${video.title}`}><Icon name="trash" size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "lore" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] text-[var(--muted)]">{content.lore.length} wpisów. Edytuj opisy, kolory i moce bohaterów.</p><button type="button" onClick={() => { setLoreForm(defaultLore()); setLoreError(""); setLoreModal(true); }} className="btn-primary !py-2.5 text-[10px]"><Icon name="plus" size={13} /> Dodaj wpis</button></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {content.lore.map((entry) => (
              <div key={entry.id} className="card flex items-center gap-2.5 p-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: entry.accent, color: entry.color }}><HeroGlyph glyph={entry.glyph} size={22} color={entry.color} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-extrabold">{entry.name}</p><p className="truncate text-[8px] text-[var(--muted)]">{entry.category} · {entry.power}</p></div>
                <button type="button" onClick={() => { setLoreForm(entry); setLoreError(""); setLoreModal(true); }} className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)]" aria-label={`Edytuj ${entry.name}`}><Icon name="edit" size={12} /></button>
                <button type="button" onClick={() => { if (window.confirm(`Usunąć wpis „${entry.name}”?`)) { adminDeleteLore(entry.id); touchAdminSession(); notify("Wpis lore usunięty.", "info"); } }} className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-red-600" aria-label={`Usuń ${entry.name}`}><Icon name="trash" size={12} /></button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "aktorzy" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] text-[var(--muted)]">{content.actors.length} profili. Zmieniaj zdjęcia, role i opisy.</p><button type="button" onClick={() => { setActorForm(emptyActor()); setActorError(""); setActorModal(true); }} className="btn-primary !py-2.5 text-[10px]"><Icon name="plus" size={13} /> Dodaj aktora</button></div>
          <div className="grid gap-2 sm:grid-cols-2">
            {content.actors.map((actor) => (
              <div key={actor.id} className="card flex items-center gap-2.5 p-2.5">
                <img src={actor.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-extrabold">{actor.name}</p><p className="truncate text-[8px] text-[var(--muted)]">{actor.role} · {actor.character}</p></div>
                <button type="button" onClick={() => { setActorForm({ id: actor.id, name: actor.name, role: actor.role, character: actor.character, bio: actor.bio, image: actor.image, city: actor.city, tags: actor.tags.join(", ") }); setActorError(""); setActorModal(true); }} className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)]" aria-label={`Edytuj ${actor.name}`}><Icon name="edit" size={12} /></button>
                <button type="button" onClick={() => { if (window.confirm(`Usunąć profil ${actor.name}?`)) { adminDeleteActor(actor.id); touchAdminSession(); notify("Profil usunięty.", "info"); } }} className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-red-600" aria-label={`Usuń ${actor.name}`}><Icon name="trash" size={12} /></button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "historia" && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] text-[var(--muted)]">{content.history.length} wydarzeń na osi czasu.</p><button type="button" onClick={() => { setHistoryForm(emptyHistory()); setHistoryError(""); setHistoryModal(true); }} className="btn-primary !py-2.5 text-[10px]"><Icon name="plus" size={13} /> Dodaj wydarzenie</button></div>
          <div className="space-y-2">
            {content.history.map((event) => (
              <div key={event.id} className="card flex flex-wrap items-center gap-3 p-3">
                <span className="rounded-full bg-[var(--brand)] px-2.5 py-1 text-[8px] font-extrabold text-[var(--accent)]">{event.year}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-extrabold">{event.title}</p><p className="line-clamp-1 text-[9px] text-[var(--muted)]">{event.era} · {event.description}</p></div>
                <button type="button" onClick={() => { setHistoryForm({ ...event, accent: Boolean(event.accent) }); setHistoryError(""); setHistoryModal(true); }} className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)]" aria-label={`Edytuj ${event.title}`}><Icon name="edit" size={12} /></button>
                <button type="button" onClick={() => { if (window.confirm("Usunąć to wydarzenie?")) { adminDeleteHistory(event.id); touchAdminSession(); notify("Wydarzenie usunięte.", "info"); } }} className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-red-600" aria-label={`Usuń ${event.title}`}><Icon name="trash" size={12} /></button>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "strona" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={(e) => { e.preventDefault(); adminUpdateContent({ aboutTitle: about.aboutTitle.slice(0, 150), aboutBody: about.aboutBody.slice(0, 900), mission: about.mission.slice(0, 400), email: about.email.slice(0, 100) }, "Zaktualizowano treść strony O nas"); touchAdminSession(); notify("Treść strony O nas zapisana."); }} className="card space-y-3 p-4 sm:p-5">
            <h3 className="font-display text-base font-extrabold">O nas i treści statyczne</h3>
            <div><label className="label" htmlFor="ab-title">Nagłówek strony O nas</label><input id="ab-title" className="field" maxLength={150} value={about.aboutTitle} onChange={(e) => setAbout({ ...about, aboutTitle: e.target.value })} /></div>
            <div><label className="label" htmlFor="ab-body">Krótki opis</label><textarea id="ab-body" className="field min-h-[90px] resize-none" maxLength={900} value={about.aboutBody} onChange={(e) => setAbout({ ...about, aboutBody: e.target.value })} /></div>
            <div><label className="label" htmlFor="ab-mission">Misja (wyróżniona)</label><textarea id="ab-mission" className="field min-h-[72px] resize-none" maxLength={400} value={about.mission} onChange={(e) => setAbout({ ...about, mission: e.target.value })} /></div>
            <div><label className="label" htmlFor="ab-email">Kontakt e-mail</label><input id="ab-email" type="email" className="field" maxLength={100} value={about.email} onChange={(e) => setAbout({ ...about, email: e.target.value })} /></div>
            <button type="submit" className="btn-primary !py-2.5 text-[11px]"><Icon name="check" size={13} /> Zapisz treści</button>
          </form>
          <aside className="space-y-3">
            <div className="card p-4"><h3 className="text-xs font-extrabold">Szybkie skróty</h3><div className="mt-2 space-y-1.5">{["Pasek ogłoszenia", "Zdjęcie hero", "Kolory marki"].map((x) => <button key={x} type="button" onClick={() => setTab("wyglad")} className="flex w-full items-center justify-between rounded-lg bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] px-2.5 py-2 text-[10px] font-bold">{x} <Icon name="chevronRight" size={11} /></button>)}</div></div>
            <div className="rounded-[var(--radius)] bg-[var(--brand)] p-4 text-white"><Icon name="palette" size={18} className="text-[var(--accent)]" /><h3 className="mt-1.5 font-display text-base font-extrabold">Cały wygląd w jednym miejscu</h3><p className="mt-1 text-[10px] leading-relaxed text-white/60">Kolor, typografia, tło, zaokrąglenia, hero i teksty. Każdy element aplikacji używa wspólnych zmiennych.</p><button type="button" onClick={() => setTab("wyglad")} className="mt-2 text-[10px] font-bold text-[var(--accent)] underline underline-offset-2">Otwórz edytor wyglądu</button></div>
          </aside>
        </div>
      )}

      {tab === "dane" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="card p-4 sm:p-5">
              <h3 className="font-display text-base font-extrabold">Kopia i publikacja treści</h3>
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">Wersja demo nie ma serwera. Wyeksportuj plik JSON z całą konfiguracją lub wgraj kopię, by przenieść treści na inne urządzenie.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={downloadConfig} className="btn-primary !py-2.5 text-[10px]"><Icon name="download" size={13} /> Eksportuj konfigurację</button>
                <label className="btn-outline cursor-pointer !py-2.5 text-[10px]"><Icon name="upload" size={13} /> Importuj JSON<input type="file" accept="application/json,.json" className="hidden" onChange={handleImport} /></label>
              </div>
              {importError && <div className="mt-3"><ErrorNote>{importError}</ErrorNote></div>}
              <div className="mt-4 rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface))] p-3">
                <p className="text-[10px] font-extrabold">Aby publikować dla wszystkich:</p>
                <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-[9px] leading-relaxed text-[var(--muted)]"><li>Załóż projekt backendu (np. Supabase) i tabele treści.</li><li>Dodaj prawdziwą autoryzację administratora i magazyn obrazów.</li><li>Zastąp lokalny zapis żądaniem API z tokenem sesji.</li><li>Dodaj migracje i podgląd zmian przed publikacją.</li></ol>
              </div>
            </div>
            <div className="card p-4 sm:p-5">
              <h3 className="font-display text-base font-extrabold">Ostatnie działania administratora</h3>
              {data.audit.length === 0 ? <p className="mt-2 text-[10px] text-[var(--muted)]">Brak wpisów. Wykonaj pierwszą zmianę, aby zobaczyć audyt.</p> : <div className="mt-2 divide-y divide-[var(--line)]">{data.audit.map((entry) => <div key={entry.id} className="flex items-start gap-2 py-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" /><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold">{entry.action}</p><p className="text-[8px] text-[var(--muted)]">{new Date(entry.at).toLocaleString("pl-PL")}</p></div></div>)}</div>}
            </div>
          </div>
          <aside className="space-y-3">
            <div className="card p-4"><h3 className="flex items-center gap-1.5 text-xs font-extrabold"><Icon name="shield" size={14} /> Stan zabezpieczeń</h3><div className="mt-2 space-y-2">{["Hasło admina: hash SHA-256", `Limit prób: ${adminAttempts}/5`, "Sesja: 20 min, sessionStorage", "Walidacja URL i treści: aktywna", "Backend produkcyjny: do podłączenia"].map((x) => <p key={x} className="flex items-center gap-1.5 text-[9px] text-[var(--muted)]"><Icon name="check" size={11} className="shrink-0 text-[var(--brand-2)]" /> {x}</p>)}</div><button type="button" onClick={() => navigate("security")} className="btn-outline mt-3 w-full !py-2 text-[9px]">Centrum bezpieczeństwa <Icon name="arrowUpRight" size={11} /></button></div>
            <div className="card p-4"><h3 className="text-xs font-extrabold">Dane lokalne</h3><p className="mt-1 text-[9px] leading-relaxed text-[var(--muted)]">{content.videos.length} wideo · {content.lore.length} wpisów lore · {content.channels.length} kanałów · {data.users.length} kont. Wszystko w localStorage tej przeglądarki.</p></div>
            <div className="rounded-[var(--radius)] border border-red-200 bg-red-50 p-4"><h3 className="flex items-center gap-1.5 text-xs font-extrabold text-red-700"><Icon name="alert" size={14} /> Strefa demo</h3><p className="mt-1 text-[9px] leading-relaxed text-red-600">Przywrócenie usuwa wszystkie zmiany admina i konta demo z tej przeglądarki. Operacja jest nieodwracalna.</p><button type="button" onClick={() => { if (window.confirm("Przywrócić całą aplikację do stanu początkowego?")) resetDemo(); }} className="mt-2 w-full rounded-full bg-red-600 py-2 text-[9px] font-bold text-white transition hover:bg-red-700">Przywróć dane demo</button></div>
            <div className="flex items-start gap-1.5 rounded-xl bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] p-3 text-[8.5px] leading-relaxed text-[var(--muted)]"><Icon name="info" size={11} className="mt-0.5 shrink-0" /> Sesja sessionStorage wygasa automatycznie. Aktywność w panelu odnawia licznik.</div>
          </aside>
        </div>
      )}

      <Modal open={videoModal} onClose={() => setVideoModal(false)} title={videoForm.id ? "Edytuj wideo" : "Dodaj wideo"} wide>
        <form onSubmit={saveVideo} className="space-y-3 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="av-title">Tytuł *</label><input id="av-title" className="field" required maxLength={100} value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} /></div>
            <div><label className="label" htmlFor="av-channel">Kanał *</label><select id="av-channel" className="field" value={videoForm.channelId} onChange={(e) => setVideoForm({ ...videoForm, channelId: e.target.value })}>{content.channels.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.handle})</option>)}</select></div>
          </div>
          <div><label className="label" htmlFor="av-desc">Opis</label><textarea id="av-desc" className="field min-h-[70px] resize-none" maxLength={800} value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="label" htmlFor="av-cat">Kategoria</label><select id="av-cat" className="field" value={videoForm.category} onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value as VideoCategory })}>{["Odcinki", "Analizy", "Fan film", "Kulisy", "Lore"].map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label" htmlFor="av-dur">Czas trwania</label><input id="av-dur" className="field" maxLength={10} value={videoForm.duration} onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })} /></div>
            <div><label className="label" htmlFor="av-ep">Odcinek (opcjonalnie)</label><input id="av-ep" className="field" maxLength={20} value={videoForm.episode} onChange={(e) => setVideoForm({ ...videoForm, episode: e.target.value })} placeholder="S06 · E01" /></div>
          </div>
          <AdminImage label="Miniatura *" value={videoForm.thumbnail} onChange={(value) => setVideoForm({ ...videoForm, thumbnail: value })} />
          <div><label className="label" htmlFor="av-url">Bezpieczny adres wideo (opcjonalnie)</label><input id="av-url" className="field" value={videoForm.videoUrl} onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })} placeholder="https://…/film.mp4" /></div>
          <label className="flex items-center gap-2 text-[10px] font-semibold"><input type="checkbox" checked={videoForm.official} onChange={(e) => setVideoForm({ ...videoForm, official: e.target.checked })} className="accent-[var(--brand)]" /> Oznacz jako oficjalny materiał MiraVoice</label>
          {videoError && <ErrorNote>{videoError}</ErrorNote>}
          <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-3"><button type="button" onClick={() => setVideoModal(false)} className="btn-ghost !py-2 text-[10px]">Anuluj</button><button type="submit" className="btn-primary !py-2.5 text-[10px]"><Icon name="check" size={13} /> Zapisz wideo</button></div>
        </form>
      </Modal>

      <Modal open={loreModal} onClose={() => setLoreModal(false)} title={loreForm.id ? "Edytuj wpis lore" : "Nowy wpis lore"} wide>
        <form onSubmit={saveLore} className="space-y-3 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="al-name">Nazwa *</label><input id="al-name" className="field" required maxLength={50} value={loreForm.name} onChange={(e) => setLoreForm({ ...loreForm, name: e.target.value })} /></div>
            <div><label className="label" htmlFor="al-cat">Kategoria</label><select id="al-cat" className="field" value={loreForm.category} onChange={(e) => setLoreForm({ ...loreForm, category: e.target.value as LoreEntry["category"] })}>{["Bohaterowie", "Kwami", "Moce", "Artefakty"].map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label" htmlFor="al-kwami">Kwami</label><input id="al-kwami" className="field" maxLength={30} value={loreForm.kwami} onChange={(e) => setLoreForm({ ...loreForm, kwami: e.target.value })} /></div>
            <div><label className="label" htmlFor="al-power">Moc</label><input id="al-power" className="field" maxLength={50} value={loreForm.power} onChange={(e) => setLoreForm({ ...loreForm, power: e.target.value })} /></div>
            <div><label className="label" htmlFor="al-holder">Nosiciel</label><input id="al-holder" className="field" maxLength={60} value={loreForm.holder} onChange={(e) => setLoreForm({ ...loreForm, holder: e.target.value })} /></div>
            <div><label className="label" htmlFor="al-first">Pierwsze pojawienie</label><input id="al-first" className="field" maxLength={60} value={loreForm.first} onChange={(e) => setLoreForm({ ...loreForm, first: e.target.value })} /></div>
          </div>
          <div><label className="label" htmlFor="al-desc">Opis *</label><textarea id="al-desc" className="field min-h-[90px] resize-none" maxLength={800} value={loreForm.description} onChange={(e) => setLoreForm({ ...loreForm, description: e.target.value })} /></div>
          <div><label className="label" htmlFor="al-quote">Cytat</label><input id="al-quote" className="field" maxLength={180} value={loreForm.quote} onChange={(e) => setLoreForm({ ...loreForm, quote: e.target.value })} /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="label" htmlFor="al-color">Kolor główny</label><div className="flex gap-1"><input id="al-color" type="color" className="h-10 w-12 rounded-lg border border-[var(--line)] bg-transparent p-1" value={safeHex(loreForm.color, "#0c3b2e")} onChange={(e) => setLoreForm({ ...loreForm, color: e.target.value })} /><input className="field !py-2 font-mono text-[10px]" value={loreForm.color} onChange={(e) => setLoreForm({ ...loreForm, color: e.target.value })} /></div></div>
            <div><label className="label" htmlFor="al-glyph">Symbol</label><select id="al-glyph" className="field" value={loreForm.glyph} onChange={(e) => setLoreForm({ ...loreForm, glyph: e.target.value })}>{glyphs.map((g) => <option key={g}>{g}</option>)}</select></div>
            <div><label className="label" htmlFor="al-danger">Poziom mocy</label><select id="al-danger" className="field" value={loreForm.danger ?? 3} onChange={(e) => setLoreForm({ ...loreForm, danger: Number(e.target.value) as LoreEntry["danger"] })}>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}</select></div>
          </div>
          {loreError && <ErrorNote>{loreError}</ErrorNote>}
          <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3"><span className="flex items-center gap-1.5 text-[9px] text-[var(--muted)]"><span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: loreForm.accent, color: loreForm.color }}><HeroGlyph glyph={loreForm.glyph} size={18} color={loreForm.color} /></span> podgląd symbolu</span><div className="flex gap-2"><button type="button" onClick={() => setLoreModal(false)} className="btn-ghost !py-2 text-[10px]">Anuluj</button><button type="submit" className="btn-primary !py-2.5 text-[10px]">Zapisz wpis</button></div></div>
        </form>
      </Modal>

      <Modal open={actorModal} onClose={() => setActorModal(false)} title={actorForm.id ? "Edytuj aktora" : "Dodaj aktora"}>
        <form onSubmit={saveActor} className="space-y-3 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label" htmlFor="aa-name">Imię i nazwisko *</label><input id="aa-name" className="field" required maxLength={50} value={actorForm.name} onChange={(e) => setActorForm({ ...actorForm, name: e.target.value })} /></div>
            <div><label className="label" htmlFor="aa-role">Rola</label><input id="aa-role" className="field" maxLength={60} value={actorForm.role} onChange={(e) => setActorForm({ ...actorForm, role: e.target.value })} /></div>
            <div><label className="label" htmlFor="aa-char">Postać</label><input id="aa-char" className="field" maxLength={50} value={actorForm.character} onChange={(e) => setActorForm({ ...actorForm, character: e.target.value })} /></div>
            <div><label className="label" htmlFor="aa-city">Miasto</label><input id="aa-city" className="field" maxLength={40} value={actorForm.city} onChange={(e) => setActorForm({ ...actorForm, city: e.target.value })} /></div>
          </div>
          <div><label className="label" htmlFor="aa-bio">Bio</label><textarea id="aa-bio" className="field min-h-[76px] resize-none" maxLength={700} value={actorForm.bio} onChange={(e) => setActorForm({ ...actorForm, bio: e.target.value })} /></div>
          <div><label className="label" htmlFor="aa-tags">Tagi (oddzielone przecinkiem)</label><input id="aa-tags" className="field" value={actorForm.tags} onChange={(e) => setActorForm({ ...actorForm, tags: e.target.value })} placeholder="Dubbing, Teatr, MiraVoice" /></div>
          <AdminImage label="Zdjęcie *" value={actorForm.image} onChange={(value) => setActorForm({ ...actorForm, image: value })} />
          {actorError && <ErrorNote>{actorError}</ErrorNote>}
          <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-3"><button type="button" onClick={() => setActorModal(false)} className="btn-ghost !py-2 text-[10px]">Anuluj</button><button type="submit" className="btn-primary !py-2.5 text-[10px]">Zapisz profil</button></div>
        </form>
      </Modal>

      <Modal open={historyModal} onClose={() => setHistoryModal(false)} title={historyForm.id ? "Edytuj wydarzenie" : "Dodaj wydarzenie"}>
        <form onSubmit={saveHistory} className="space-y-3 p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label" htmlFor="ah-year">Rok / okres *</label><input id="ah-year" className="field" required maxLength={30} value={historyForm.year} onChange={(e) => setHistoryForm({ ...historyForm, year: e.target.value })} /></div>
            <div><label className="label" htmlFor="ah-era">Epoka</label><input id="ah-era" className="field" maxLength={30} value={historyForm.era} onChange={(e) => setHistoryForm({ ...historyForm, era: e.target.value })} placeholder="np. Legenda" /></div>
          </div>
          <div><label className="label" htmlFor="ah-title">Tytuł *</label><input id="ah-title" className="field" required maxLength={100} value={historyForm.title} onChange={(e) => setHistoryForm({ ...historyForm, title: e.target.value })} /></div>
          <div><label className="label" htmlFor="ah-desc">Opis</label><textarea id="ah-desc" className="field min-h-[100px] resize-none" maxLength={600} value={historyForm.description} onChange={(e) => setHistoryForm({ ...historyForm, description: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-[10px] font-semibold"><input type="checkbox" checked={Boolean(historyForm.accent)} onChange={(e) => setHistoryForm({ ...historyForm, accent: e.target.checked })} className="accent-[var(--brand)]" /> Wyróżnij wydarzenie na osi</label>
          {historyError && <ErrorNote>{historyError}</ErrorNote>}
          <div className="flex justify-end gap-2 border-t border-[var(--line)] pt-3"><button type="button" onClick={() => setHistoryModal(false)} className="btn-ghost !py-2 text-[10px]">Anuluj</button><button type="submit" className="btn-primary !py-2.5 text-[10px]">Zapisz wydarzenie</button></div>
        </form>
      </Modal>

      <SuccessNote>Jesteś w panelu demo. Zmiany dotyczą tej przeglądarki. Pamiętaj o kopii w zakładce „Dane i audyt”.</SuccessNote>
    </div>
  );
}