import { useEffect, useState, type ChangeEvent } from "react";
import { useApp } from "@/lib/store";
import type { VideoCategory } from "@/types";
import { SAMPLE_VIDEO, STUDIO_IMAGE, CITY_IMAGE, GRAFFITI_IMAGE } from "@/data";
import { Avatar, Badge, EmptyState, ErrorNote, PageHero, SectionHeader, VerifiedBadge } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { formatNumber } from "@/lib/security";
import { cn } from "@/utils/cn";

const videoCategories: VideoCategory[] = ["Odcinki", "Analizy", "Fan film", "Kulisy", "Lore"];

function ImageField({
  label, value, onChange, hint, previewClass = "h-16 w-24",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  previewClass?: string;
}) {
  const [fileName, setFileName] = useState("");
  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onChange("");
      return;
    }
    if (file.size > 650_000) {
      setFileName("Plik jest za duży (maks. 650 KB). Wklej link https.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
        setFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        {value ? <img src={value} alt="Podgląd" className={cn("shrink-0 rounded-lg border border-[var(--line)] object-cover", previewClass)} /> : <span className={cn("flex shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--line)] text-[var(--muted)]", previewClass)}><Icon name="upload" size={18} /></span>}
        <div className="min-w-0 flex-1 space-y-1.5">
          <input className="field !py-2 text-[11px]" value={value.startsWith("data:") ? `${fileName || "plik lokalny"} (wgrany)` : value} onChange={(e) => onChange(e.target.value)} placeholder="https://…" aria-label={label} />
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 py-1 text-[9px] font-bold text-[var(--brand)] transition hover:border-[var(--brand)]">
            <Icon name="upload" size={11} /> Wgraj plik
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={upload} />
          </label>
          <p className="text-[8.5px] leading-tight text-[var(--muted)]">{fileName && fileName.includes("za duży") ? fileName : hint ?? "Link https lub obraz do 650 KB."}</p>
        </div>
      </div>
    </div>
  );
}

