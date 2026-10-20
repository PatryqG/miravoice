import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import type { Channel, Video } from "@/types";
import { Avatar, Badge, EmptyState, Modal, PageHero, VerifiedBadge } from "@/components/ui";
import { VideoCard } from "@/components/Video";
import { Icon } from "@/components/Icons";
import { formatNumber } from "@/lib/security";
import { cn } from "@/utils/cn";

export function CommunityPage({ onOpenVideo }: { onOpenVideo: (video: Video) => void }) {
  const {
    content, data, currentUser, myChannel, navigate, setAuthOpen,
    toggleSubscribe, toggleChannelNotifications,
  } = useApp();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"popularne" | "najnowsze">("popularne");
  const [selected, setSelected] = useState<Channel | null>(null);

  const channels = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.channels
      .filter((c) => !q || `${c.name} ${c.handle} ${c.description} ${c.category}`.toLowerCase().includes(q))
      .sort((a, b) => (sort === "popularne" ? b.subscribers - a.subscribers : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [content.channels, query, sort]);

  const subscribed = content.channels.filter((c) => data.subscriptions[c.id]);
  const subscribedFeed = content.videos.filter((v) => data.subscriptions[v.channelId]).slice(0, 4);
  const ownChannel = myChannel;

  const subscribe = (channelId: string) => {
    const result = toggleSubscribe(channelId);
    if (!result.ok && result.reason === "auth") setAuthOpen(true);
  };

  const selectedVideos = selected ? content.videos.filter((v) => v.channelId === selected.id) : [];

  return (
    <div className="space-y-7">
      <PageHero
        eyebrow="Społeczność MiraVoice"
        title="Tu fandom tworzy własne odcinki."
        description="Zakładaj kanały, subskrybuj twórców i włączaj powiadomienia. Każdy ma prawo do swojego głosu — pod warunkiem, że szanuje innych."
        icon="community"
      >
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate("studio")} className="btn-primary !px-3.5 !py-2 text-[10px]"><Icon name="plus" size={13} /> Załóż kanał</button>
          <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold"><Icon name="users" size={12} /> {content.channels.length} kanałów</span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold"><Icon name="bell" size={12} /> powiadomienia włączane osobno</span>
        </div>
      </PageHero>

      <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
        <div className="relative">
          <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input value={query} onChange={(e) => setQuery(e.target.value.slice(0, 80))} placeholder="Znajdź kanał, twórcę lub temat…" className="field !rounded-full !py-3 pl-11 pr-4 text-xs" aria-label="Szukaj kanału" />
        </div>
        <div className="flex items-center gap-2">
          <select value={sort} onChange={(e) => setSort(e.target.value as "popularne" | "najnowsze")} className="field !py-2.5 text-[11px] font-bold" aria-label="Sortuj kanały">
            <option value="popularne">Najpopularniejsze</option>
            <option value="najnowsze">Najnowsze</option>
          </select>
          <span className="shrink-0 text-[10px] font-semibold text-[var(--muted)]">{channels.length} wyników</span>
        </div>
      </div>

      {currentUser && (
        <section className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,var(--accent),transparent_70%)] opacity-20" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar src={ownChannel?.avatar || currentUser.avatar} name={currentUser.name} size={48} ring />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--brand-2)]">Twoja przestrzeń</p>
              <h2 className="truncate font-display text-lg font-extrabold">{ownChannel ? ownChannel.name : `Cześć, ${currentUser.name.split(" ")[0]}!`}</h2>
              <p className="mt-0.5 text-[11px] text-[var(--muted)]">{ownChannel ? `${ownChannel.handle} · ${formatNumber(ownChannel.subscribers)} subskrybentów` : "Nie masz jeszcze kanału. To zajmie mniej niż minutę."}</p>
            </div>
            <div className="flex gap-2">
              {ownChannel && <button type="button" onClick={() => setSelected(ownChannel)} className="btn-outline !py-2.5 text-[10px]">Mój kanał</button>}
              <button type="button" onClick={() => navigate("studio")} className="btn-primary !py-2.5 text-[10px]">{ownChannel ? "Dodaj wideo" : "Załóż kanał"} <Icon name="arrowRight" size={12} /></button>
            </div>
          </div>
        </section>
      )}

      {!currentUser && (
        <section className="flex flex-col items-start justify-between gap-4 rounded-[var(--radius)] bg-[var(--brand)] p-5 text-white sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-ink)]"><Icon name="crown" size={20} /></span>
            <div><h2 className="font-display text-lg font-extrabold">Twoje subskrypcje czekają.</h2><p className="mt-0.5 text-[11px] text-white/60">Zaloguj się przez konto demo Google, żeby obserwować twórców i dostawać powiadomienia.</p></div>
          </div>
          <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary !py-2.5 text-[11px]"><Icon name="google" size={14} filled /> Zaloguj się</button>
        </section>
      )}

      {currentUser && subscribedFeed.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-ink)]"><Icon name="bell" size={13} /></span> Od Twoich twórców</h2>
            <span className="text-[10px] font-semibold text-[var(--muted)]">{subscribed.length} subskrypcji</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-4">
            {subscribedFeed.map((v, i) => <VideoCard key={v.id} video={v} onOpen={onOpenVideo} index={i} />)}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold">{query ? "Wyniki wyszukiwania" : "Kanały do odkrycia"}</h2>
          <span className="hidden items-center gap-1 text-[10px] font-semibold text-[var(--muted)] sm:flex"><Icon name="shield" size={12} /> moderowane przez społeczność</span>
        </div>
        {channels.length === 0 ? (
          <EmptyState icon="community" title="Nie znaleziono kanału" description="Spróbuj innej nazwy lub załóż pierwszy kanał z tą tematyką." action={<button type="button" onClick={() => navigate("studio")} className="btn-primary !py-2.5 text-xs">Załóż kanał</button>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {channels.map((channel) => {
              const sub = data.subscriptions[channel.id];
              const isMine = ownChannel?.id === channel.id;
              return (
                <article key={channel.id} className="card group overflow-hidden">
                  <button type="button" onClick={() => setSelected(channel)} className="relative block h-[104px] w-full overflow-hidden bg-[var(--brand)] text-left">
                    {channel.cover ? <img src={channel.cover} alt="" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)]" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#061b14]/80 to-transparent" />
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-black/25 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-white backdrop-blur">{channel.category}</span>
                    {isMine && <span className="absolute left-2.5 top-2.5 rounded-full bg-[var(--accent)] px-2 py-1 text-[8px] font-extrabold text-[var(--accent-ink)]">TWÓJ KANAŁ</span>}
                  </button>
                  <div className="-mt-6 px-4 pb-4">
                    <Avatar src={channel.avatar} name={channel.name} size={48} ring />
                    <div className="mt-2 flex items-start justify-between gap-2">
                      <button type="button" onClick={() => setSelected(channel)} className="min-w-0 text-left">
                        <h3 className="flex items-center gap-1 truncate text-sm font-extrabold">{channel.name} {channel.verified && <VerifiedBadge />}</h3>
                        <p className="truncate text-[10px] text-[var(--muted)]">{channel.handle} · {formatNumber(channel.subscribers)} subskrybentów</p>
                      </button>
                      {!isMine && (
                        <button type="button" onClick={() => subscribe(channel.id)} className={cn("shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold transition", sub ? "bg-[color-mix(in_srgb,var(--accent)_45%,var(--surface))] text-[var(--brand)]" : "bg-[var(--ink)] text-white hover:bg-[var(--brand)]")}>
                          {sub ? "✓ Subskrybujesz" : "Subskrybuj"}
                        </button>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 min-h-[32px] text-[11px] leading-relaxed text-[var(--muted)]">{channel.description}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-2.5">
                      <span className="text-[9px] text-[var(--muted)]">od {new Date(channel.createdAt).toLocaleDateString("pl-PL", { month: "short", year: "numeric" })}</span>
                      <div className="flex items-center gap-1">
                        {sub && (
                          <button type="button" onClick={() => toggleChannelNotifications(channel.id)} className={cn("flex h-7 w-7 items-center justify-center rounded-full border transition", sub.notifications ? "border-[var(--brand)] bg-[var(--accent)] text-[var(--accent-ink)]" : "border-[var(--line)] text-[var(--muted)]")} title={sub.notifications ? "Wyłącz powiadomienia" : "Włącz powiadomienia"} aria-label="Powiadomienia kanału">
                            <Icon name={sub.notifications ? "bell" : "bellOff"} size={12} />
                          </button>
                        )}
                        <button type="button" onClick={() => setSelected(channel)} className="flex items-center gap-0.5 rounded-full px-2 py-1 text-[9px] font-bold text-[var(--brand-2)] hover:bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))]">Kanał <Icon name="chevronRight" size={11} /></button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: "heart" as const, title: "Szacunek przede wszystkim", text: "Krytykuj materiał, nie człowieka. Hejt, mowa nienawiści i nękanie kończą się szybciej, niż myślisz." },
          { icon: "sparkles" as const, title: "Oznaczaj fanowskie treści", text: "Dodawaj własny wkład i informuj, gdy coś jest interpretacją lub teorią. Bądź fair wobec innych twórców." },
          { icon: "bell" as const, title: "Powiadomienia pod kontrolą", text: "Subskrypcja to nie spam. Dzwonek możesz wyłączyć w każdej chwili — u siebie i u twórcy." },
        ].map((item) => (
          <div key={item.title} className="card p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_25%,var(--surface))] text-[var(--brand)]"><Icon name={item.icon} size={17} /></span>
            <h3 className="mt-3 text-xs font-extrabold">{item.title}</h3>
            <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">{item.text}</p>
          </div>
        ))}
      </section>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name} wide>
        {selected && (
          <div>
            <div className="relative h-40 bg-[var(--brand)] sm:h-52">
              {selected.cover ? <img src={selected.cover} alt="" className="h-full w-full object-cover opacity-75" /> : <div className="h-full w-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)]" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <Badge tone="accent" className="absolute right-3 top-3">{selected.category}</Badge>
            </div>
            <div className="p-4 sm:p-6">
              <div className="-mt-11 flex flex-wrap items-end gap-3">
                <Avatar src={selected.avatar} name={selected.name} size={72} ring className="border-4 border-[var(--surface)]" />
                <div className="min-w-0 flex-1 pb-1">
                  <h2 className="flex items-center gap-1.5 font-display text-xl font-extrabold">{selected.name} {selected.verified && <VerifiedBadge />}</h2>
                  <p className="text-[11px] font-semibold text-[var(--muted)]">{selected.handle} · {formatNumber(selected.subscribers)} subskrybentów</p>
                </div>
                <div className="flex gap-2 pb-1">
                  {ownChannel?.id === selected.id ? (
                    <button type="button" onClick={() => { setSelected(null); navigate("studio"); }} className="btn-primary !py-2.5 text-[11px]"><Icon name="edit" size={13} /> Zarządzaj</button>
                  ) : (
                    <>
                      <button type="button" onClick={() => subscribe(selected.id)} className={cn("!py-2.5 text-[11px]", data.subscriptions[selected.id] ? "btn-outline" : "btn-dark")}>{data.subscriptions[selected.id] ? "Subskrybujesz" : "Subskrybuj"}</button>
                      {data.subscriptions[selected.id] && (
                        <button type="button" onClick={() => toggleChannelNotifications(selected.id)} className={cn("flex h-9 w-9 items-center justify-center rounded-full border", data.subscriptions[selected.id].notifications ? "border-[var(--brand)] bg-[var(--accent)] text-[var(--accent-ink)]" : "border-[var(--line)] text-[var(--muted)]")} aria-label="Powiadomienia"><Icon name={data.subscriptions[selected.id].notifications ? "bell" : "bellOff"} size={15} /></button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">{selected.description}</p>
              <div className="mt-5 border-t border-[var(--line)] pt-4">
                <h3 className="mb-3 flex items-center gap-2 font-display text-base font-extrabold"><Icon name="video" size={16} /> Wideo kanału <span className="text-[10px] font-medium text-[var(--muted)]">({selectedVideos.length})</span></h3>
                {selectedVideos.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedVideos.map((video) => <VideoCard key={video.id} video={video} onOpen={(v) => { setSelected(null); setTimeout(() => onOpenVideo(v), 0); }} variant="row" />)}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-[var(--line)] px-4 py-5 text-center text-xs text-[var(--muted)]">Ten kanał nie ma jeszcze wideo. Bądź pierwszy, który obejrzy nowość.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
