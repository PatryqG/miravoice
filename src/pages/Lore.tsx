import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import type { LoreEntry } from "@/types";
import { Badge, EmptyState, Modal, PageHero } from "@/components/ui";
import { HeroGlyph, Icon } from "@/components/Icons";
import { cn } from "@/utils/cn";

const categories: ("Wszystkie" | LoreEntry["category"])[] = ["Wszystkie", "Bohaterowie", "Kwami", "Moce", "Artefakty"];

export function LorePage() {
  const { content, navigate } = useApp();
  const [category, setCategory] = useState<(typeof categories)[number]>("Wszystkie");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LoreEntry | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.lore.filter((entry) => {
      const matchesCategory = category === "Wszystkie" || entry.category === category;
      const matchesQuery = !q || `${entry.name} ${entry.power} ${entry.kwami} ${entry.holder} ${entry.description}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [content.lore, category, query]);

  const heroes = content.lore.filter((l) => l.category === "Bohaterowie").slice(0, 3);
  const display = category === "Wszystkie" && !query ? filtered : filtered;

  return (
    <div className="space-y-7">
      <PageHero
        eyebrow="Miraculous · kompendium"
        title="Poznaj Cuda. Zrozum moc. Wybierz swoją stronę."
        description="Bohaterowie, Kwami, moce i artefakty — uporządkowane lore w jednym miejscu. Przeglądaj, filtruj i klikaj karty, żeby wejść głębiej."
        icon="butterfly"
      >
        <div className="flex flex-wrap gap-2">
          <Badge className="!bg-white/15 !text-white"><Icon name="book" size={11} /> {content.lore.length} wpisów</Badge>
          <Badge className="!bg-white/15 !text-white"><Icon name="sparkles" size={11} /> 4 kategorie</Badge>
          <button type="button" onClick={() => navigate("history")} className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-white/10"><Icon name="clock" size={12} /> Historia światów</button>
        </div>
      </PageHero>

      <section className="grid gap-3 lg:grid-cols-3">
        {heroes.map((hero, index) => (
          <button key={hero.id} type="button" onClick={() => setSelected(hero)} className={cn("group relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5", index === 0 && "lg:col-span-1")} style={{ background: `linear-gradient(135deg, ${hero.accent} 0%, var(--surface) 78%)` }}>
            <div className="absolute -right-6 -top-5 h-32 w-32 opacity-[0.12] transition duration-500 group-hover:scale-110 group-hover:opacity-20" style={{ color: hero.color }}>
              <HeroGlyph glyph={hero.glyph} size={128} color={hero.color} />
            </div>
            <div className="relative flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm" style={{ background: hero.color }}><HeroGlyph glyph={hero.glyph} size={25} color="#fff" /></span>
              <span className="rounded-full bg-white/70 px-2 py-1 text-[8px] font-extrabold uppercase tracking-widest text-[var(--brand)] backdrop-blur">{hero.category}</span>
            </div>
            <p className="relative mt-5 font-display text-xl font-extrabold">{hero.name}</p>
            <p className="relative mt-0.5 text-[10px] font-semibold text-[var(--muted)]">{hero.power} · {hero.kwami}</p>
            <p className="relative mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--ink)]/65">{hero.description}</p>
            <div className="relative mt-3 flex items-center gap-1 text-[10px] font-bold text-[var(--brand)]">Poznaj historię <Icon name="arrowRight" size={12} className="transition group-hover:translate-x-0.5" /></div>
          </button>
        ))}
      </section>

      <section className="card sticky top-[75px] z-20 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Icon name="search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input value={query} onChange={(e) => setQuery(e.target.value.slice(0, 80))} placeholder="Szukaj postaci, mocy, Kwami…" className="field !rounded-full !py-2.5 pl-10 text-xs" aria-label="Szukaj w lore" />
          </div>
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto lg:justify-end">
            {categories.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={cn("chip shrink-0", category === c && "chip-active")}>{c}</button>
            ))}
          </div>
          <span className="hidden text-[10px] font-bold text-[var(--muted)] sm:block">{filtered.length} wpisów</span>
        </div>
      </section>

      {display.length === 0 ? (
        <EmptyState icon="butterfly" title="Ten cud jest jeszcze ukryty" description="Żaden wpis nie pasuje do Twojego zapytania. Zmień kategorię lub poszukaj innego imienia." action={<button type="button" onClick={() => { setQuery(""); setCategory("Wszystkie"); }} className="btn-primary !py-2.5 text-xs">Pokaż całe lore</button>} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {display.map((entry, index) => (
            <button key={entry.id} type="button" onClick={() => setSelected(entry)} className="card group animate-fade-up overflow-hidden text-left transition hover:-translate-y-1 hover:border-[var(--brand)] hover:shadow-lg" style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}>
              <div className="relative flex h-[120px] items-center justify-center overflow-hidden sm:h-[135px]" style={{ background: `linear-gradient(140deg, ${entry.color} 0%, color-mix(in srgb, ${entry.color} 65%, #071d16) 100%)` }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,.24),transparent_40%)]" />
                <div className="absolute -bottom-8 -right-4 opacity-10"><HeroGlyph glyph={entry.glyph} size={150} color="#fff" /></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition duration-500 group-hover:scale-110">
                  <HeroGlyph glyph={entry.glyph} size={38} color="#fff" />
                </div>
                <span className="absolute left-2.5 top-2.5 rounded-full bg-black/20 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white backdrop-blur">{entry.category}</span>
                {entry.danger && <span className="absolute right-2.5 top-2.5 flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <span key={i} className={cn("h-1 w-1 rounded-full", i < entry.danger! ? "bg-[var(--accent)]" : "bg-white/25")} />)}</span>}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-1">
                  <h3 className="text-[13px] font-extrabold leading-tight">{entry.name}</h3>
                  <Icon name="arrowUpRight" size={13} className="mt-0.5 shrink-0 text-[var(--muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" />
                </div>
                <p className="mt-0.5 line-clamp-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color: entry.color }}>{entry.power}</p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[var(--muted)]">{entry.description}</p>
                <div className="mt-2.5 flex items-center gap-1 border-t border-[var(--line)] pt-2 text-[9px] font-medium text-[var(--muted)]">
                  <Icon name="sparkles" size={10} /> {entry.kwami}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-[var(--radius)] bg-[var(--brand)] p-5 text-white sm:p-6">
          <div className="graffiti-dots absolute inset-0 opacity-20" />
          <span className="font-marker text-sm text-[var(--accent)]">pamiętaj</span>
          <h2 className="relative mt-1 font-display text-xl font-extrabold leading-tight">Moc to nie tylko zwycięstwo.</h2>
          <p className="relative mt-2 text-[11px] leading-relaxed text-white/60">Każdy Cud ma drugą stronę: cenę, ograniczenie i odpowiedzialność. W naszym lore nie ma mocy bez konsekwencji — to zasada, która łączy wszystkie historie.</p>
          <button type="button" onClick={() => navigate("history")} className="relative mt-3 flex items-center gap-1 text-[10px] font-bold text-[var(--accent)] hover:underline">Zobacz chronologię Cudów <Icon name="arrowRight" size={11} /></button>
        </div>
        <div className="card p-5 sm:p-6">
          <span className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-[var(--brand-2)]"><Icon name="info" size={12} /> Kanon i interpretacja</span>
          <h2 className="mt-1 font-display text-xl font-extrabold leading-tight">Czytaj z otwartą głową.</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">To fanowski kompletny przewodnik. Część opisów to nasze interpretacje i uzupełnienia, które pomagają połączyć wątki. Oficjalny kanon zawsze ma pierwszeństwo.</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="soft">lore przyjazne fanom</Badge>
            <Badge tone="outline">bez spojlerów na start</Badge>
            <Badge tone="accent">PL</Badge>
          </div>
        </div>
      </section>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name} wide>
        {selected && (
          <div>
            <div className="relative overflow-hidden p-5 text-white sm:p-7" style={{ background: `linear-gradient(135deg, ${selected.color} 0%, #071d16 100%)` }}>
              <div className="absolute -right-6 -top-8 opacity-20"><HeroGlyph glyph={selected.glyph} size={240} color="#fff" /></div>
              <div className="relative flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest backdrop-blur">{selected.category}</span>
                {selected.danger && <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[9px] font-extrabold text-[var(--accent-ink)]">MOC · {selected.danger}/5</span>}
              </div>
              <div className="relative mt-5 flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10"><HeroGlyph glyph={selected.glyph} size={38} color="#fff" /></span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/55">{selected.kwami} · {selected.holder}</p>
                  <h2 className="font-display text-3xl font-extrabold leading-none">{selected.name}</h2>
                  <p className="mt-1 text-xs font-semibold text-[var(--accent)]">{selected.power}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_215px]">
              <div>
                <p className="text-sm leading-[1.75] text-[var(--ink)]/85">{selected.description}</p>
                <blockquote className="mt-4 border-l-2 border-[var(--accent)] pl-3 font-display text-sm font-bold italic leading-relaxed" style={{ color: selected.color }}>
                  „{selected.quote}”
                </blockquote>
                <div className="mt-5">
                  <p className="mb-2 text-[9px] font-extrabold uppercase tracking-widest text-[var(--muted)]">Pierwsze pojawienie się</p>
                  <div className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--brand)_4%,var(--surface))] px-3 py-2.5 text-xs font-semibold"><Icon name="clock" size={15} className="text-[var(--brand-2)]" /> {selected.first}</div>
                </div>
              </div>
              <aside className="space-y-2">
                {[
                  { label: "Nosiciel", value: selected.holder },
                  { label: "Kwami", value: selected.kwami },
                  { label: "Moc", value: selected.power },
                  { label: "Typ", value: selected.category },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[var(--line)] px-3 py-2">
                    <p className="text-[8px] font-extrabold uppercase tracking-widest text-[var(--muted)]">{item.label}</p>
                    <p className="mt-0.5 text-[11px] font-bold leading-snug">{item.value}</p>
                  </div>
                ))}
                <button type="button" onClick={() => { setSelected(null); navigate("videos"); }} className="btn-dark mt-2 w-full !py-2.5 text-[10px]"><Icon name="playCircle" size={13} /> Wideo o tej mocy</button>
              </aside>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