export function StudioPage() {
  const {
    currentUser, myChannel, content, data, navigate, setAuthOpen,
    createChannel, updateMyChannel, addVideo, deleteVideo, notify,
  } = useApp();
  const [tab, setTab] = useState<"pulpit" | "wideo" | "ustawienia">("pulpit");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [savingChannel, setSavingChannel] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [channelForm, setChannelForm] = useState({
    name: "", handle: "", description: "", category: "Lore i analizy", avatar: "", cover: "",
  });
  const [editForm, setEditForm] = useState({ name: "", description: "", category: "", avatar: "", cover: "" });
  const [videoForm, setVideoForm] = useState({
    title: "", description: "", category: "Analizy" as VideoCategory, thumbnail: "", videoUrl: "", duration: "",
  });

  useEffect(() => {
    if (myChannel) {
      setEditForm({
        name: myChannel.name,
        description: myChannel.description,
        category: myChannel.category,
        avatar: myChannel.avatar,
        cover: myChannel.cover,
      });
    }
  }, [myChannel?.id, myChannel?.name, myChannel?.description, myChannel?.category, myChannel?.avatar, myChannel?.cover, myChannel]);

  const myVideos = myChannel ? content.videos.filter((v) => v.channelId === myChannel.id) : [];
  const totalViews = myVideos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = myVideos.reduce((sum, v) => sum + v.likes, 0);

  if (!currentUser) {
    return (
      <div className="space-y-5">
        <PageHero
          eyebrow="Studio twórcy"
          title="Miejsce, w którym Twój fandom staje się kanałem."
          description="Zaloguj się kontem demo Google, żeby utworzyć kanał, wrzucić pierwszy materiał i zbierać społeczność wokół swojej historii."
          icon="film"
        >
          <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary !px-4 !py-2.5 text-[11px]"><Icon name="google" size={14} filled /> Zaloguj się, aby zacząć</button>
        </PageHero>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { step: "01", title: "Konto i kanał", text: "Jedno kliknięcie, nazwa kanału i jesteś w grze. Bez formularzy na trzy strony." },
            { step: "02", title: "Pierwszy materiał", text: "Dodaj miniaturę, opis i adres wideo. Materiał od razu pojawi się w bibliotece." },
            { step: "03", title: "Twoi widzowie", text: "Udostępnij kanał, zbieraj subskrypcje i włączaj obserwującym powiadomienia." },
          ].map((item) => (
            <div key={item.step} className="card p-4">
              <span className="font-display text-2xl font-extrabold text-[var(--line)]">{item.step}</span>
              <h2 className="mt-1 text-sm font-extrabold">{item.title}</h2>
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-[10px] leading-relaxed text-[var(--muted)]">
          <Icon name="shield" size={15} className="mt-0.5 shrink-0 text-[var(--brand-2)]" />
          Logowanie w tej wersji jest demonstracyjne i lokalne. Publikacja z perspektywy całego urządzenia — bez backendu zmiany nie trafiają do innych użytkowników.
        </div>
      </div>
    );
  }

  if (!myChannel) {
    const submit = (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setCreating(true);
      const result = createChannel({
        name: channelForm.name,
        handle: channelForm.handle || channelForm.name,
        description: channelForm.description,
        category: channelForm.category,
        avatar: channelForm.avatar,
        cover: channelForm.cover,
      });
      setCreating(false);
      if (!result.ok) setError(result.error ?? "Nie udało się utworzyć kanału.");
    };
    const handle = `@${(channelForm.handle || channelForm.name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 24) || "twojkanal"}`;

    return (
      <div className="space-y-5">
        <PageHero eyebrow="Nowy rozdział" title="Załóż swój kanał na MiraVoice." description="To Twoja scena. Opowiedz nam, o czym będzie Twój kanał, a my przygotujemy wszystko do pierwszej publikacji." icon="crown" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
          <form onSubmit={submit} className="card space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-ink)]"><Icon name="user" size={16} /></span><div><p className="text-xs font-extrabold">Witaj, {currentUser.name.split(" ")[0]}!</p><p className="text-[9px] text-[var(--muted)]">{currentUser.email} · konto demo</p></div></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="ch-name">Nazwa kanału *</label>
                <input id="ch-name" className="field" required minLength={3} maxLength={40} value={channelForm.name} onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })} placeholder="np. Zosia Odkrywa" />
              </div>
              <div>
                <label className="label" htmlFor="ch-handle">Adres kanału</label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)]">@</span><input id="ch-handle" className="field pl-7" maxLength={24} value={channelForm.handle} onChange={(e) => setChannelForm({ ...channelForm, handle: e.target.value })} placeholder="twojkanal" /></div>
                <p className="mt-1 text-[8.5px] text-[var(--muted)]">Podgląd: {handle}</p>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="ch-desc">Opis kanału *</label>
              <textarea id="ch-desc" className="field min-h-[88px] resize-none" required maxLength={300} value={channelForm.description} onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })} placeholder="O czym opowiadasz? Jaki masz styl i co znajdą tu widzowie?" />
              <p className="mt-1 text-right text-[8.5px] text-[var(--muted)]">{channelForm.description.length}/300</p>
            </div>
            <div>
              <label className="label" htmlFor="ch-cat">Kategoria</label>
              <select id="ch-cat" className="field" value={channelForm.category} onChange={(e) => setChannelForm({ ...channelForm, category: e.target.value })}>
                {["Lore i analizy", "Teorie", "Nauka i lore", "Fan filmy", "Let's play", "Twórczość"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageField label="Avatar (opcjonalnie)" value={channelForm.avatar} onChange={(value) => setChannelForm({ ...channelForm, avatar: value })} previewClass="h-14 w-14 !rounded-full" />
              <ImageField label="Tło kanału (opcjonalnie)" value={channelForm.cover} onChange={(value) => setChannelForm({ ...channelForm, cover: value })} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setChannelForm({ ...channelForm, avatar: STUDIO_IMAGE, cover: GRAFFITI_IMAGE })} className="chip !py-1.5 !text-[9px]">Użyj przykładowych grafik</button>
              <span className="flex items-center gap-1 text-[9px] text-[var(--muted)]"><Icon name="shield" size={11} /> tylko bezpieczne obrazy</span>
            </div>
            {error && <ErrorNote>{error}</ErrorNote>}
            <button type="submit" disabled={creating} className="btn-primary w-full !py-3 text-xs disabled:opacity-50">{creating ? "Tworzymy kanał…" : "Utwórz mój kanał"} <Icon name="arrowRight" size={14} /></button>
          </form>
          <aside className="space-y-3">
            <div className="card overflow-hidden">
              <div className="relative h-24 bg-[var(--brand)]">{channelForm.cover ? <img src={channelForm.cover} alt="" className="h-full w-full object-cover opacity-80" /> : <div className="h-full w-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)]" />}</div>
              <div className="-mt-7 px-4 pb-4"><Avatar src={channelForm.avatar} name={channelForm.name || currentUser.name} size={52} ring /><p className="mt-2 truncate text-sm font-extrabold">{channelForm.name || "Twoja nazwa"}</p><p className="text-[10px] text-[var(--muted)]">{handle} · 0 subskrybentów</p><p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-[var(--muted)]">{channelForm.description || "Twój opis pojawi się tutaj."}</p></div>
            </div>
            <div className="rounded-[var(--radius)] bg-[var(--brand)] p-4 text-white">
              <Icon name="crown" size={21} className="text-[var(--accent)]" />
              <h2 className="mt-2 font-display text-base font-extrabold">Co dostajesz?</h2>
              <ul className="mt-2 space-y-1.5">{["Własny profil kanału i licznik subskrypcji", "Publikację wideo w bibliotece MiraVoice", "Statystyki i edycję materiałów", "Subskrypcje i powiadomienia widzów"].map((x) => <li key={x} className="flex gap-1.5 text-[10px] text-white/65"><Icon name="check" size={11} className="mt-0.5 shrink-0 text-[var(--accent)]" /> {x}</li>)}</ul>
            </div>
            <p className="px-1 text-[9px] leading-relaxed text-[var(--muted)]">Tworząc kanał, akceptujesz zasady społeczności. Kanały i treści demo zapisują się wyłącznie w tej przeglądarce.</p>
          </aside>
        </div>
      </div>
    );
  }

  const saveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingChannel(true);
    const result = updateMyChannel({
      name: editForm.name,
      description: editForm.description,
      category: editForm.category,
      avatar: editForm.avatar || undefined,
      cover: editForm.cover || undefined,
    });
    setSavingChannel(false);
    setError(result.ok ? "" : result.error ?? "Nie udało się zapisać zmian.");
    if (result.ok) notify("Ustawienia kanału zapisane.");
  };

  const publishVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    const result = addVideo(videoForm);
    setPublishing(false);
    if (!result.ok) {
      setError(result.error ?? "Nie udało się dodać wideo.");
      return;
    }
    setError("");
    setVideoForm({ title: "", description: "", category: "Analizy", thumbnail: "", videoUrl: "", duration: "" });
    setTab("wideo");
  };

  const shareChannel = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/community`);
      notify("Link do społeczności skopiowany. Pokaż go znajomym!");
    } catch {
      notify("Kopiowanie nie jest dostępne w tej przeglądarce.", "info");
    }
  };

  return (
    <div className="space-y-5">
      <PageHero eyebrow="Studio twórcy" title="Buduj swoją społeczność. Jednym materiałem na raz." description="Masz pełną kontrolę nad kanałem, publikacjami i widzami. Wszystko w jednym miejscu — bez wychodzenia z aplikacji." icon="film">
        <button type="button" onClick={() => document.getElementById("new-video-panel")?.scrollIntoView({ behavior: "smooth" })} className="btn-primary !px-4 !py-2.5 text-[11px]"><Icon name="plus" size={14} /> Dodaj wideo</button>
      </PageHero>

      <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)]">
        <div className="relative h-28 bg-[var(--brand)] sm:h-36">
          {myChannel.cover ? <img src={myChannel.cover} alt="" className="h-full w-full object-cover opacity-70" /> : <div className="h-full w-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-transparent to-transparent" />
          <button type="button" onClick={() => setTab("ustawienia")} className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1.5 text-[9px] font-bold text-white backdrop-blur hover:bg-black/45"><Icon name="edit" size={11} /> Edytuj kanał</button>
        </div>
        <div className="px-4 pb-4 sm:px-5">
          <div className="-mt-9 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <Avatar src={myChannel.avatar} name={myChannel.name} size={72} ring className="border-4 border-[var(--surface)]" />
              <div className="pb-0.5">
                <h2 className="flex items-center gap-1.5 font-display text-xl font-extrabold leading-tight">{myChannel.name} <VerifiedBadge /></h2>
                <p className="text-[10px] font-semibold text-[var(--muted)]">{myChannel.handle} · twój kanał</p>
              </div>
            </div>
            <div className="flex gap-2 pb-0.5">
              <button type="button" onClick={shareChannel} className="btn-outline !py-2 px-3 text-[10px]"><Icon name="share" size={13} /> Udostępnij</button>
              <button type="button" onClick={() => navigate("community")} className="btn-dark !py-2 px-3 text-[10px]">Zobacz publicznie <Icon name="external" size={12} /></button>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-[11px] leading-relaxed text-[var(--muted)]">{myChannel.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Subskrybenci", value: formatNumber(myChannel.subscribers), icon: "users" as const },
              { label: "Wyświetlenia", value: formatNumber(totalViews), icon: "eye" as const },
              { label: "Polubienia", value: formatNumber(totalLikes), icon: "heart" as const },
              { label: "Materiały", value: `${myVideos.length}`, icon: "video" as const },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] px-3 py-2.5">
                <Icon name={stat.icon} size={14} className="text-[var(--brand-2)]" />
                <p className="mt-1 font-display text-lg font-extrabold leading-none">{stat.value}</p>
                <p className="mt-1 text-[8.5px] font-bold uppercase tracking-wide text-[var(--muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex gap-1.5 overflow-x-auto rounded-full border border-[var(--line)] bg-[var(--surface)] p-1">
        {[
          { id: "pulpit" as const, label: "Pulpit", icon: "home" as const },
          { id: "wideo" as const, label: `Wideo (${myVideos.length})`, icon: "video" as const },
          { id: "ustawienia" as const, label: "Ustawienia kanału", icon: "settings" as const },
        ].map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn("flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold transition", tab === item.id ? "bg-[var(--brand)] text-white" : "text-[var(--muted)] hover:text-[var(--ink)]")}>
            <Icon name={item.icon} size={13} /> {item.label}
          </button>
        ))}
      </div>

      {tab === "pulpit" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <form onSubmit={publishVideo} id="new-video-panel" className="card p-4 sm:p-5">
              <SectionHeader eyebrow="Nowa publikacja" title="Dodaj wideo" description="Tytuł, miniatura i adres pliku wideo. Możesz też użyć bezpiecznego przykładowego pliku, aby przetestować działanie." />
              <div className="space-y-3">
                <div>
                  <label className="label" htmlFor="v-title">Tytuł wideo *</label>
                  <input id="v-title" className="field" required minLength={5} maxLength={100} value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} placeholder="np. 5 rzeczy, które przegapiłeś w finale" />
                </div>
                <div>
                  <label className="label" htmlFor="v-desc">Opis</label>
                  <textarea id="v-desc" className="field min-h-[74px] resize-none" maxLength={800} value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} placeholder="Krótko opowiedz, co widz znajdzie w materiale." />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="label" htmlFor="v-cat">Kategoria</label><select id="v-cat" className="field" value={videoForm.category} onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value as VideoCategory })}>{videoCategories.map((c) => <option key={c}>{c}</option>)}</select></div>
                  <div><label className="label" htmlFor="v-dur">Czas trwania</label><input id="v-dur" className="field" maxLength={8} value={videoForm.duration} onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })} placeholder="np. 08:42" /></div>
                </div>
                <ImageField label="Miniatura *" value={videoForm.thumbnail} onChange={(value) => setVideoForm({ ...videoForm, thumbnail: value })} previewClass="h-16 w-28" />
                <div>
                  <label className="label" htmlFor="v-url">Adres pliku wideo (MP4/WebM)</label>
                  <input id="v-url" className="field" value={videoForm.videoUrl} onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })} placeholder="https://…/material.mp4 (opcjonalnie)" />
                  <button type="button" onClick={() => setVideoForm({ ...videoForm, videoUrl: SAMPLE_VIDEO, thumbnail: videoForm.thumbnail || CITY_IMAGE, duration: videoForm.duration || "00:10" })} className="mt-1.5 text-[9px] font-bold text-[var(--brand-2)] hover:underline">Wstaw przykładowy materiał testowy</button>
                </div>
                {error && <ErrorNote>{error}</ErrorNote>}
                <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
                  <span className="flex items-center gap-1 text-[9px] text-[var(--muted)]"><Icon name="shield" size={11} /> walidacja linków i treści</span>
                  <button type="submit" disabled={publishing} className="btn-primary !py-2.5 text-[10px] disabled:opacity-50">{publishing ? "Publikuję…" : "Opublikuj wideo"} <Icon name="send" size={12} /></button>
                </div>
              </div>
            </form>

            <div className="card p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-base font-extrabold">Ostatnie materiały</h2><button type="button" onClick={() => setTab("wideo")} className="text-[10px] font-bold text-[var(--brand-2)] hover:underline">Wszystkie</button></div>
              {myVideos.length === 0 ? (
                <EmptyState icon="video" title="Tu pojawi się Twój pierwszy film" description="Dodaj materiał powyżej. Pierwszy krok jest najtrudniejszy — resztę zrobimy razem." />
              ) : (
                <div className="divide-y divide-[var(--line)]">{myVideos.slice(0, 4).map((v) => <div key={v.id} className="flex items-center gap-2.5 py-2.5"><img src={v.thumbnail} alt="" className="h-11 w-20 shrink-0 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold">{v.title}</p><p className="text-[9px] text-[var(--muted)]">{v.category} · {formatNumber(v.views)} wyśw.</p></div><Badge tone="soft" className="hidden sm:inline-flex">aktywne</Badge></div>)}</div>
              )}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="card p-4">
              <h3 className="flex items-center gap-1.5 font-display text-sm font-extrabold"><Icon name="sparkles" size={14} className="text-[var(--brand-2)]" /> Studio — szybkie akcje</h3>
              <div className="mt-2 space-y-1.5">
                <button type="button" onClick={() => setTab("wideo")} className="flex w-full items-center justify-between rounded-xl bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] px-3 py-2.5 text-[10px] font-bold">Zarządzaj wideo <Icon name="chevronRight" size={12} /></button>
                <button type="button" onClick={() => setTab("ustawienia")} className="flex w-full items-center justify-between rounded-xl bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] px-3 py-2.5 text-[10px] font-bold">Edytuj profil kanału <Icon name="chevronRight" size={12} /></button>
                <button type="button" onClick={() => navigate("security")} className="flex w-full items-center justify-between rounded-xl bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] px-3 py-2.5 text-[10px] font-bold">Bezpieczeństwo konta <Icon name="chevronRight" size={12} /></button>
              </div>
            </div>
            <div className="rounded-[var(--radius)] bg-[var(--brand)] p-4 text-white">
              <Icon name="info" size={18} className="text-[var(--accent)]" />
              <h3 className="mt-1.5 font-display text-base font-extrabold">Dane lokalne</h3>
              <p className="mt-1 text-[10px] leading-relaxed text-white/60">Kanał i wideo zapisują się w tej przeglądarce. Aby publikować dla wszystkich, trzeba podłączyć Supabase lub inny backend. Architektura jest gotowa pod synchronizację.</p>
              <p className="mt-2 text-[9px] font-bold text-[var(--accent)]">Twoje dane demo · bez chmury</p>
            </div>
            {data.subscriptions["ch_originals"] && <div className="card p-4"><p className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--brand-2)]">Tip od ekipy</p><p className="mt-1 text-[11px] font-bold">Pierwsze 10 sekund decyduje</p><p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">Zacznij od pytania, którego widz nie może zignorować. Miniatura zawsze z twarzą bohatera i krótkim hasłem.</p></div>}
          </aside>
        </div>
      )}

      {tab === "wideo" && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div><h2 className="font-display text-lg font-extrabold">Twoje wideo</h2><p className="text-[10px] text-[var(--muted)]">Widoczne publicznie w bibliotece i na Twoim kanale.</p></div>
            <button type="button" onClick={() => setTab("pulpit")} className="btn-primary w-fit !py-2.5 text-[10px]"><Icon name="plus" size={13} /> Nowe wideo</button>
          </div>
          {myVideos.length === 0 ? <EmptyState icon="video" title="Brak publikacji" description="Dodaj pierwszy materiał w zakładce Pulpit." /> : (
            <div className="space-y-2">
              {myVideos.map((video) => (
                <div key={video.id} className="card flex flex-wrap items-center gap-3 p-3">
                  <img src={video.thumbnail} alt="" className="h-16 w-28 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1"><p className="line-clamp-1 text-xs font-extrabold">{video.title}</p><p className="mt-0.5 text-[9px] text-[var(--muted)]">{video.category} · {video.duration} · {formatNumber(video.views)} odsłon · {formatNumber(video.likes)} polubień</p><p className="line-clamp-1 text-[9px] text-[var(--muted)]">{new Date(video.date).toLocaleDateString("pl-PL")} · opublikowane</p></div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => navigate("videos")} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--brand)]" aria-label="Pokaż w bibliotece"><Icon name="eye" size={14} /></button>
                    <button type="button" onClick={() => { if (window.confirm("Usunąć ten materiał? Tej operacji nie można cofnąć.")) deleteVideo(video.id); }} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-600" aria-label="Usuń wideo"><Icon name="trash" size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "ustawienia" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={saveChannel} className="card space-y-3 p-4 sm:p-5">
            <div><h2 className="font-display text-lg font-extrabold">Ustawienia kanału</h2><p className="text-[10px] text-[var(--muted)]">Zmiany są widoczne od razu w całej aplikacji.</p></div>
            <div><label className="label" htmlFor="e-name">Nazwa kanału</label><input id="e-name" className="field" required minLength={3} maxLength={40} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div><label className="label" htmlFor="e-desc">Opis</label><textarea id="e-desc" className="field min-h-[86px] resize-none" maxLength={300} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></div>
            <div><label className="label" htmlFor="e-cat">Kategoria</label><select id="e-cat" className="field" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>{["Lore i analizy", "Teorie", "Nauka i lore", "Fan filmy", "Let's play", "Twórczość"].map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageField label="Avatar" value={editForm.avatar} onChange={(value) => setEditForm({ ...editForm, avatar: value })} previewClass="h-14 w-14 !rounded-full" />
              <ImageField label="Tło" value={editForm.cover} onChange={(value) => setEditForm({ ...editForm, cover: value })} />
            </div>
            {error && <ErrorNote>{error}</ErrorNote>}
            <div className="border-t border-[var(--line)] pt-3"><button type="submit" disabled={savingChannel} className="btn-primary !py-2.5 text-[11px] disabled:opacity-50">{savingChannel ? "Zapisuję…" : "Zapisz zmiany"}</button></div>
          </form>
          <aside className="space-y-3">
            <div className="card p-4"><h3 className="text-xs font-extrabold">Adres publiczny</h3><p className="mt-1 rounded-lg bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] px-2.5 py-2 text-xs font-bold">{myChannel.handle}</p><p className="mt-2 text-[9px] leading-relaxed text-[var(--muted)]">Adres kanału jest unikalny. Skontaktuj się z administratorem, jeśli potrzebujesz go zmienić.</p></div>
            <div className="rounded-[var(--radius)] bg-[var(--brand)] p-4 text-white"><Icon name="shield" size={18} className="text-[var(--accent)]" /><h3 className="mt-1.5 font-display text-base font-extrabold">Bezpieczna edycja</h3><p className="mt-1 text-[10px] leading-relaxed text-white/60">Każdy obraz jest sprawdzany przed zapisem. Treści są oczyszczane z HTML, a uprawnienia edycji ograniczone do właściciela kanału.</p></div>
          </aside>
        </div>
      )}
    </div>
  );
}
