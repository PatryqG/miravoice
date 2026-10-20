import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Badge, EmptyState, PageHero } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { cn } from "@/utils/cn";

export function HistoryPage() {
  const { content, navigate } = useApp();
  const eras = useMemo(() => ["Wszystkie", ...Array.from(new Set(content.history.map((e) => e.era)))], [content.history]);
  const [era, setEra] = useState("Wszystkie");
  const [openId, setOpenId] = useState<string | null>(content.history[content.history.length - 1]?.id ?? null);
  const events = content.history.filter((e) => era === "Wszystkie" || e.era === era);

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Archiwum czasu"
        title="Historia świata Cudów — zapisana i wciąż pisana."
        description="Przechodzimy przez epoki: od pierwszych legend i Zakonu Strażników po nowe historie tworzone przez społeczność. Kliknij rozdział, aby rozwinąć zapis."
        icon="clock"
      >
        <div className="flex flex-wrap gap-2">
          <Badge className="!bg-white/15 !text-white"><Icon name="book" size={11} /> {content.history.length} rozdziałów</Badge>
          <Badge className="!bg-white/15 !text-white"><Icon name="butterfly" size={11} /> archiwum fandomowe</Badge>
          <button type="button" onClick={() => navigate("lore")} className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-[10px] font-extrabold text-[var(--accent-ink)]"><Icon name="arrowUpRight" size={12} /> Przejdź do lore</button>
        </div>
      </PageHero>

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="card sticky top-[86px] p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]"><Icon name="filter" size={12} /> Epoki</p>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-col">
              {eras.map((item) => (
                <button key={item} type="button" onClick={() => setEra(item)} className={cn("shrink-0 rounded-lg px-2.5 py-2 text-left text-[11px] font-bold transition", era === item ? "bg-[var(--brand)] text-white" : "text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))]")}>
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-[color-mix(in_srgb,var(--accent)_20%,var(--surface))] p-3">
              <Icon name="info" size={15} className="text-[var(--brand)]" />
              <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--muted)]">To fanowskie archiwum. Część wydarzeń jest interpretacją społeczności, a nie oficjalnym kanonem.</p>
            </div>
            <button type="button" onClick={() => navigate("about")} className="mt-3 flex w-full items-center justify-between rounded-lg border border-[var(--line)] px-2.5 py-2 text-[10px] font-bold text-[var(--brand)]">Zasady archiwum <Icon name="chevronRight" size={12} /></button>
          </div>
          <div className="hidden rounded-[var(--radius)] bg-[var(--brand)] p-4 text-white lg:block">
            <span className="font-marker text-lg text-[var(--accent)]">legenda</span>
            <p className="mt-2 text-[11px] font-extrabold">Każda historia ma dwie strony.</p>
            <p className="mt-1 text-[10px] leading-relaxed text-white/55">W MiraVoice słuchamy obu. Twórzmy archiwum, które łączy, a nie dzieli fandom.</p>
            <button type="button" onClick={() => navigate("community")} className="mt-3 text-[10px] font-bold text-[var(--accent)] underline underline-offset-2">Dołącz do dyskusji →</button>
          </div>
        </aside>

        <div>
          {events.length === 0 ? (
            <EmptyState icon="clock" title="Ta epoka czeka na odkrycie" description="Nie mamy jeszcze wydarzeń w tej epoce. Wróć później albo dodaj własny rozdział w panelu administratora." />
          ) : (
            <div className="relative">
              <div className="absolute bottom-4 left-[17px] top-3 w-px bg-[var(--line)] sm:left-[23px]" />
              <div className="space-y-3.5">
                {events.map((event, index) => {
                  const open = openId === event.id;
                  return (
                    <article key={event.id} className="relative pl-10 sm:pl-14">
                      <button type="button" onClick={() => setOpenId(open ? null : event.id)} className="absolute left-0 top-1.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-[var(--brand)] text-[var(--accent)] shadow-md transition hover:scale-105 sm:h-11 sm:w-11" aria-label={`Rozwiń: ${event.title}`}>
                        <span className={cn("h-2.5 w-2.5 rounded-full", event.accent ? "bg-[var(--accent)]" : "border border-[var(--accent)]")} />
                      </button>
                      <button type="button" onClick={() => setOpenId(open ? null : event.id)} className={cn("card w-full p-4 text-left transition sm:p-5", open ? "border-[var(--brand)] shadow-sm" : "hover:border-[color-mix(in_srgb,var(--brand)_40%,var(--line))]")} aria-expanded={open}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[var(--brand)] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[var(--accent)]">{event.year}</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">{event.era} · rozdział {String(index + 1).padStart(2, "0")}</span>
                          <Icon name="chevronDown" size={15} className={cn("ml-auto text-[var(--muted)] transition", open && "rotate-180")} />
                        </div>
                        <h2 className="mt-2.5 font-display text-lg font-extrabold leading-tight sm:text-xl">{event.title}</h2>
                        <p className={cn("mt-1.5 text-[12px] leading-relaxed text-[var(--muted)]", !open && "line-clamp-2")}>{event.description}</p>
                        {open && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
                            <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--brand-2)]"><Icon name="book" size={11} /> Archiwum MiraVoice</span>
                            <span className="text-[9px] text-[var(--muted)]">· zapis redakcyjny · fanowski</span>
                            <button type="button" onClick={(e) => { e.stopPropagation(); navigate("lore"); }} className="ml-auto flex items-center gap-0.5 text-[9px] font-bold text-[var(--brand-2)] hover:underline">Powiązane lore <Icon name="arrowUpRight" size={10} /></button>
                          </div>
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>
              <div className="relative mt-4 pl-10 sm:pl-14">
                <span className="absolute left-2.5 top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] sm:left-3.5"><Icon name="plus" size={11} /></span>
                <div className="rounded-2xl border border-dashed border-[var(--line)] p-4">
                  <p className="text-[11px] font-extrabold">Następny rozdział piszesz Ty.</p>
                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">Załóż kanał i dodaj swoją interpretację historii do społeczności.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: "book" as const, title: "Archiwum otwarte", text: "Wiedza o Cudach jest dobrem wspólnym. Dziel się źródłami i oznaczaj interpretacje." },
          { icon: "shield" as const, title: "Szanuj twórców", text: "Fanowska historia nie zastępuje oficjalnej. Zawsze podkreślamy, co jest kanonem, a co teorią." },
          { icon: "community" as const, title: "Razem piszemy dalej", text: "Masz poprawkę lub nowy trop? Napisz do redakcji albo dodaj materiał w Studiu." },
        ].map((item) => (
          <div key={item.title} className="card flex gap-3 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_28%,var(--surface))] text-[var(--brand)]"><Icon name={item.icon} size={17} /></span>
            <div><p className="text-xs font-extrabold">{item.title}</p><p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">{item.text}</p></div>
          </div>
        ))}
      </section>
    </div>
  );
}
