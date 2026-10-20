import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import type { Actor } from "@/types";
import { Avatar, Badge, EmptyState, Modal, PageHero } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { safeExternalUrl } from "@/lib/security";
import { cn } from "@/utils/cn";

const filters = ["Wszyscy", "Głos", "Produkcja", "Twórcy"] as const;

export function ActorsPage() {
  const { content, navigate, notify } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("Wszyscy");
  const [selected, setSelected] = useState<Actor | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.actors.filter((a) => {
      const matchesQuery = !q || `${a.name} ${a.role} ${a.character} ${a.bio} ${a.tags.join(" ")}`.toLowerCase().includes(q);
      const matchesFilter =
        filter === "Wszyscy" ||
        (filter === "Głos" && /głos|dubbing|wokal/i.test(`${a.role} ${a.tags.join(" ")}`)) ||
        (filter === "Produkcja" && /produkc|reżyser|dźwięk|sound/i.test(`${a.role} ${a.tags.join(" ")}`)) ||
        (filter === "Twórcy" && /fan|teatr|narrac|gaming/i.test(`${a.tags.join(" ")}`));
      return matchesQuery && matchesFilter;
    });
  }, [content.actors, query, filter]);

  return (
    <div className="space-y-7">
      <PageHero
        eyebrow="Ludzie za głosami"
        title="Bohaterowie mają głosy. Poznaj ludzi, którzy je tworzą."
        description="Ekipa głosowa MiraVoice to aktorzy, wokaliści i twórcy. Poznaj ich warsztat, ulubione postacie i kulisy pracy nad światem Cudów."
        icon="users"
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent" className="!bg-white/15 !text-white"><Icon name="users" size={11} /> {content.actors.length} osób w ekipie</Badge>
          <Badge tone="accent" className="!bg-white/15 !text-white"><Icon name="film" size={11} /> fankast + produkcja</Badge>
          <Badge tone="accent" className="!bg-white/15 !text-white"><Icon name="heart" size={11} /> 100% fanowskie serce</Badge>
        </div>
      </PageHero>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.actors.slice(0, 3).map((actor, index) => (
          <button key={actor.id} type="button" onClick={() => setSelected(actor)} className={cn("group relative overflow-hidden rounded-[var(--radius)] text-left", index === 0 ? "sm:col-span-2 lg:col-span-2" : "")}>
            <div className={cn("relative overflow-hidden bg-[var(--brand)]", index === 0 ? "aspect-[16/9]" : "aspect-[4/3]")}>
              <img src={actor.image} alt={actor.name} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071d16]/95 via-[#071d16]/20 to-transparent" />
              <span className="absolute left-3 top-3 rounded-full border border-white/18 bg-black/25 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur">{actor.role}</span>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--accent)]">{actor.character}</p>
                <h2 className="mt-1 font-display text-xl font-extrabold text-white sm:text-2xl">{actor.name}</h2>
                <p className="mt-1 line-clamp-2 max-w-md text-[11px] leading-relaxed text-white/60">{actor.bio}</p>
              </div>
              <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-ink)]"><Icon name="arrowUpRight" size={17} /></span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {filters.map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={cn("chip", filter === f && "chip-active")}>{f}</button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Icon name="search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input value={query} onChange={(e) => setQuery(e.target.value.slice(0, 60))} className="field !rounded-full !py-2.5 pl-9 text-xs" placeholder="Szukaj osoby lub postaci…" aria-label="Szukaj aktora" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="users" title="Brak osób w tym filtrze" description="Zmień kategorię lub wyczyść pole wyszukiwania." action={<button type="button" onClick={() => { setQuery(""); setFilter("Wszyscy"); }} className="btn-primary !py-2.5 text-xs">Pokaż wszystkich</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((actor) => (
            <button key={actor.id} type="button" onClick={() => setSelected(actor)} className="card group flex gap-3 overflow-hidden p-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-md">
              <div className="relative h-[106px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-[var(--brand)]">
                <img src={actor.image} alt={actor.name} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
              </div>
              <div className="min-w-0 flex-1 py-1">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--brand-2)]">{actor.character}</p>
                <p className="mt-0.5 truncate font-display text-[15px] font-extrabold">{actor.name}</p>
                <p className="text-[10px] font-medium text-[var(--muted)]">{actor.role}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {actor.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-full bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))] px-2 py-0.5 text-[8px] font-semibold text-[var(--brand)]">{tag}</span>)}
                </div>
                <p className="mt-2 flex items-center justify-between text-[9px] text-[var(--muted)]"><span>📍 {actor.city}</span><Icon name="chevronRight" size={12} /></p>
              </div>
            </button>
          ))}
        </div>
      )}

      <section className="relative overflow-hidden rounded-[var(--radius)] bg-[var(--brand)] p-5 text-white sm:p-7">
        <div className="graffiti-dots absolute inset-0 opacity-20" />
        <div className="absolute -right-10 -top-14 h-48 w-48 rounded-full border-[24px] border-[var(--accent)] opacity-15" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <span className="font-marker text-sm text-[var(--accent)]">casting otwarty!</span>
            <h2 className="mt-1 font-display text-2xl font-extrabold leading-tight">Szukamy nowych głosów do fankastu.</h2>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-white/60">Masz warsztat, mikrofon i energię do wspólnego tworzenia? Napisz do ekipy. Nie wymagamy portfolio — wymagamy pasji i szacunku.</p>
          </div>
          <a href={`mailto:${content.email}?subject=Casting%20MiraVoice`} onClick={() => notify("Otwieramy Twój program pocztowy.", "info")} className="btn-primary w-fit !px-5 !py-3 text-[11px]"><Icon name="mail" size={14} /> Napisz do ekipy</a>
        </div>
      </section>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div>
            <div className="relative h-56 overflow-hidden bg-[var(--brand)] sm:h-64">
              <img src={selected.image} alt={selected.name} className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <Badge tone="accent">{selected.role}</Badge>
                <p className="mt-2 font-display text-2xl font-extrabold text-white">{selected.character}</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <Avatar src={selected.image} name={selected.name} size={44} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-extrabold">{selected.name}</h3>
                  <p className="text-[11px] text-[var(--muted)]">📍 {selected.city} · MiraVoice</p>
                </div>
                <button type="button" onClick={() => notify("Kanał tej osoby pojawi się wkrótce w społeczności.", "info")} className="btn-dark !px-3.5 !py-2 text-[10px]"><Icon name="plus" size={13} /> Obserwuj</button>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[var(--ink)]/80">{selected.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{selected.tags.map((tag) => <Badge key={tag} tone="soft">{tag}</Badge>)}</div>
              {selected.socials && selected.socials.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.socials.map((social) => {
                    const safe = safeExternalUrl(social.url);
                    return safe ? <a key={labelled(social.label)} href={safe} target="_blank" rel="noopener noreferrer" className="btn-outline !py-2 text-[10px]">{social.label} <Icon name="external" size={12} /></a> : null;
                  })}
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
                <button type="button" onClick={() => { setSelected(null); navigate("videos"); }} className="btn-primary flex-1 !py-2.5 text-[11px]"><Icon name="playCircle" size={14} /> Materiały z tą osobą</button>
                <button type="button" onClick={() => { setSelected(null); navigate("about"); }} className="btn-outline flex-1 !py-2.5 text-[11px]">O ekipie</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function labelled(value: string) {
  return value.replace(/\s+/g, "-").toLowerCase();
}
