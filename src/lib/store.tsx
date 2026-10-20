import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { initialState, DEFAULT_APPEARANCE } from "@/data";
import type {
  Actor,
  Appearance,
  AppNotification,
  AuditEntry,
  Channel,
  Comment,
  LoreEntry,
  Page,
  PersistedState,
  SiteContent,
  TimelineEvent,
  ToastMessage,
  ToastType,
  User,
  Video,
} from "@/types";
import {
  ADMIN_SESSION_MINUTES,
  LOCKOUT_SECONDS,
  MAX_ADMIN_ATTEMPTS,
  createSessionToken,
  isValidEmail,
  makeId,
  relativeLockRemaining,
  safeHex,
  safeImageUrl,
  safeExternalUrl,
  sanitizeText,
  verifyAdminCredentials,
} from "@/lib/security";

const STORAGE_KEY = "miravoice.state.v1";
const ADMIN_SESSION_KEY = "miravoice.admin.session";

interface AdminSession {
  token: string;
  role: "admin";
  expiresAt: number;
  startedAt: number;
}

interface ChannelInput {
  name: string;
  handle: string;
  description: string;
  category: string;
  avatar?: string;
  cover?: string;
}

interface VideoInput {
  title: string;
  description: string;
  category: Video["category"];
  thumbnail: string;
  videoUrl?: string;
  duration: string;
}

interface ActionResult {
  ok: boolean;
  error?: string;
  reason?: "auth" | "exists" | "invalid";
}

interface AppContextValue {
  data: PersistedState;
  content: SiteContent;
  currentUser: User | null;
  myChannel: Channel | null;
  page: Page;
  navigate: (page: Page) => void;
  authOpen: boolean;
  setAuthOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  notify: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
  adminSession: AdminSession | null;
  adminAttempts: number;
  adminLockLeft: number;
  adminLogin: (email: string, password: string) => Promise<ActionResult>;
  adminLogout: () => void;
  touchAdminSession: () => void;
  signInWithGoogle: (input: { name: string; email: string; id?: string }) => ActionResult;
  signOut: () => void;
  toggleSubscribe: (channelId: string) => ActionResult;
  toggleChannelNotifications: (channelId: string) => void;
  toggleLike: (videoId: string) => void;
  toggleSave: (videoId: string) => void;
  addComment: (videoId: string, body: string) => ActionResult;
  createChannel: (input: ChannelInput) => ActionResult;
  updateMyChannel: (input: Partial<ChannelInput>) => ActionResult;
  addVideo: (input: VideoInput) => ActionResult;
  deleteVideo: (videoId: string) => ActionResult;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  adminUpdateContent: (patch: Partial<SiteContent>, auditLabel: string) => void;
  adminSetAppearance: (patch: Partial<Appearance>, auditLabel?: string) => void;
  adminUpsertVideo: (video: Video) => void;
  adminDeleteVideo: (id: string) => void;
  adminUpsertActor: (actor: Actor) => void;
  adminDeleteActor: (id: string) => void;
  adminUpsertLore: (entry: LoreEntry) => void;
  adminDeleteLore: (id: string) => void;
  adminUpsertHistory: (event: TimelineEvent) => void;
  adminDeleteHistory: (id: string) => void;
  resetDemo: () => void;
  exportContent: () => string;
  importContent: (raw: string) => ActionResult;
}

const AppContext = createContext<AppContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== 1 || !isRecord(parsed.content)) {
      return initialState;
    }
    const content = parsed.content as unknown as SiteContent;
    if (!Array.isArray(content.videos) || !Array.isArray(content.lore) || !isRecord(content.appearance)) {
      return initialState;
    }
    return {
      ...initialState,
      ...(parsed as unknown as PersistedState),
      content: {
        ...initialState.content,
        ...content,
        appearance: {
          ...DEFAULT_APPEARANCE,
          ...content.appearance,
          heroImage: content.appearance.heroImage || DEFAULT_APPEARANCE.heroImage,
        },
      },
    };
  } catch {
    return initialState;
  }
}

function readAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed.token || parsed.expiresAt < Date.now()) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function audit(action: string): AuditEntry {
  return { id: makeId("audit"), action, at: new Date().toISOString() };
}

