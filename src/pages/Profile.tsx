import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import type { Video } from "@/types";
import { Avatar, Badge, EmptyState, PageHero, VerifiedBadge } from "@/components/ui";
import { VideoCard } from "@/components/Video";
import { Icon } from "@/components/Icons";
import { formatNumber } from "@/lib/security";
import { cn } from "@/utils/cn";

const tabs = [
  { id: "przeglad", label: "Przegląd", icon: "home" as const },
  { id: "subskrypcje", label: "Subskrypcje", icon: "users" as const },
  { id: "zapisane", label: "Zapisane", icon: "bookmark" as const },
  { id: "konto", label: "Konto i dane", icon: "shield" as const },
];

export function ProfilePage({ onOpenVideo }: { onOpenVideo: (video: Video) => void }) {
  const {
    currentUser, myChannel, data, content, navigate, setAuthOpen, signOut,
    toggleSubscribe, toggleChannelNotifications, notify,
  } = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("przeglad");

  const saved = useMemo(() => content.videos.filter((v) => data.savedVideos.includes(v.id)), [content.videos, data.savedVideos]);
  const liked = useMemo(() => content.videos.filter((v) => data.likedVideos.includes(v.id)), [content.videos, data.likedVideos]);
  const subscribedChannels = content.channels.filter((c) => data.subscriptions[c.id]);
  const unread = data.notifications.filter((n) => !n.read).length;

  if (!currentUser) {
    return (
      <div className="space-y-5">
        <PageHero eyebrow="Twoje konto" title="Tu zaczyna się Twoja historia w fandomie." description="Zaloguj się, żeby zobaczyć subskrypcje, zapisane materiały i powiadomienia. Wszystko w jednym, prywatnym miejscu." icon="user">
          <button type="button" onClick={() => setAuthOpen(true)} className="btn-primary !px-4 !py-2.5 text-[11px]"><Icon name="google" size={14} filled /> Zaloguj się przez Google</button>
        </PageHero>
        <EmptyState icon="user" title="Nie jesteś jeszcze zalogowany" description="Konto demo tworzysz jednym kliknięciem. Zapisujemy je tylko w Twojej przeglądarce — bez maili i bez haseł." action={<button type="button" onClick={() => setAuthOpen(true)} className="btn-primary !py-2.5 text-xs">Utwórz / wybierz konto</button>} />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "bookmark" as const, title: "Zapisane wideo", text: "Wróć do teorii i analiz, kiedy masz czas." },
            { icon: "bell" as const, title: "Powiadomienia", text: "Decydujesz, które kanały mają do Ciebie pisać." },
            { icon: "palette" as const, title: "Twój wygląd", text: "Wybrane przez Ciebie ustawienia zostają na urządzeniu." },
          ].map((item) => <div key={item.title} className="card p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_28%,var(--surface))] text-[var(--brand)]"><Icon name={item.icon} size={17} /></span><p className="mt-2.5 text-xs font-extrabold">{item.title}</p><p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">{item.text}</p></div>)}
        </div>
      </div>
    );
  }

  const downloadData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: { name: currentUser.name, email: currentUser.email, channel: myChannel?.handle ?? null },
      subscriptions: data.subscriptions,
      savedVideos: data.savedVideos,
      likedVideos: data.likedVideos,
      comments: Object.values(data.comments).flat().filter((c) => c.authorId === currentUser.id),
      notice: "Eksport danych z lokalnej wersji demo MiraVoice.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "miravoice-moje-dane.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Twoje dane demo zostały pobrane.");
  };

  return (
    <div className="space-y-5">
      <PageHero eyebrow="Twoja przestrzeń" title={`Cześć, ${currentUser.name.split(" ")[0]}.`} description="Twoje subskrypcje, materiały i prywatność. Zapanuj nad powiadomieniami i wróć do tego, co ważne." icon="user">
        <div className="flex flex-wrap gap-2">
          <Badge className="!bg-white/15 !text-white"><Icon name="bell" size={11} /> {unread} nowych powiadomień</Badge>
          <Badge className="!bg-white/15 !text-white"><Icon name="users" size={11} /> {subscribedChannels.length} subskrypcji</Badge>
          <button type="button" onClick={() => navigate("studio")} className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-[10px] font-extrabold text-[var(--accent-ink)]"><Icon name="film" size={12} /> {myChannel ? "Studio twórcy" : "Załóż kanał"}</button>
        </div>
      </PageHero>

      <section className="card overflow-hidden">
        <div className="relative h-24 bg-[var(--brand)] sm:h-28">
          {myChannel?.cover && <img src={myChannel.cover} alt="" className="h-full w-full object-cover opacity-60" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] to-transparent" />
        </div>
        <div className="px-4 pb-4">
          <div className="-mt-8 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-3">
              <Avatar src={currentUser.avatar} name={currentUser.name} size={66} ring className="border-4 border-[var(--surface)]" />
              <div className="pb-0.5"><h2 className="font-display text-xl font-extrabold leading-tight">{currentUser.name}</h2><p className="text-[10px] text-[var(--muted)]">{currentUser.email} · konto lokalne</p></div>
            </div>
            <div className="flex gap-2">
              {myChannel && <button type="button" onClick={() => navigate("studio")} className="btn-outline !py-2 text-[10px]"><Icon name="edit" size={12} /> Edytuj kanał</button>}
              <button type="button" onClick={signOut} className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-[10px] font-bold text-red-600 transition hover:bg-red-50"><Icon name="logout" size={12} /> Wyloguj</button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {myChannel ? <><Badge tone="soft"><Icon name="film" size={10} /> {myChannel.handle}</Badge><Badge tone="outline">{myChannel.category}</Badge><Badge tone="accent">{formatNumber(myChannel.subscribers)} subskrybentów</Badge></> : <Badge tone="outline">fan bez kanału</Badge>}
            <Badge tone="soft"><Icon name="lock" size={10} /> sesja lokalna</Badge>
          </div>
        </div>
      </section>

      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-full border border-[var(--line)] bg-[var(--surface)] p-1">
        {tabs.map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn("flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold transition", tab === item.id ? "bg-[var(--brand)] text-white" : "text-[var(--muted)] hover:text-[var(--ink)]")}><Icon name={item.icon} size={13} /> {item.label}</button>
        ))}
      </div>

      {tab === "przeglad" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-base font-extrabold">Kontynuuj oglądanie</h2><span className="text-[9px] text-[var(--muted)]">{saved.length + liked.length} zapisanych</span></div>
              {saved.length > 0 ? <div className="grid gap-4 sm:grid-cols-2">{saved.slice(0, 2).map((v, i) => <VideoCard key={v.id} video={v} onOpen={onOpenVideo} index={i} />)}</div> : <EmptyState icon="bookmark" title="Twoja lista jest pusta" description="Kliknij zakładkę przy filmie, aby zapisać go na później." action={<button type="button" onClick={() => navigate("videos")} className="btn-outline !py-2 text-[10px]">Przejdź do wideo</button>} />}
            </div>
            <div className="card p-4">
              <h2 className="font-display text-base font-extrabold">Najnowsze w Twoich kanałach</h2>
              {subscribedChannels.length ? <div className="mt-2 divide-y divide-[var(--line)]">{content.videos.filter((v) => data.subscriptions[v.channelId]).slice(0, 3).map((v) => <VideoCard key={v.id} video={v} onOpen={onOpenVideo} variant="row" />)}</div> : <p className="mt-2 text-[11px] text-[var(--muted)]">Nie subskrybujesz jeszcze żadnego kanału. <button type="button" onClick={() => navigate("community")} className="font-bold text-[var(--brand-2)] hover:underline">Zobacz twórców</button></p>}
            </div>
          </div>
          <aside className="space-y-3">
            <div className="card p-4">
              <h3 className="font-display text-sm font-extrabold">Twoje liczby</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[{ v: formatNumber(subscribedChannels.length), l: "subskrypcji" }, { v: formatNumber(data.savedVideos.length), l: "zapisanych" }, { v: formatNumber(data.likedVideos.length), l: "polubień" }, { v: formatNumber(myChannel?.subscribers ?? 0), l: "widzów kanału" }].map((s) => <div key={s.l} className="rounded-xl bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] p-2.5"><p className="font-display text-lg font-extrabold">{s.v}</p><p className="text-[8px] font-bold uppercase tracking-wider text-[var(--muted)]">{s.l}</p></div>)}
              </div>
            </div>
            <div className="rounded-[var(--radius)] bg-[var(--brand)] p-4 text-white">
              <Icon name="shield" size={19} className="text-[var(--accent)]" />
              <h3 className="mt-1.5 font-display text-base font-extrabold">Prywatność przede wszystkim</h3>
              <p className="mt-1 text-[10px] leading-relaxed text-white/60">Nie wysyłamy Twoich danych na serwer. Konto, historia i ustawienia żyją tylko w tej przeglądarce.</p>
              <button type="button" onClick={() => setTab("konto")} className="mt-2 text-[10px] font-bold text-[var(--accent)] underline underline-offset-2">Zarządzaj danymi</button>
            </div>
            <div className="card flex items-center gap-2 p-3.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_28%,var(--surface))] text-[var(--brand)]"><Icon name="lock" size={15} /></span>
              <div className="min-w-0 flex-1"><p className="text-[10px] font-extrabold">Panel administratora</p><p className="text-[8.5px] text-[var(--muted)]">Osobne logowanie z limitem prób</p></div>
              <button type="button" onClick={() => navigate("admin")} className="text-[9px] font-bold text-[var(--brand-2)] hover:underline">Otwórz</button>
            </div>
          </aside>
        </div>
      )}

      {tab === "subskrypcje" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between"><div><h2 className="font-display text-lg font-extrabold">Subskrybowane kanały</h2><p className="text-[10px] text-[var(--muted)]">Dzwonek decyduje o powiadomieniach. Możesz go włączyć lub wyłączyć osobno.</p></div></div>
          {subscribedChannels.length === 0 ? <EmptyState icon="users" title="Nie masz subskrypcji" description="Twórcy czekają w sekcji społeczności. Wybierz kanały, które chcesz obserwować." action={<button type="button" onClick={() => navigate("community")} className="btn-primary !py-2.5 text-xs">Odkrywaj kanały</button>} /> : (
            <div className="space-y-2">
              {subscribedChannels.map((channel) => {
                const subscription = data.subscriptions[channel.id];
                return (
                  <div key={channel.id} className="card flex flex-wrap items-center gap-3 p-3">
                    <Avatar src={channel.avatar} name={channel.name} size={44} />
                    <div className="min-w-0 flex-1"><p className="flex items-center gap-1 text-xs font-extrabold">{channel.name} {channel.verified && <VerifiedBadge />}</p><p className="text-[9px] text-[var(--muted)]">{channel.handle} · {formatNumber(channel.subscribers)} subskrybentów · od {new Date(subscription.since).toLocaleDateString("pl-PL")}</p></div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => toggleChannelNotifications(channel.id)} className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-2 text-[9px] font-bold", subscription.notifications ? "border-[var(--brand)] bg-[var(--accent)] text-[var(--accent-ink)]" : "border-[var(--line)] text-[var(--muted)]")} aria-label="Powiadomienia">{<Icon name={subscription.notifications ? "bell" : "bellOff"} size={12} />} {subscription.notifications ? "Dzwonek wł." : "Dzwonek wył."}</button>
                      <button type="button" onClick={() => toggleSubscribe(channel.id)} className="rounded-full border border-[var(--line)] px-2.5 py-2 text-[9px] font-bold text-[var(--muted)] hover:border-red-200 hover:text-red-600">Usuń</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "zapisane" && (
        <div className="space-y-4">
          {saved.length === 0 ? <EmptyState icon="bookmark" title="Brak zapisanych materiałów" description="Zapisuj wideo, żeby wrócić do nich później." action={<button type="button" onClick={() => navigate("videos")} className="btn-primary !py-2.5 text-xs">Przeglądaj wideo</button>} /> : <div className="card p-3 sm:p-4"><h2 className="mb-2 font-display text-base font-extrabold">Na później ({saved.length})</h2>{saved.map((v) => <VideoCard key={v.id} video={v} onOpen={onOpenVideo} variant="row" />)}</div>}
          {liked.length > 0 && <div className="card p-3 sm:p-4"><h2 className="mb-2 font-display text-base font-extrabold">Polubione ({liked.length})</h2>{liked.map((v) => <VideoCard key={v.id} video={v} onOpen={onOpenVideo} variant="row" />)}</div>}
        </div>
      )}

      {tab === "konto" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="card p-4 sm:p-5">
              <h2 className="font-display text-base font-extrabold">Konto i bezpieczeństwo</h2>
              <div className="mt-3 space-y-2">
                {[{ l: "Imię i nazwisko", v: currentUser.name }, { l: "Adres e-mail", v: currentUser.email }, { l: "Metoda logowania", v: "Google — tryb demo" }, { l: "Identyfikator", v: currentUser.id }].map((row) => <div key={row.l} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--line)] px-3 py-2.5"><span className="text-[10px] font-semibold text-[var(--muted)]">{row.l}</span><span className="max-w-full truncate text-[11px] font-bold">{row.v}</span></div>)}
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-[9px] leading-relaxed text-[var(--muted)]"><Icon name="info" size={11} className="mt-0.5 shrink-0" /> W tej wersji nie używamy prawdziwego OAuth. Sesja to konto testowe zapisane lokalnie — nie podawaj tu prawdziwych haseł.</p>
            </div>
            <div className="card p-4 sm:p-5">
              <h2 className="font-display text-base font-extrabold">Powiadomienia</h2>
              <p className="mt-1 text-[10px] text-[var(--muted)]">Zarządzaj dzwonkami przy konkretnych kanałach.</p>
              <div className="mt-2 divide-y divide-[var(--line)]">
                {subscribedChannels.length ? subscribedChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center gap-2.5 py-2.5">
                    <Avatar src={channel.avatar} name={channel.name} size={30} />
                    <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold">{channel.name}</p><p className="text-[8.5px] text-[var(--muted)]">nowe wideo i aktywność</p></div>
                    <button type="button" onClick={() => toggleChannelNotifications(channel.id)} className={cn("relative h-6 w-11 rounded-full transition", data.subscriptions[channel.id]?.notifications ? "bg-[var(--brand)]" : "bg-[var(--line)]")} aria-label={`Powiadomienia ${channel.name}`}>
                      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full transition", data.subscriptions[channel.id]?.notifications ? "left-[22px] bg-[var(--accent)]" : "left-0.5 bg-white shadow")} />
                    </button>
                  </div>
                )) : <p className="py-3 text-[10px] text-[var(--muted)]">Brak kanałów. Subskrybuj twórcę, żeby zarządzać powiadomieniami.</p>}
              </div>
            </div>
          </div>
          <aside className="space-y-3">
            <div className="card p-4">
              <h3 className="text-xs font-extrabold">Twoje dane</h3>
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">Pobierz kopię swoich ustawień i aktywności. Plik JSON jest generowany w przeglądarce.</p>
              <button type="button" onClick={downloadData} className="btn-outline mt-3 w-full !py-2.5 text-[10px]"><Icon name="download" size={13} /> Eksportuj dane</button>
              <button type="button" onClick={() => navigate("security")} className="btn-ghost mt-1 w-full !py-2 text-[10px]">Centrum bezpieczeństwa <Icon name="chevronRight" size={11} /></button>
            </div>
            <div className="rounded-[var(--radius)] bg-[var(--brand)] p-4 text-white">
              <Icon name="alert" size={18} className="text-[var(--accent)]" />
              <h3 className="mt-1.5 font-display text-base font-extrabold">Sesja demo</h3>
              <p className="mt-1 text-[10px] leading-relaxed text-white/60">Aby usunąć swoje konto z tego urządzenia, wyloguj się i wyczyść dane witryny w przeglądarce. Produkcyjnie potrzebujemy backendu z prawdziwą autoryzacją.</p>
              <button type="button" onClick={signOut} className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[var(--accent)]"><Icon name="logout" size={12} /> Wyloguj się</button>
            </div>
            <div className="card p-4"><h3 className="text-xs font-extrabold">Administrator?</h3><p className="mt-1 text-[9px] text-[var(--muted)]">Panel treści i wyglądu ma osobne hasło.</p><button type="button" onClick={() => navigate("admin")} className="btn-dark mt-2 w-full !py-2 text-[10px]"><Icon name="lock" size={12} /> Panel administratora</button></div>
          </aside>
        </div>
      )}
    </div>
  );
}
