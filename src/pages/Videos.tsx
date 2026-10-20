import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import type { Video, VideoCategory } from "@/types";
import { VideoCard } from "@/components/Video";
import { Badge, EmptyState, PageHero } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { formatNumber } from "@/lib/security";
import { cn } from "@/utils/cn";

const categories: ("Wszystko" | VideoCategory)[] = ["Wszystko", "Odcinki", "Analizy", "Fan film", "Lore", "Kulisy"];

export function VideosPage({ onOpenVideo }: { onOpenVideo: (video: Video) => void }) {
  const { content, navigate } = useApp();
  const [category, setCategory] = useState<(typeof categories)[number]>("Wszystko");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nowe" | "popularne">("nowe");
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.videos
      .filter((v) => category === "Wszystko" || v.category === category)
      .filter((v) => !q || `${v.title} ${v.channelName} ${v.description}`.toLowerCase().includes(q))
      .sort((a, b) =>
        sort === "nowe"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : b.views - a.views
      );
  }, [content.videos, category, query, sort]);

  const featured = content.videos.find((v) => v.official) ?? content.videos[0];

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Biblioteka wideo"
        title="Wszystkie historie w jednym miejscu."
        description="Odcinki, analizy, fan filmy i kulisy. Filtruj, szukaj i zanurz się w świecie Cudów — także w materiałach tworzonych przez społeczność."
        icon="playCircle"
      >
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold backdrop-blur">
            <Icon name="film" size={13} className="text-[var(--accent)]" /> {content.videos.length} materiałów
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold backdrop-blur">
            <Icon name="eye" size={13} className="text-[var(--accent)]" /> {formatNumber(content.videos.reduce((s, v) => s + v.views, 0))} wyświetleń
          </div>
          <button type="button" onClick={() => navigate("studio")} className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-3 py-1.5 text-[10px] font-extrabold text-[var(--accent-ink)]"><Icon name="plus" size={13} /> Dodaj wideo</button>
        </div>
      </PageHero>

      {featured && (
        <section className="group relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)]">
          <div className="grid lg:grid-cols-[1.25fr_1fr]">
            <button type="button" onClick={() => onOpenVideo(featured)} className="relative aspect-video overflow-hidden bg-[var(--brand)] text-left lg:aspect-auto lg:min-h-[320px]">
              <img src={featured.thumbnail} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
              <span className="absolute left-4 top-4 rounded-full bg-[var(--accent)] px-2.5 py-1 text-[10px] font-extrabold text-[var(--accent-ink)]">{featured.category}</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/25 bg-[var(--accent)] text-[var(--accent-ink)] shadow-xl transition group-hover:scale-110"><Icon name="play" size={24} filled /></span>
              </span>
              <span className="absolute bottom-4 right-4 rounded bg-black/75 px-2 py-1 text-[10px] font-bold text-white">{featured.duration}</span>
            </button>
            <div className="flex flex-col justify-center p-5 sm:p-7">
              <Badge tone="soft" className="w-fit"><Icon name="sparkles" size={11} /> Polecane przez redakcję</Badge>
              <h2 className="mt-3 text-balance font-display text-xl font-extrabold leading-tight sm:text-2xl">{featured.title}</h2>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--muted)]">{featured.description}</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-medium text-[var(--muted)]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--accent)]"><Icon name="sparkles" size={12} /></span>
                {featured.channelName} · {formatNumber(featured.views)} wyświetleń
              </div>
              <button type="button" onClick={() => onOpenVideo(featured)} className="btn-primary mt-5 w-fit !px-4 !py-2.5 text-[11px]"><Icon name="play" size={14} filled /> Odtwórz materiał</button>
            </div>
          </div>
        </section>
      )}

      <div className="card p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Icon name="search" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input value={query} onChange={(e) => setQuery(e.target.value.slice(0, 80))} className="field !rounded-full !py-2.5 pl-10 text-xs" placeholder="Szukaj wideo, twórcy lub tematu…" aria-label="Szukaj wideo" />
          </div>
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold transition", category === c ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand)]")}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-[var(--line)] pt-2 lg:border-0 lg:pt-0">
            <select value={sort} onChange={(e) => setSort(e.target.value as "nowe" | "popularne")} className="field !w-auto !py-2 text-[10px] font-bold" aria-label="Sortuj wideo">
              <option value="nowe">Najnowsze</option>
              <option value="popularne">Najpopularniejsze</option>
            </select>
            <div className="flex rounded-full border border-[var(--line)] p-0.5">
              <button type="button" onClick={() => setLayout("grid")} aria-label="Widok siatki" className={cn("flex h-7 w-8 items-center justify-center rounded-full transition", layout === "grid" ? "bg-[var(--brand)] text-white" : "text-[var(--muted)]")}><Icon name="grid" size={14} /></button>
              <button type="button" onClick={() => setLayout("list")} aria-label="Widok listy" className={cn("flex h-7 w-8 items-center justify-center rounded-full transition", layout === "list" ? "bg-[var(--brand)] text-white" : "text-[var(--muted)]")}><Icon name="list" size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="font-display text-lg font-extrabold">{category === "Wszystko" ? "Wszystkie materiały" : category}</h2>
        <span className="text-[10px] font-semibold text-[var(--muted)]">{filtered.length} {filtered.length === 1 ? "wynik" : "wyników"}</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nic tu nie ma… jeszcze" description="Żaden materiał nie pasuje do wybranych filtrów. Zmień kategorię lub wyczyść wyszukiwanie." action={<button type="button" onClick={() => { setQuery(""); setCategory("Wszystko"); }} className="btn-primary !py-2.5 text-xs">Wyczyść filtry</button>} />
      ) : layout === "grid" ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((video, i) => <VideoCard key={video.id} video={video} onOpen={onOpenVideo} index={i} />)}
        </div>
      ) : (
        <div className="card divide-y divide-[var(--line)] p-2 sm:p-3">
          {filtered.map((video) => <VideoCard key={video.id} video={video} onOpen={onOpenVideo} variant="row" />)}
        </div>
      )}

      <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--line)] bg-[color-mix(in_srgb,var(--accent)_13%,var(--surface))] p-5 text-center sm:flex-row sm:text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)] text-[var(--accent)]"><Icon name="film" size={21} /></span>
          <div><p className="font-display text-base font-extrabold">Twój materiał może tu być następny.</p><p className="mt-0.5 text-[11px] text-[var(--muted)]">Studio twórcy prowadzi Cię krok po kroku: kanał, miniatura, publikacja.</p></div>
        </div>
        <button type="button" onClick={() => navigate("studio")} className="btn-dark !py-2.5 text-[11px]">Przejdź do studia <Icon name="arrowRight" size={13} /></button>
      </div>
    </div>
  );
}
