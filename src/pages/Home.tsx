import { useApp } from "@/lib/store";
import type { Video } from "@/types";
import { VideoCard } from "@/components/Video";
import { Avatar, Badge, SectionHeader, VerifiedBadge } from "@/components/ui";
import { HeroGlyph, Icon } from "@/components/Icons";
import { formatNumber, safeImageUrl } from "@/lib/security";
import { HERO_IMAGE } from "@/data";
import { cn } from "@/utils/cn";

export function HomePage({ onOpenVideo }: { onOpenVideo: (video: Video) => void }) {
  const {
    content,
    data,
    navigate,
    currentUser,
    setAuthOpen,
    toggleSubscribe,
    myChannel,
  } = useApp();
  const a = content.appearance;
  const latest = [...content.videos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  const featuredVideos = latest.slice(0, 3);
  const heroes = content.lore.filter((l) => l.category === "Bohaterowie").slice(0, 4);
  const featuredLore = content.lore.find((l) => l.id === "l_motyl") ?? content.lore[1];
  const creators = content.channels.filter((c) => c.id !== "ch_originals").slice(0, 3);
  const members = data.users.filter((u) => u.channelId).slice(0, 4);
  const topChannels = [...content.channels].sort((a, b) => b.subscribers - a.subscribers).slice(0, 3);
  const totalSubs = content.channels.reduce((sum, c) => sum + c.subscribers, 0);
  const heroBg = safeImageUrl(a.heroImage, true) ?? HERO_IMAGE;

  const handleCreatorSubscribe = (channelId: string) => {
    const result = toggleSubscribe(channelId);
    if (!result.ok && result.reason === "auth") setAuthOpen(true);
  };

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[clamp(22px,4vw,34px)] bg-[var(--brand)] text-white shadow-[0_18px_50px_-24px_rgba(12,59,46,.7)]">
        <div
          className="absolute inset-0 bg-cover bg-[position:70%_28%] sm:bg-[position:center_28%]"
          style={{ backgroundImage: `url(${heroBg})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--brand) 97%, #000) 0%, color-mix(in srgb, var(--brand) 92%, #000) 35%, color-mix(in srgb, var(--brand) 45%, transparent) 70%, color-mix(in srgb, var(--brand) 14%, transparent) 100%)" }} />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(4,24,18,.8)_0%,transparent_45%)]" />
        {a.graffiti && <div className="graffiti-dots absolute inset-0 opacity-20" />}
        <div className="absolute -left-12 top-20 h-52 w-52 rounded-full bg-[var(--accent)]/10 blur-2xl" />
        <div className="absolute right-6 top-6 hidden rotate-[-5deg] rounded-xl border-2 border-[var(--accent)] bg-[var(--brand)]/80 px-3 py-2 text-center backdrop-blur sm:block">
          <span className="block font-marker text-sm leading-none text-[var(--accent)]">FAN-MADE</span>
          <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.2em] text-white/60">with love</span>
        </div>

        <div className="relative flex min-h-[500px] flex-col justify-end px-5 pb-8 pt-20 sm:min-h-[510px] sm:px-8 sm:pb-10 lg:min-h-[470px] lg:max-w-[760px] lg:justify-center lg:px-12 lg:py-12">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/35 bg-[var(--accent)]/12 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)] backdrop-blur">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-80" /><span className="relative h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /></span>
              {a.heroBadge}
            </span>
            <h1 className="text-balance mt-4 max-w-[620px] font-display text-[2.35rem] font-extrabold leading-[0.98] tracking-[-0.05em] sm:text-[3.2rem] lg:text-[3.55rem]">
              {a.heroTitle}
            </h1>
            <p className="mt-4 max-w-[480px] text-[13px] leading-relaxed text-white/70 sm:text-sm">
              {a.heroSubtitle}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <button type="button" onClick={() => navigate("lore")} className="btn-primary !px-5 !py-3 text-[12px]">
                <Icon name="butterfly" size={16} /> {a.heroPrimaryCta}
              </button>
              <button type="button" onClick={() => navigate("videos")} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-[12px] font-bold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/15">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[var(--brand)]"><Icon name="play" size={10} filled /></span>
                Zobacz najnowsze wideo
              </button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center">
                {members.map((m, i) => (
                  <Avatar key={m.id} src={safeImageUrl(m.avatar) ?? ""} name={m.name} size={26} className={cn("border-2 border-[var(--brand)]", i > 0 && "-ml-2")} />
                ))}
                <span className="-ml-2 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-[var(--brand)] bg-[var(--accent)] text-[8px] font-extrabold text-[var(--accent-ink)]">+12k</span>
              </div>
              <div className="h-7 w-px bg-white/15" />
              <p className="text-[10px] leading-tight text-white/55"><span className="block font-bold text-white">Fandom rośnie razem z Tobą.</span> {formatNumber(totalSubs)} subskrypcji kanałów</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 right-5 hidden items-end gap-2 xl:flex">
          {featuredVideos.slice(0, 2).map((video, i) => (
            <button key={video.id} type="button" onClick={() => onOpenVideo(video)} className={cn("group w-[176px] overflow-hidden rounded-xl border border-white/15 bg-white/10 text-left backdrop-blur-md transition hover:-translate-y-1 hover:border-[var(--accent)]/50", i === 1 && "hidden xl:block")}>
              <div className="relative aspect-video">
                <img src={video.thumbnail} alt="" className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/15"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]"><Icon name="play" size={13} filled /></span></span>
              </div>
              <div className="p-2.5"><p className="line-clamp-1 text-[10px] font-bold">{video.title}</p><p className="mt-0.5 text-[8px] text-white/50">Nowość · {video.duration}</p></div>
            </button>
          ))}
        </div>
      </section>

      {/* QUICK NAV */}
      <div className="no-scrollbar -mt-2 flex gap-2 overflow-x-auto pb-1">
        {[
          { label: "Wszystkie wideo", icon: "playCircle" as const, page: "videos" as const },
          { label: "Lore bohaterów", icon: "butterfly" as const, page: "lore" as const },
          { label: "Historia świata", icon: "clock" as const, page: "history" as const },
          { label: "Poznaj aktorów", icon: "users" as const, page: "actors" as const },
          { label: "Twórcy fandomu", icon: "community" as const, page: "community" as const },
        ].map((item) => (
          <button key={item.label} type="button" onClick={() => navigate(item.page)} className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-[11px] font-bold text-[var(--ink)]/80 transition hover:border-[var(--brand)] hover:text-[var(--brand)]">
            <Icon name={item.icon} size={14} className="text-[var(--brand-2)]" /> {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="latest-videos">
            <div id="latest-videos">
              <SectionHeader eyebrow="Świeżo z dachów" title="Najnowsze w fandomie" description="Nowe odcinki, analizy i materiały od twórców MiraVoice." action={<button type="button" onClick={() => navigate("videos")} className="btn-outline !px-3.5 !py-2 text-[11px]">Wszystkie <Icon name="arrowRight" size={13} /></button>} />
            </div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
              {latest.map((video, i) => <VideoCard key={video.id} video={video} onOpen={onOpenVideo} index={i} />)}
            </div>
          </section>

          <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)]">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] p-4 sm:p-5">
              <div>
                <p className="mb-1 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-2)]"><Icon name="butterfly" size={13} /> Kompendium mocy</p>
                <h2 className="font-display text-xl font-extrabold">Poznaj bohaterów</h2>
              </div>
              <button type="button" onClick={() => navigate("lore")} className="flex items-center gap-1 text-[11px] font-bold text-[var(--brand-2)] hover:underline">Całe lore <Icon name="arrowUpRight" size={12} /></button>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[var(--line)] sm:grid-cols-4">
              {heroes.map((hero) => (
                <button key={hero.id} type="button" onClick={() => navigate("lore")} className="group relative overflow-hidden bg-[var(--surface)] p-4 text-left transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,var(--surface))]">
                  <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-10 transition group-hover:scale-150 group-hover:opacity-20" style={{ background: hero.color }} />
                  <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm transition group-hover:-rotate-6" style={{ background: hero.color }}>
                    <HeroGlyph glyph={hero.glyph} size={28} color="#fff" />
                  </div>
                  <p className="text-[13px] font-extrabold leading-tight">{hero.name}</p>
                  <p className="mt-0.5 text-[10px] font-medium text-[var(--muted)]">{hero.power}</p>
                  <div className="mt-3 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-[var(--brand-2)] opacity-0 transition group-hover:opacity-100">Otwórz lore <Icon name="arrowUpRight" size={10} /></div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4">
          <div className="relative overflow-hidden rounded-[var(--radius)] bg-[var(--brand)] p-5 text-white">
            <div className="graffiti-dots absolute inset-0 opacity-20" />
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[18px] border-[var(--accent)] opacity-20" />
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[var(--accent)]"><Icon name="users" size={12} /> Twój fanklub</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[8px] font-bold text-white/60">ONLINE</span>
            </div>
            <p className="relative mt-3 font-display text-2xl font-extrabold leading-tight">{currentUser ? `Cześć, ${currentUser.name.split(" ")[0]}!` : "Zostań częścią ekipy."}</p>
            <p className="relative mt-1.5 text-[11px] leading-relaxed text-white/60">
              {currentUser ? (myChannel ? "Twój kanał czeka na nowy materiał. Co dziś pokażesz fandomowi?" : "Masz konto. Czas na własny kanał i pierwszy materiał.") : "Dołącz, aby subskrybować twórców, komentować i zbierać własnych widzów."}
            </p>
            <button type="button" onClick={() => (currentUser ? navigate("studio") : setAuthOpen(true))} className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-3 py-2.5 text-[11px] font-extrabold text-[var(--accent-ink)] transition hover:brightness-105">
              {currentUser ? (myChannel ? "Otwórz Studio twórcy" : "Załóż swój kanał") : "Dołącz przez Google"} <Icon name="arrowRight" size={13} />
            </button>
            <div className="relative mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <div><p className="font-display text-sm font-extrabold">{formatNumber(totalSubs + 8)}</p><p className="text-[8px] uppercase tracking-wider text-white/45">fanów razem</p></div>
              <div><p className="font-display text-sm font-extrabold">{content.videos.length}</p><p className="text-[8px] uppercase tracking-wider text-white/45">materiałów</p></div>
              <div><p className="font-display text-sm font-extrabold">{content.channels.length}</p><p className="text-[8px] uppercase tracking-wider text-white/45">kanałów</p></div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <h3 className="font-display text-sm font-extrabold">Top kanały</h3>
              <button type="button" onClick={() => navigate("community")} className="text-[10px] font-bold text-[var(--brand-2)] hover:underline">Zobacz</button>
            </div>
            <div className="divide-y divide-[var(--line)] px-2 pb-2">
              {topChannels.map((channel, i) => {
                const sub = data.subscriptions[channel.id];
                return (
                  <div key={channel.id} className="flex items-center gap-2.5 px-2 py-2.5">
                    <span className="w-3 text-center font-display text-[10px] font-extrabold text-[var(--muted)]">{i + 1}</span>
                    <Avatar src={channel.avatar} name={channel.name} size={31} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-[11px] font-bold">{channel.name} {channel.verified && <VerifiedBadge />}</p>
                      <p className="truncate text-[9px] text-[var(--muted)]">{formatNumber(channel.subscribers)} subskrybentów</p>
                    </div>
                    <button type="button" onClick={() => handleCreatorSubscribe(channel.id)} className={cn("rounded-full px-2 py-1 text-[9px] font-extrabold transition", sub ? "bg-[color-mix(in_srgb,var(--brand)_8%,var(--surface))] text-[var(--brand)]" : "bg-[var(--ink)] text-white hover:bg-[var(--brand)]")}>
                      {sub ? "✓" : "Sub"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {featuredLore && (
            <button type="button" onClick={() => navigate("lore")} className="group relative w-full overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-4 text-left transition hover:border-[var(--brand)]">
              <div className="flex items-center justify-between">
                <Badge tone="soft"><Icon name="book" size={11} /> Lore tygodnia</Badge>
                <Icon name="arrowUpRight" size={15} className="text-[var(--muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: featuredLore.accent, color: featuredLore.color }}><HeroGlyph glyph={featuredLore.glyph} size={26} color={featuredLore.color} /></span>
                <div className="min-w-0"><p className="text-sm font-extrabold">{featuredLore.name}</p><p className="text-[10px] text-[var(--muted)]">{featuredLore.power} · {featuredLore.kwami}</p></div>
              </div>
              <p className="mt-2.5 line-clamp-2 text-[10.5px] leading-relaxed text-[var(--muted)]">{featuredLore.description}</p>
            </button>
          )}

          <div className="rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-4">
            <h3 className="mb-2.5 flex items-center gap-1.5 font-display text-sm font-extrabold"><Icon name="sparkles" size={14} className="text-[var(--brand-2)]" /> Gorące tematy</h3>
            <div className="flex flex-wrap gap-1.5">
              {["#Biedronka", "#Kwami", "#S06", "#fanfilm", "#teorie", "#Nooroo"].map((tag) => (
                <button key={tag} type="button" onClick={() => navigate("lore")} className="rounded-full bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] px-2.5 py-1 text-[10px] font-semibold text-[var(--brand)] transition hover:bg-[var(--accent)]">{tag}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* CREATORS */}
      <section>
        <SectionHeader
          eyebrow="Twórcy społeczności"
          title="Kanały, które warto znać"
          description="Analizy, teorie i fan filmy. Subskrybuj i włącz dzwonek, żeby nie przegapić nowości."
          action={<button type="button" onClick={() => navigate("community")} className="btn-outline !px-3.5 !py-2 text-[11px]">Cała społeczność <Icon name="arrowRight" size={13} /></button>}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((channel) => {
            const sub = data.subscriptions[channel.id];
            return (
              <article key={channel.id} className="card group overflow-hidden">
                <div className="relative h-24 overflow-hidden bg-[var(--brand)]">
                  {channel.cover ? <img src={channel.cover} alt="" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)]" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand)]/80 to-transparent" />
                  <Badge tone="accent" className="absolute right-2.5 top-2.5 !text-[9px]">{channel.category}</Badge>
                </div>
                <div className="-mt-6 px-4 pb-4">
                  <Avatar src={channel.avatar} name={channel.name} size={48} ring />
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="flex items-center gap-1 truncate text-sm font-extrabold">{channel.name} {channel.verified && <VerifiedBadge />}</h3>
                      <p className="text-[10px] text-[var(--muted)]">{channel.handle} · {formatNumber(channel.subscribers)} subskrybentów</p>
                    </div>
                    <button type="button" onClick={() => handleCreatorSubscribe(channel.id)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold transition", sub ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "bg-[var(--ink)] text-white hover:bg-[var(--brand)]")}>
                      {sub ? "Subskrybujesz" : "Subskrybuj"}
                    </button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">{channel.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* HISTORY TEASER */}
      <section className="grid gap-4 overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 lg:grid-cols-[290px_1fr]">
        <div>
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-2)]">Archiwum legend</p>
          <h2 className="font-display text-2xl font-extrabold leading-tight">Historia, która wciąż się pisze.</h2>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">Od pierwszych Kwami przez Zakon Strażników, aż po nowe historie fandomu.</p>
          <button type="button" onClick={() => navigate("history")} className="btn-dark mt-4 !px-4 !py-2.5 text-[11px]">Otwórz historię <Icon name="arrowRight" size={13} /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {content.history.slice(-3).map((event, i) => (
            <button key={event.id} type="button" onClick={() => navigate("history")} className="relative rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface))] p-3.5 text-left transition hover:border-[var(--brand)]">
              <span className="absolute right-3 top-3 font-display text-2xl font-extrabold text-[var(--line)]">0{i + 1}</span>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[var(--brand-2)]">{event.year}</p>
              <p className="mt-1.5 text-xs font-extrabold leading-snug">{event.title}</p>
              <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[var(--muted)]">{event.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-[var(--radius)] bg-[var(--brand)] px-5 py-8 text-white sm:px-8 sm:py-10">
        <div className="graffiti-dots absolute inset-0 opacity-25" />
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_40%,var(--accent),transparent_60%)] opacity-15" />
        <span className="absolute right-8 top-6 hidden rotate-6 font-marker text-5xl text-[var(--accent)]/20 sm:block">create!</span>
        <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-[var(--accent)]"><Icon name="crown" size={11} /> Twoja scena</span>
            <h2 className="mt-3 text-balance font-display text-2xl font-extrabold leading-tight sm:text-3xl">Twoja historia.<br /><span className="text-[var(--accent)]">Twój kanał.</span> Twój fandom.</h2>
            <p className="mt-2 max-w-md text-[12px] leading-relaxed text-white/60">Załóż kanał przez konto Google, dodaj wideo i zbieraj subskrypcje. Bez zbędnych formalności, z pełnym wsparciem ekipy.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button type="button" onClick={() => navigate("studio")} className="btn-primary !px-5 !py-3 text-xs"><Icon name="plus" size={15} /> Załóż swój kanał</button>
            <button type="button" onClick={() => navigate("about")} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/10">Poznaj zasady</button>
          </div>
        </div>
      </section>
    </div>
  );
}
