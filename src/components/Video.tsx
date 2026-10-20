import { useMemo, useState } from "react";
import type { Video } from "@/types";
import { SAMPLE_VIDEO } from "@/data";
import { useApp } from "@/lib/store";
import { formatNumber, sanitizeText, timeAgo } from "@/lib/security";
import { Avatar, Badge, ErrorNote, VerifiedBadge } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { cn } from "@/utils/cn";

export function VideoCard({
  video,
  onOpen,
  variant = "grid",
  index = 0,
}: {
  video: Video;
  onOpen: (video: Video) => void;
  variant?: "grid" | "rail" | "row";
  index?: number;
}) {
  const { content, data } = useApp();
  const channel = content.channels.find((c) => c.id === video.channelId);
  const saved = data.savedVideos.includes(video.id);
  const [broken, setBroken] = useState(false);

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={() => onOpen(video)}
        className="group flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))]"
      >
        <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl bg-[var(--brand)]">
          {!broken ? (
            <img src={video.thumbnail} alt="" loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] text-[var(--accent)]">
              <Icon name="play" size={22} />
            </div>
          )}
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">{video.duration}</span>
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-bold leading-snug">{video.title}</p>
          <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[var(--muted)]">
            {video.channelName}
            {channel?.verified && <VerifiedBadge />}
          </p>
          <p className="text-[11px] text-[var(--muted)]">{formatNumber(video.views)} wyśw. · {timeAgo(video.date)}</p>
        </div>
      </button>
    );
  }

  return (
    <article
      className={cn(
        "group animate-fade-up min-w-0",
        variant === "rail" ? "w-[267px] shrink-0 sm:w-[300px]" : "w-full"
      )}
      style={{ animationDelay: `${Math.min(index, 6) * 45}ms` }}
    >
      <button
        type="button"
        onClick={() => onOpen(video)}
        className="relative block w-full overflow-hidden rounded-[18px] bg-[var(--brand)] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
        aria-label={`Odtwórz: ${video.title}`}
      >
        <div className="aspect-video w-full">
          {!broken ? (
            <img
              src={video.thumbnail}
              alt=""
              loading="lazy"
              onError={() => setBroken(true)}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--brand)] via-[var(--brand-2)] to-[#4b7f2f] text-[var(--accent)]">
              <Icon name="play" size={36} />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#04150f]/65 via-transparent to-[#04150f]/25 opacity-80" />
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[var(--accent)] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[var(--accent-ink)]">
            {video.category}
          </span>
          {video.official && (
            <span className="rounded-full bg-[var(--brand)]/90 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
              MiraVoice
            </span>
          )}
        </div>
        <div className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-ink)]">
          <Icon name={saved ? "bookmark" : "play"} size={15} filled={saved} />
        </div>
        <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
          {video.duration}
        </span>
        <span className="absolute bottom-0 left-0 h-1 w-0 bg-[var(--accent)] transition-all duration-500 group-hover:w-full" />
      </button>
      <div className="mt-2.5 flex gap-2.5">
        <Avatar src={channel?.avatar} name={video.channelName} size={34} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          <button type="button" onClick={() => onOpen(video)} className="block w-full text-left">
            <h3 className="line-clamp-2 text-[13.5px] font-bold leading-[1.35] tracking-[-0.01em] text-[var(--ink)]">
              {video.title}
            </h3>
          </button>
          <div className="mt-1 flex items-center gap-1 truncate text-[11.5px] font-medium text-[var(--muted)]">
            <span className="truncate">{video.channelName}</span>
            {channel?.verified && <VerifiedBadge />}
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            {formatNumber(video.views)} wyświetleń · {timeAgo(video.date)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function VideoModal({ video, onClose }: { video: Video | null; onClose: () => void }) {
  const {
    content,
    currentUser,
    data,
    toggleLike,
    toggleSave,
    addComment,
    toggleSubscribe,
    toggleChannelNotifications,
    setAuthOpen,
    notify,
    navigate,
  } = useApp();
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [descOpen, setDescOpen] = useState(false);

  const channel = content.channels.find((c) => c.id === video?.channelId);
  const subscription = video ? data.subscriptions[video.channelId] : undefined;
  const liked = video ? data.likedVideos.includes(video.id) : false;
  const saved = video ? data.savedVideos.includes(video.id) : false;
  const comments = video ? data.comments[video.id] ?? [] : [];
  const related = useMemo(
    () => content.videos.filter((v) => v.id !== video?.id && v.category === video?.category).slice(0, 3),
    [content.videos, video]
  );

  if (!video) return null;

  const handleSubscribe = () => {
    const result = toggleSubscribe(video.channelId);
    if (!result.ok && result.reason === "auth") setAuthOpen(true);
  };

  const handleComment = () => {
    const result = addComment(video.id, comment);
    if (!result.ok) {
      setError(result.error ?? "Nie udało się dodać komentarza.");
      return;
    }
    setComment("");
    setError("");
    notify("Komentarz dodany.");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/videos`;
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, text: "Zobacz na MiraVoice", url });
      } else {
        await navigator.clipboard.writeText(url);
        notify("Link skopiowany do schowka.");
      }
    } catch {
      notify("Nie udało się udostępnić, ale link masz w pasku adresu.", "info");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#04120d]/85 p-0 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Odtwarzacz: ${video.title}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="animate-pop mx-auto min-h-screen w-full max-w-5xl bg-[var(--surface)] sm:min-h-0 sm:rounded-[28px]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
              <Icon name="play" size={13} filled />
            </span>
            <p className="truncate text-xs font-bold text-[var(--muted)]">MiraVoice · odtwarzacz</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))] text-[var(--ink)] transition hover:bg-[var(--accent)]"
            aria-label="Zamknij odtwarzacz"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="bg-black">
          <video
            key={video.id}
            controls
            playsInline
            preload="metadata"
            poster={video.thumbnail}
            className="mx-auto aspect-video max-h-[62vh] w-full bg-black object-contain"
            src={video.videoUrl || SAMPLE_VIDEO}
          >
            Twoja przeglądarka nie obsługuje odtwarzacza wideo.
          </video>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1fr_310px]">
          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">{video.category}</Badge>
              {video.episode && <Badge tone="outline">{video.episode}</Badge>}
              <span className="text-[11px] font-medium text-[var(--muted)]">Materiał demonstracyjny · fanowski</span>
            </div>
            <h1 className="mt-3 text-balance font-display text-[1.4rem] font-extrabold leading-tight sm:text-2xl">
              {video.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
              <span className="flex items-center gap-1"><Icon name="eye" size={14} /> {formatNumber(video.views)} wyświetleń</span>
              <span>{timeAgo(video.date)}</span>
              <span className="hidden sm:inline">#{video.category.toLowerCase().replace(" ", "")}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-[var(--line)] py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar src={channel?.avatar} name={video.channelName} size={40} />
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => {
                    onClose();
                    navigate("community");
                  }}
                >
                  <p className="flex items-center gap-1 truncate text-sm font-extrabold">
                    {video.channelName}
                    {channel?.verified && <VerifiedBadge />}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {channel ? `${formatNumber(channel.subscribers)} subskrybentów` : "Twórca społeczności"}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={handleSubscribe}
                  className={cn(
                    "ml-1 rounded-full px-3 py-2 text-xs font-bold transition",
                    subscription
                      ? "bg-[color-mix(in_srgb,var(--brand)_9%,var(--surface))] text-[var(--brand)]"
                      : "bg-[var(--brand)] text-white hover:bg-[var(--brand-2)]"
                  )}
                >
                  {subscription ? "Subskrybujesz" : "Subskrybuj"}
                </button>
                {subscription && (
                  <button
                    type="button"
                    onClick={() => toggleChannelNotifications(video.channelId)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border transition",
                      subscription.notifications
                        ? "border-[var(--brand)] bg-[var(--accent)] text-[var(--accent-ink)]"
                        : "border-[var(--line)] text-[var(--muted)]"
                    )}
                    aria-label="Powiadomienia kanału"
                    title={subscription.notifications ? "Wyłącz powiadomienia" : "Włącz powiadomienia"}
                  >
                    <Icon name={subscription.notifications ? "bell" : "bellOff"} size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      setAuthOpen(true);
                      return;
                    }
                    toggleLike(video.id);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition",
                    liked
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                      : "border-[var(--line)] hover:bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))]"
                  )}
                  aria-pressed={liked}
                >
                  <Icon name="heart" size={15} filled={liked} /> {formatNumber(video.likes)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      setAuthOpen(true);
                      return;
                    }
                    toggleSave(video.id);
                  }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border transition",
                    saved ? "border-[var(--brand)] bg-[var(--accent)] text-[var(--accent-ink)]" : "border-[var(--line)]"
                  )}
                  aria-label="Zapisz wideo"
                  aria-pressed={saved}
                >
                  <Icon name="bookmark" size={15} filled={saved} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] transition hover:bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))]"
                  aria-label="Udostępnij wideo"
                >
                  <Icon name="share" size={15} />
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] p-3.5">
              <p className={cn("whitespace-pre-line text-[13px] leading-relaxed text-[var(--ink)]", !descOpen && "line-clamp-3")}>
                {video.description}
              </p>
              <button
                type="button"
                onClick={() => setDescOpen((v) => !v)}
                className="mt-2 text-xs font-bold text-[var(--brand-2)] hover:underline"
              >
                {descOpen ? "Pokaż mniej" : "Pokaż więcej"}
              </button>
            </div>

            <section className="mt-6" aria-labelledby="comments-title">
              <h2 id="comments-title" className="flex items-center gap-2 font-display text-base font-extrabold">
                Komentarze <span className="text-xs font-medium text-[var(--muted)]">({comments.length})</span>
              </h2>
              {currentUser ? (
                <div className="mt-3 flex items-start gap-2.5">
                  <Avatar src={currentUser.avatar} name={currentUser.name} size={34} />
                  <div className="flex-1">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value.slice(0, 500))}
                      placeholder="Co myślisz o tym materiale?"
                      className="field min-h-[70px] resize-none"
                      aria-label="Treść komentarza"
                    />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[var(--muted)]">{comment.length}/500 · komentarze są moderowane</span>
                      <button type="button" onClick={handleComment} disabled={!comment.trim()} className="btn-primary !px-3.5 !py-2 text-xs disabled:opacity-40 disabled:shadow-none">
                        <Icon name="send" size={13} /> Dodaj
                      </button>
                    </div>
                    {error && <div className="mt-2"><ErrorNote>{error}</ErrorNote></div>}
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setAuthOpen(true)} className="mt-3 w-full rounded-2xl border border-dashed border-[var(--line)] bg-[color-mix(in_srgb,var(--brand)_4%,var(--surface))] px-4 py-4 text-left text-xs text-[var(--muted)] transition hover:border-[var(--brand)]">
                  <span className="font-bold text-[var(--brand)]">Zaloguj się</span>, aby dodać komentarz i obserwować twórcę.
                </button>
              )}
              <div className="mt-4 space-y-3">
                {comments.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-5 text-center text-xs text-[var(--muted)]">
                    Bądź pierwszą osobą, która zacznie rozmowę. Bądź życzliwy — hejt nie jest tu cudem.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <Avatar src={c.authorAvatar} name={c.authorName} size={32} />
                      <div className="min-w-0 flex-1 rounded-2xl bg-[color-mix(in_srgb,var(--brand)_4%,var(--surface))] px-3 py-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-extrabold">{c.authorName}</p>
                          <span className="text-[10px] text-[var(--muted)]">{timeAgo(c.date)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-line break-words text-xs leading-relaxed">{sanitizeText(c.body, 500)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="border-t border-[var(--line)] p-4 sm:p-6 lg:border-l lg:border-t-0">
            <h2 className="font-display text-base font-extrabold">Zobacz też</h2>
            <p className="mb-3 text-[11px] text-[var(--muted)]">Podobne materiały z fandomu</p>
            <div className="space-y-1">
              {related.length > 0 ? (
                related.map((v) => <VideoCard key={v.id} video={v} onOpen={() => { onClose(); setTimeout(() => window.dispatchEvent(new CustomEvent("mira:open-video", { detail: v })), 0); }} variant="row" />)
              ) : (
                <p className="text-xs text-[var(--muted)]">To jedyny taki materiał w kategorii. Wróć po więcej!</p>
              )}
            </div>
            <div className="mt-5 rounded-2xl bg-[var(--brand)] p-4 text-white">
              <Icon name="sparkles" size={22} className="text-[var(--accent)]" />
              <h3 className="mt-2 font-display text-base font-extrabold">Masz coś do powiedzenia?</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-white/65">Załóż kanał i opublikuj własną analizę, fan film albo teorię.</p>
              <button
                type="button"
                onClick={() => { onClose(); navigate("studio"); }}
                className="mt-3 w-full rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-extrabold text-[var(--accent-ink)]"
              >
                Otwórz Studio twórcy
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
