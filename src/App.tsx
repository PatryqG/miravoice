import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import { AppProvider, useApp } from "@/lib/store";
import type { Video } from "@/types";
import { Layout } from "@/components/Layout";
import { VideoModal } from "@/components/Video";
import { Icon } from "@/components/Icons";
import { HomePage } from "@/pages/Home";
import { VideosPage } from "@/pages/Videos";
import { ActorsPage } from "@/pages/Actors";
import { HistoryPage } from "@/pages/History";
import { LorePage } from "@/pages/Lore";
import { CommunityPage } from "@/pages/Community";
import { AboutPage } from "@/pages/About";
import { StudioPage } from "@/pages/Studio";
import { ProfilePage } from "@/pages/Profile";
import { AdminPage } from "@/pages/Admin";
import { SecurityPage } from "@/pages/Security";
import { cn } from "@/utils/cn";

function ToastViewport() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed inset-x-3 bottom-[76px] z-[95] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[360px] lg:bottom-5" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className="animate-pop flex items-start gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 shadow-xl">
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
              toast.type === "success" && "bg-[var(--accent)] text-[var(--accent-ink)]",
              toast.type === "error" && "bg-red-100 text-red-600",
              toast.type === "info" && "bg-[color-mix(in_srgb,var(--brand)_10%,var(--surface))] text-[var(--brand)]"
            )}
          >
            <Icon name={toast.type === "success" ? "check" : toast.type === "error" ? "alert" : "info"} size={15} />
          </span>
          <p className="min-w-0 flex-1 pt-1 text-[11px] font-semibold leading-snug">{toast.message}</p>
          <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Zamknij powiadomienie" className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))]">
            <Icon name="x" size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function Shell() {
  const { page, content, navigate } = useApp();
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<Video | { id: string }>).detail;
      const id = detail && typeof detail === "object" && "id" in detail ? detail.id : "";
      const found = content.videos.find((v) => v.id === id);
      if (found) setActiveVideo(found);
    };
    window.addEventListener("mira:open-video", handler);
    return () => window.removeEventListener("mira:open-video", handler);
  }, [content.videos]);

  useEffect(() => {
    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register("sw.js").catch(() => {
        // PWA offline mode is an enhancement; the app still works fully online.
      });
    }
  }, []);

  const renderPage = () => {
    switch (page) {
      case "videos": return <VideosPage onOpenVideo={setActiveVideo} />;
      case "actors": return <ActorsPage />;
      case "history": return <HistoryPage />;
      case "lore": return <LorePage />;
      case "community": return <CommunityPage onOpenVideo={setActiveVideo} />;
      case "about": return <AboutPage />;
      case "studio": return <StudioPage />;
      case "profile": return <ProfilePage onOpenVideo={setActiveVideo} />;
      case "admin": return <AdminPage />;
      case "security": return <SecurityPage />;
      case "home":
      default:
        return <HomePage onOpenVideo={setActiveVideo} />;
    }
  };

  return (
    <>
      <Layout>
        <div key={page} className="animate-fade-up">
          {renderPage()}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-4">
          <p className="text-[9px] text-[var(--muted)]">MiraVoice · fanowski wszechświat · dane przechowywane lokalnie w tej wersji demo</p>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("security")} className="text-[9px] font-bold text-[var(--brand-2)] hover:underline">Prywatność i bezpieczeństwo</button>
            <button type="button" onClick={() => navigate("about")} className="text-[9px] font-bold text-[var(--brand-2)] hover:underline">Zasady społeczności</button>
          </div>
        </div>
      </Layout>
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      <ToastViewport />
    </>
  );
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Do not log user data; keep a compact diagnostic for local debugging.
    console.error("MiraVoice UI error:", error.message, info.componentStack?.slice(0, 300));
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7ef] p-5">
        <div className="w-full max-w-md rounded-3xl border border-[#dfe8d9] bg-white p-6 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0c3b2e] text-[#c8f169]"><Icon name="alert" size={26} /></div>
          <h1 className="mt-4 font-display text-xl font-extrabold text-[#10231b]">Coś poszło nie tak na dachu.</h1>
          <p className="mt-2 text-xs leading-relaxed text-[#63736a]">Aplikacja napotkała nieoczekiwany błąd. Spróbuj przeładować widok. Twoje dane lokalne powinny pozostać nietknięte.</p>
          <div className="mt-4 flex flex-col gap-2">
            <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-[#0c3b2e] px-4 py-2.5 text-xs font-bold text-white">Przeładuj aplikację</button>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem("miravoice.state.v1");
                  sessionStorage.removeItem("miravoice.admin.session");
                } catch {
                  /* storage might be blocked */
                }
                window.location.hash = "#/home";
                window.location.reload();
              }}
              className="rounded-full border border-[#dfe8d9] px-4 py-2.5 text-[11px] font-bold text-[#63736a]"
            >
              Wyczyść dane demo i uruchom ponownie
            </button>
          </div>
          <p className="mt-3 text-[9px] text-[#63736a]">MiraVoice · tryb lokalny</p>
        </div>
      </div>
    );
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProvider>
        <Shell />
      </AppProvider>
    </AppErrorBoundary>
  );
}