function slugHandle(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 24) || "tworca"
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PersistedState>(loadState);
  const [page, setPage] = useState<Page>("home");
  const [authOpen, setAuthOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(readAdminSession);
  const [adminAttempts, setAdminAttempts] = useState(0);
  const [adminLockedUntil, setAdminLockedUntil] = useState(0);
  const [adminLockLeft, setAdminLockLeft] = useState(0);
  const timerRef = useRef<number[]>([]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Storage can be full or disabled; the app keeps working in memory.
      }
    }, 180);
    return () => window.clearTimeout(handle);
  }, [data]);

  useEffect(() => {
    const root = document.documentElement;
    const a = data.content.appearance;
    root.style.setProperty("--brand", safeHex(a.brand, DEFAULT_APPEARANCE.brand));
    root.style.setProperty("--brand-2", safeHex(a.brand2, DEFAULT_APPEARANCE.brand2));
    root.style.setProperty("--accent", safeHex(a.accent, DEFAULT_APPEARANCE.accent));
    root.style.setProperty("--accent-ink", safeHex(a.accentInk, DEFAULT_APPEARANCE.accentInk));
    root.style.setProperty("--bg", safeHex(a.bg, DEFAULT_APPEARANCE.bg));
    root.style.setProperty("--surface", safeHex(a.surface, DEFAULT_APPEARANCE.surface));
    root.style.setProperty("--ink", safeHex(a.ink, DEFAULT_APPEARANCE.ink));
    root.style.setProperty("--muted", safeHex(a.muted, DEFAULT_APPEARANCE.muted));
    root.style.setProperty("--line", safeHex(a.line, DEFAULT_APPEARANCE.line));
    root.style.setProperty("--radius", `${Math.min(32, Math.max(0, a.radius))}px`);
    root.style.setProperty("--font-display", `"${a.headingFont}", sans-serif`);
    document.title = `${sanitizeText(a.siteName, 32)} — każdy cud ma swoją historię`;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", safeHex(a.brand, DEFAULT_APPEARANCE.brand));
  }, [data.content.appearance]);

  useEffect(() => {
    if (!adminSession) return;
    const tick = () => {
      if (adminSession.expiresAt <= Date.now()) {
        setAdminSession(null);
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
      }
    };
    tick();
    const interval = window.setInterval(tick, 15000);
    return () => window.clearInterval(interval);
  }, [adminSession]);

  useEffect(() => {
    const tick = () => setAdminLockLeft(relativeLockRemaining(adminLockedUntil));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [adminLockedUntil]);

  useEffect(() => () => timerRef.current.forEach((t) => window.clearTimeout(t)), []);

  const navigate = useCallback((next: Page) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.location.hash !== `#/${next}`) {
      window.history.pushState(null, "", `#/${next}`);
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#\/?/, "") as Page;
    const allowed: Page[] = [
      "home", "videos", "actors", "history", "lore", "community",
      "about", "studio", "profile", "admin", "security",
    ];
    if (allowed.includes(hash)) setPage(hash);
    const onHash = () => {
      const next = window.location.hash.replace(/^#\/?/, "") as Page;
      if (allowed.includes(next)) setPage(next);
    };
    window.addEventListener("hashchange", onHash);
    const onPop = () => {
      const next = window.location.hash.replace(/^#\/?/, "") as Page;
      if (allowed.includes(next)) setPage(next);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const notify = useCallback((message: string, type: ToastType = "success") => {
    const id = makeId("toast");
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    const timeout = window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
    timerRef.current.push(timeout);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === data.currentUserId) ?? null,
    [data.users, data.currentUserId]
  );
  const myChannel = useMemo(() => {
    if (!currentUser) return null;
    return data.content.channels.find((c) => c.ownerId === currentUser.id) ?? null;
  }, [currentUser, data.content.channels]);

  const signInWithGoogle: AppContextValue["signInWithGoogle"] = useCallback(
    (input) => {
      const name = sanitizeText(input.name, 48);
      const email = input.email.trim().toLowerCase();
      if (name.length < 2 || !isValidEmail(email)) {
        return { ok: false, error: "Podaj poprawne imię i adres e-mail.", reason: "invalid" };
      }
      setData((prev) => {
        const existing = prev.users.find((u) => u.email.toLowerCase() === email);
        const user: User = existing ?? {
          id: makeId("u"),
          name,
          email,
          avatar: "",
          color: "#c8f169",
          provider: "google",
        };
        const notification: AppNotification = {
          id: makeId("n"),
          title: "Witaj w MiraVoice!",
          body: user.channelId
            ? "Twój kanał czeka w Studiu. Sprawdź powiadomienia i subskrypcje."
            : "Załóż własny kanał w Studiu i zaproś innych do subskrybowania.",
          time: new Date().toISOString(),
          read: false,
          type: "system",
        };
        return {
          ...prev,
          users: existing ? prev.users : [...prev.users, user],
          currentUserId: user.id,
          notifications: [notification, ...prev.notifications].slice(0, 30),
        };
      });
      setAuthOpen(false);
      notify(`Zalogowano jako ${name}. Miłego odkrywania!`);
      return { ok: true };
    },
    [notify]
  );

  const signOut = useCallback(() => {
    setData((prev) => ({ ...prev, currentUserId: null }));
    notify("Wylogowano. Do zobaczenia na dachach!", "info");
    setPage("home");
  }, [notify]);

  const toggleSubscribe: AppContextValue["toggleSubscribe"] = useCallback(
    (channelId) => {
      if (!data.currentUserId) {
        setAuthOpen(true);
        return { ok: false, reason: "auth", error: "Zaloguj się, aby subskrybować kanały." };
      }
      const channel = data.content.channels.find((c) => c.id === channelId);
      if (!channel) return { ok: false, error: "Nie znaleziono kanału." };
      const active = Boolean(data.subscriptions[channelId]);
      setData((prev) => {
        const subs = { ...prev.subscriptions };
        let channels = prev.content.channels;
        if (active) {
          delete subs[channelId];
          channels = channels.map((c) =>
            c.id === channelId ? { ...c, subscribers: Math.max(0, c.subscribers - 1) } : c
          );
        } else {
          subs[channelId] = { notifications: true, since: new Date().toISOString() };
          channels = channels.map((c) =>
            c.id === channelId ? { ...c, subscribers: c.subscribers + 1 } : c
          );
        }
        const notifications = active
          ? prev.notifications
          : [
              {
                id: makeId("n"),
                title: `Subskrybujesz ${channel.name}`,
                body: "Powiadomienia o nowych wideo są włączone. Możesz je wyłączyć dzwonkiem.",
                time: new Date().toISOString(),
                read: false,
                type: "sub" as const,
              },
              ...prev.notifications,
            ].slice(0, 30);
        return {
          ...prev,
          subscriptions: subs,
          notifications,
          content: { ...prev.content, channels },
        };
      });
      notify(active ? `Usunięto subskrypcję ${channel.handle}` : `Subskrybujesz ${channel.handle}`);
      return { ok: true };
    },
    [data.currentUserId, data.content.channels, data.subscriptions, notify]
  );

  const toggleChannelNotifications = useCallback(
    (channelId: string) => {
      if (!data.subscriptions[channelId]) return;
      setData((prev) => ({
        ...prev,
        subscriptions: {
          ...prev.subscriptions,
          [channelId]: {
            ...prev.subscriptions[channelId],
            notifications: !prev.subscriptions[channelId].notifications,
          },
        },
      }));
      notify("Ustawienia powiadomień kanału zostały zmienione.");
    },
    [data.subscriptions, notify]
  );

  const toggleLike = useCallback((videoId: string) => {
    setData((prev) => {
      const liked = prev.likedVideos.includes(videoId);
      return {
        ...prev,
        likedVideos: liked
          ? prev.likedVideos.filter((id) => id !== videoId)
          : [...prev.likedVideos, videoId],
        content: {
          ...prev.content,
          videos: prev.content.videos.map((v) =>
            v.id === videoId ? { ...v, likes: Math.max(0, v.likes + (liked ? -1 : 1)) } : v
          ),
        },
      };
    });
  }, []);

  const toggleSave = useCallback(
    (videoId: string) => {
      setData((prev) => ({
        ...prev,
        savedVideos: prev.savedVideos.includes(videoId)
          ? prev.savedVideos.filter((id) => id !== videoId)
          : [...prev.savedVideos, videoId],
      }));
      notify(
        data.savedVideos.includes(videoId) ? "Usunięto z zapisanych." : "Zapisano wideo na później.",
        "info"
      );
    },
    [data.savedVideos, notify]
  );

  const addComment: AppContextValue["addComment"] = useCallback(
    (videoId: string, body: string) => {
      if (!currentUser) {
        setAuthOpen(true);
        return { ok: false, reason: "auth", error: "Zaloguj się, aby komentować." };
      }
      const clean = sanitizeText(body, 500);
      if (clean.length < 2) return { ok: false, error: "Komentarz jest zbyt krótki." };
      const comment: Comment = {
        id: makeId("c"),
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        body: clean,
        date: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        comments: { ...prev.comments, [videoId]: [...(prev.comments[videoId] ?? []), comment] },
      }));
      return { ok: true };
    },
    [currentUser]
  );

  const createChannel: AppContextValue["createChannel"] = useCallback(
    (input: ChannelInput) => {
      if (!currentUser) {
        setAuthOpen(true);
        return { ok: false, reason: "auth", error: "Zaloguj się, aby utworzyć kanał." };
      }
      if (myChannel) return { ok: false, error: "Masz już swój kanał." };
      const name = sanitizeText(input.name, 40);
      const handleRaw = slugHandle(input.handle || input.name);
      const handle = `@${handleRaw}`;
      if (name.length < 3) return { ok: false, error: "Nazwa kanału musi mieć min. 3 znaki." };
      if (data.content.channels.some((c) => c.handle.toLowerCase() === handle.toLowerCase())) {
        return { ok: false, error: "Ten adres kanału jest już zajęty." };
      }
      const avatar = input.avatar ? safeImageUrl(input.avatar, true) : currentUser.avatar;
      const cover = input.cover ? safeImageUrl(input.cover) : "";
      if (input.avatar && !avatar) return { ok: false, error: "Avatar musi być bezpiecznym linkiem https." };
      if (input.cover && !cover) return { ok: false, error: "Tło musi być bezpiecznym linkiem https." };
      const channel: Channel = {
        id: makeId("ch"),
        ownerId: currentUser.id,
        name,
        handle,
        description: sanitizeText(input.description, 300) || "Nowy kanał w społeczności MiraVoice.",
        avatar: avatar ?? "",
        cover: cover ?? "",
        subscribers: 0,
        category: sanitizeText(input.category, 30) || "Twórczość",
        createdAt: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === currentUser.id ? { ...u, channelId: channel.id } : u)),
        content: { ...prev.content, channels: [...prev.content.channels, channel] },
        notifications: [
          {
            id: makeId("n"),
            title: "Twój kanał jest online!",
            body: `${channel.name} jest gotowy. Dodaj pierwsze wideo i zaproś znajomych.`,
            time: new Date().toISOString(),
            read: false,
            type: "system" as const,
          },
          ...prev.notifications,
        ],
      }));
      notify(`Kanał ${channel.handle} został utworzony.`);
      return { ok: true };
    },
    [currentUser, myChannel, data.content.channels, notify]
  );

  const updateMyChannel = useCallback(
    (input: Partial<ChannelInput>) => {
      if (!currentUser || !myChannel) return { ok: false, error: "Brak kanału." };
      const avatar = input.avatar === undefined ? myChannel.avatar : safeImageUrl(input.avatar, true);
      const cover = input.cover === undefined ? myChannel.cover : safeImageUrl(input.cover);
      if (input.avatar !== undefined && !avatar) return { ok: false, error: "Nieprawidłowy avatar." };
      if (input.cover !== undefined && !cover) return { ok: false, error: "Nieprawidłowe tło." };
      setData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          channels: prev.content.channels.map((c) =>
            c.id === myChannel.id
              ? {
                  ...c,
                  name: input.name ? sanitizeText(input.name, 40) : c.name,
                  description:
                    input.description !== undefined
                      ? sanitizeText(input.description, 300)
                      : c.description,
                  category: input.category ? sanitizeText(input.category, 30) : c.category,
                  avatar: avatar ?? c.avatar,
                  cover: cover ?? c.cover,
                }
              : c
          ),
        },
      }));
      notify("Kanał został zaktualizowany.");
      return { ok: true };
    },
    [currentUser, myChannel, notify]
  );

  const addVideo = useCallback(
    (input: VideoInput) => {
      if (!currentUser || !myChannel) {
        return { ok: false, error: "Najpierw utwórz kanał w Studiu." };
      }
      const title = sanitizeText(input.title, 100);
      const description = sanitizeText(input.description, 800);
      const thumbnail = safeImageUrl(input.thumbnail, true);
      const videoUrl = input.videoUrl ? safeExternalUrl(input.videoUrl) : undefined;
      if (title.length < 5) return { ok: false, error: "Tytuł musi mieć min. 5 znaków." };
      if (!thumbnail) return { ok: false, error: "Miniatura musi być bezpiecznym linkiem https." };
      if (input.videoUrl && !videoUrl) return { ok: false, error: "Nieprawidłowy adres wideo." };
      const video: Video = {
        id: makeId("v"),
        title,
        category: input.category,
        duration: sanitizeText(input.duration, 10) || "00:00",
        views: 0,
        likes: 0,
        date: new Date().toISOString(),
        thumbnail,
        channelId: myChannel.id,
        channelName: myChannel.name,
        description: description || "Nowy materiał od twórcy MiraVoice.",
        videoUrl: videoUrl ?? undefined,
      };
      setData((prev) => ({
        ...prev,
        content: { ...prev.content, videos: [video, ...prev.content.videos] },
        notifications: [
          {
            id: makeId("n"),
            title: `Opublikowano: ${video.title}`,
            body: "Twój materiał jest już widoczny w sekcji Wideo.",
            time: new Date().toISOString(),
            read: false,
            type: "video" as const,
            target: video.id,
          },
          ...prev.notifications,
        ],
      }));
      notify("Wideo zostało dodane do MiraVoice.");
      return { ok: true };
    },
    [currentUser, myChannel, notify]
  );

  const deleteVideo = useCallback(
    (videoId: string) => {
      const video = data.content.videos.find((v) => v.id === videoId);
      if (!video) return { ok: false, error: "Nie znaleziono wideo." };
      if (!myChannel || video.channelId !== myChannel.id) {
        return { ok: false, error: "Możesz usuwać tylko własne wideo." };
      }
      setData((prev) => ({
        ...prev,
        content: { ...prev.content, videos: prev.content.videos.filter((v) => v.id !== videoId) },
      }));
      notify("Wideo zostało usunięte.", "info");
      return { ok: true };
    },
    [data.content.videos, myChannel, notify]
  );

  const markAllNotificationsRead = useCallback(() => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setData((prev) => ({ ...prev, notifications: [] }));
    notify("Wyczyszczono powiadomienia.", "info");
  }, [notify]);

  const adminLogin = useCallback(
    async (login: string, password: string) => {
      if (adminLockedUntil > Date.now()) {
        return {
          ok: false,
          error: `Zbyt wiele prób. Spróbuj ponownie za ${relativeLockRemaining(adminLockedUntil)} s.`,
        };
      }
      if (!login || !password) return { ok: false, error: "Podaj login i hasło administratora." };
      const valid = await verifyAdminCredentials(login, password);
      if (!valid) {
        const next = adminAttempts + 1;
        if (next >= MAX_ADMIN_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_SECONDS * 1000;
          setAdminLockedUntil(until);
          setAdminAttempts(0);
          return { ok: false, error: `Konto tymczasowo zablokowane na ${LOCKOUT_SECONDS} s.` };
        }
        setAdminAttempts(next);
        return { ok: false, error: `Nieprawidłowe dane. Pozostałe próby: ${MAX_ADMIN_ATTEMPTS - next}.` };
      }
      const session: AdminSession = {
        token: createSessionToken(),
        role: "admin",
        expiresAt: Date.now() + ADMIN_SESSION_MINUTES * 60 * 1000,
        startedAt: Date.now(),
      };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      setAdminSession(session);
      setAdminAttempts(0);
      setData((prev) => ({
        ...prev,
        audit: [audit("Zalogowano administratora (sesja lokalna)"), ...prev.audit].slice(0, 30),
      }));
      notify("Zalogowano do panelu administratora. Sesja wygasa po 20 min.");
      return { ok: true };
    },
    [adminAttempts, adminLockedUntil, notify]
  );

  const touchAdminSession = useCallback(() => {
    setAdminSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, expiresAt: Date.now() + ADMIN_SESSION_MINUTES * 60 * 1000 };
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const adminLogout = useCallback(() => {
    setAdminSession(null);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setData((prev) => ({
      ...prev,
      audit: [audit("Wylogowano administratora"), ...prev.audit].slice(0, 30),
    }));
    notify("Sesja administratora zakończona.", "info");
  }, [notify]);

  const adminSetAppearance = useCallback(
    (patch: Partial<Appearance>, auditLabel = "Zmieniono wygląd aplikacji") => {
      setData((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          appearance: { ...prev.content.appearance, ...patch },
        },
        audit: [audit(auditLabel), ...prev.audit].slice(0, 30),
      }));
    },
    []
  );

  const adminUpdateContent = useCallback((patch: Partial<SiteContent>, label: string) => {
    setData((prev) => ({
      ...prev,
      content: { ...prev.content, ...patch },
      audit: [audit(label), ...prev.audit].slice(0, 30),
    }));
  }, []);

  const adminUpsertVideo = useCallback((video: Video) => {
    setData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        videos: prev.content.videos.some((v) => v.id === video.id)
          ? prev.content.videos.map((v) => (v.id === video.id ? video : v))
          : [video, ...prev.content.videos],
      },
      audit: [audit(`Zapisano wideo: ${video.title}`), ...prev.audit].slice(0, 30),
    }));
  }, []);

  const adminDeleteVideo = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      content: { ...prev.content, videos: prev.content.videos.filter((v) => v.id !== id) },
      audit: [audit("Usunięto wideo z biblioteki"), ...prev.audit].slice(0, 30),
    }));
  }, []);

  const adminUpsertActor = useCallback((actor: Actor) => {
    setData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        actors: prev.content.actors.some((a) => a.id === actor.id)
          ? prev.content.actors.map((a) => (a.id === actor.id ? actor : a))
          : [...prev.content.actors, actor],
      },
      audit: [audit(`Zapisano profil: ${actor.name}`), ...prev.audit].slice(0, 30),
    }));
  }, []);

  const adminDeleteActor = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      content: { ...prev.content, actors: prev.content.actors.filter((a) => a.id !== id) },
      audit: [audit("Usunięto profil aktora"), ...prev.audit].slice(0, 30),
    }));
  }, []);

  const adminUpsertLore = useCallback((entry: LoreEntry) => {
    setData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        lore: prev.content.lore.some((l) => l.id === entry.id)
          ? prev.content.lore.map((l) => (l.id === entry.id ? entry : l))
          : [...prev.content.lore, entry],
      },
      audit: [audit(`Zapisano lore: ${entry.name}`), ...prev.audit].slice(0, 30),
    }));
  }, []);

  const adminDeleteLore = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      content: { ...prev.content, lore: prev.content.lore.filter((l) => l.id !== id) },
      audit: [audit("Usunięto wpis lore"), ...prev.audit].slice(0, 30),
    }));
  }, []);

  const adminUpsertHistory = useCallback((event: TimelineEvent) => {
    setData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        history: prev.content.history.some((h) => h.id === event.id)
          ? prev.content.history.map((h) => (h.id === event.id ? event : h))
          : [...prev.content.history, event],
      },
      audit: [audit(`Zapisano wydarzenie: ${event.title}`), ...prev.audit].slice(0, 30),
    }));
  }, []);

  const adminDeleteHistory = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      content: { ...prev.content, history: prev.content.history.filter((h) => h.id !== id) },
      audit: [audit("Usunięto wydarzenie z historii"), ...prev.audit].slice(0, 30),
    }));
  }, []);

  const exportContent = useCallback(
    () => JSON.stringify({ version: 1, site: data.content }, null, 2),
    [data.content]
  );

  const importContent = useCallback(
    (raw: string) => {
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!isRecord(parsed) || !isRecord(parsed.site)) {
          return { ok: false, error: "Nieprawidłowy format pliku." };
        }
        const site = parsed.site as unknown as SiteContent;
        if (!Array.isArray(site.videos) || !Array.isArray(site.lore) || !isRecord(site.appearance)) {
          return { ok: false, error: "Brakuje wymaganych sekcji konfiguracji." };
        }
        const list = <T,>(value: unknown, fallback: T[], required: string[]): T[] => {
          if (!Array.isArray(value)) return fallback;
          return value
            .filter(
              (item): item is T =>
                isRecord(item) &&
                required.every((key) => typeof item[key] === "string" && (item[key] as string).length > 0)
            )
            .slice(0, 500);
        };
        setData((prev) => {
          const safeSite: SiteContent = {
            ...prev.content,
            appearance: { ...DEFAULT_APPEARANCE, ...prev.content.appearance, ...site.appearance },
            videos: list<Video>(site.videos, prev.content.videos, ["id", "title", "thumbnail", "channelId"]),
            actors: list<Actor>(site.actors, prev.content.actors, ["id", "name", "image"]),
            lore: list<LoreEntry>(site.lore, prev.content.lore, ["id", "name", "description"]),
            history: list<TimelineEvent>(site.history, prev.content.history, ["id", "title", "year"]),
            channels: list<Channel>(site.channels, prev.content.channels, ["id", "name", "handle", "ownerId"]),
            aboutTitle: typeof site.aboutTitle === "string" ? sanitizeText(site.aboutTitle, 150) : prev.content.aboutTitle,
            aboutBody: typeof site.aboutBody === "string" ? sanitizeText(site.aboutBody, 900) : prev.content.aboutBody,
            mission: typeof site.mission === "string" ? sanitizeText(site.mission, 400) : prev.content.mission,
            email: typeof site.email === "string" && isValidEmail(site.email) ? site.email.slice(0, 120) : prev.content.email,
          };
          return {
            ...prev,
            content: safeSite,
            audit: [audit("Zaimportowano i zweryfikowano konfigurację treści"), ...prev.audit].slice(0, 30),
          };
        });
        notify("Konfiguracja została zaimportowana i zapisana lokalnie.");
        return { ok: true };
      } catch {
        return { ok: false, error: "Nie udało się odczytać pliku JSON." };
      }
    },
    [notify]
  );

  const resetDemo = useCallback(() => {
    setData({ ...initialState });
    setPage("home");
    notify("Przywrócono domyślną zawartość demo.", "info");
  }, [notify]);

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      content: data.content,
      currentUser,
      myChannel,
      page,
      navigate,
      authOpen,
      setAuthOpen,
      toasts,
      notify,
      dismissToast,
      adminSession,
      adminAttempts,
      adminLockLeft,
      adminLogin,
      adminLogout,
      touchAdminSession,
      signInWithGoogle,
      signOut,
      toggleSubscribe,
      toggleChannelNotifications,
      toggleLike,
      toggleSave,
      addComment,
      createChannel,
      updateMyChannel,
      addVideo,
      deleteVideo,
      markAllNotificationsRead,
      clearNotifications,
      adminUpdateContent,
      adminSetAppearance,
      adminUpsertVideo,
      adminDeleteVideo,
      adminUpsertActor,
      adminDeleteActor,
      adminUpsertLore,
      adminDeleteLore,
      adminUpsertHistory,
      adminDeleteHistory,
      resetDemo,
      exportContent,
      importContent,
    }),
    [
      data, currentUser, myChannel, page, navigate, authOpen, toasts, notify, dismissToast,
      adminSession, adminAttempts, adminLockLeft, adminLogin, adminLogout, touchAdminSession,
      signInWithGoogle, signOut, toggleSubscribe, toggleChannelNotifications, toggleLike, toggleSave,
      addComment, createChannel, updateMyChannel, addVideo, deleteVideo, markAllNotificationsRead,
      clearNotifications, adminUpdateContent, adminSetAppearance, adminUpsertVideo, adminDeleteVideo,
      adminUpsertActor, adminDeleteActor, adminUpsertLore, adminDeleteLore, adminUpsertHistory,
      resetDemo, exportContent, importContent,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
