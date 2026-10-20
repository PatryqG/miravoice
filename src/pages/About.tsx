import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Avatar, Badge, PageHero, SectionHeader } from "@/components/ui";
import { Icon, type IconName } from "@/components/Icons";
import { cn } from "@/utils/cn";

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const faqs = [
  {
    q: "Czy MiraVoice to oficjalna aplikacja Miraculous?",
    a: "Nie. To niezależny projekt fanowski tworzony przez społeczność. Nie jest powiązany z właścicielami marki ani oficjalnymi dystrybutorami. Wszystkie znaki należą do ich właścicieli.",
  },
  {
    q: "Czy mogę założyć własny kanał?",
    a: "Tak. Zaloguj się przez ekran demo Google, przejdź do Studia twórcy i utwórz kanał. Następnie możesz dodać wideo z tytułem, opisem, miniaturą i adresem pliku MP4.",
  },
  {
    q: "Jak działają subskrypcje i powiadomienia?",
    a: "Przy każdym kanale znajdziesz przycisk Subskrybuj. Po subskrypcji włącz dzwonek, aby otrzymywać powiadomienia o nowościach. Możesz je wyłączyć w każdej chwili.",
  },
  {
    q: "Czy zmiany administratora widzą wszyscy?",
    a: "W tej wersji demo zmiany zapisują się lokalnie na Twoim urządzeniu. Aby publikować treść i wygląd dla wszystkich, podłączymy backend, np. Supabase, oraz prawdziwe logowanie. Panel jest przygotowany pod taką integrację.",
  },
  {
    q: "Na jakich urządzeniach działa aplikacja?",
    a: "Interfejs jest zaprojektowany mobile-first i działa w nowoczesnych przeglądarkach na Androidzie, iPhonie oraz Windowsie. Można ją zainstalować jako PWA z ekranu przeglądarki. Natywne paczki APK/EXE wymagają dodatkowego kroku pakowania.",
  },
  {
    q: "Jak chronione są moje dane?",
    a: "Wersja demo zapisuje konto, kanał i ustawienia wyłącznie w localStorage przeglądarki. Dane administratora są hashowane i nigdzie nie wyświetlane, sesja wygasa, a panel ma limit prób. To nie zastępuje bezpieczeństwa backendu produkcyjnego.",
  },
];

export function AboutPage() {
  const { content, data, currentUser, navigate, notify, setAuthOpen } = useApp();
  const [openFaq, setOpenFaq] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!installPrompt) {
      notify("Otwórz menu przeglądarki i wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.", "info");
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      notify("MiraVoice zainstalowany. Otwórz go z ekranu głównego!");
      setInstallPrompt(null);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(content.email);
      setCopied(true);
      notify("Adres e-mail skopiowany.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Skopiuj adres ręcznie: " + content.email, "info");
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="O nas"
        title={content.aboutTitle}
        description={content.aboutBody}
        icon="info"
      >
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate("community")} className="btn-primary !px-4 !py-2.5 text-[11px]"><Icon name="community" size={14} /> Dołącz do fandomu</button>
          <button type="button" onClick={install} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-white/10"><Icon name="download" size={14} /> Zainstaluj aplikację</button>
        </div>
      </PageHero>

      <section className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_top_right,var(--accent),transparent_70%)] opacity-25" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="font-marker text-lg text-[var(--brand-2)]">nasza misja</span>
            <p className="mt-2 text-balance font-display text-2xl font-extrabold leading-tight sm:text-[1.7rem]">{content.mission}</p>
            <p className="mt-3 max-w-xl text-xs leading-relaxed text-[var(--muted)]">MiraVoice powstał z prostego pomysłu: zamiast czekać na następny odcinek, stwórzmy własną przestrzeń do rozmowy. Dziś to archiwum lore, biblioteka wideo i dom dla twórców, którzy chcą opowiedzieć swoją wersję historii.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="soft"><Icon name="heart" size={11} /> tworzone przez fanów</Badge>
              <Badge tone="soft"><Icon name="shield" size={11} /> moderowana przestrzeń</Badge>
              <Badge tone="soft"><Icon name="sparkles" size={11} /> bez barier wejścia</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: `${content.videos.length}`, label: "materiałów wideo" },
              { value: `${content.channels.length}`, label: "kanałów twórców" },
              { value: `${content.actors.length}`, label: "osób w ekipie" },
              { value: `${content.lore.length}`, label: "wpisów lore" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_16%,var(--surface))] p-3.5">
                <p className="font-display text-2xl font-extrabold text-[var(--brand)]">{stat.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--muted)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Co nas napędza" title="Trzy zasady dobrego fandomu" description="Nie musimy się zgadzać. Musimy tylko pamiętać, że po drugiej stronie ekranu też jest fan." />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "heart" as IconName, title: "Twórz z szacunkiem", text: "Krytyka merytoryczna tak, hejt nie. Dbamy o to, by początkujący twórcy mieli prawo do nauki i eksperymentów." },
            { icon: "book" as IconName, title: "Oddzielaj lore od kanonu", text: "Interpretacje są cenne. Zawsze oznaczamy swoje dodatki, by nowi fani wiedzieli, co jest oficjalne, a co nasze." },
            { icon: "shield" as IconName, title: "Chroń społeczność", text: "Minimalizujemy dane, walidujemy treści i nie zbieramy niczego, czego naprawdę nie potrzebujemy. Twoje granice są ważne." },
          ].map((item) => (
            <div key={item.title} className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand)] text-[var(--accent)]"><Icon name={item.icon} size={19} /></span>
              <h3 className="mt-3 font-display text-base font-extrabold">{item.title}</h3>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--muted)]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Jedna aplikacja, dwa światy" title="Android i Windows. Wszędzie tam, gdzie jesteś." description="Interfejs dopasowuje się do ekranu: mobilny rytm na telefonie i pełny widok pracy na komputerze." />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[var(--accent)]/20" />
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-[var(--accent)]"><Icon name="download" size={22} /></span>
              <div><h3 className="font-display text-lg font-extrabold">Android</h3><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-2)]">Telefon · tablet · PWA</p></div>
            </div>
            <ul className="mt-4 space-y-2">
              {["Interfejs mobile-first z dolną nawigacją", "Instalacja z przeglądarki — bez sklepu", "Powiadomienia o nowościach w aplikacji", "Twoje konto i subskrypcje na jednym urządzeniu"].map((item) => <li key={item} className="flex items-start gap-2 text-[11px] text-[var(--muted)]"><Icon name="check" size={13} className="mt-0.5 shrink-0 text-[var(--brand-2)]" /> {item}</li>)}
            </ul>
            <button type="button" onClick={install} className="btn-dark mt-4 w-full !py-2.5 text-[11px]"><Icon name="download" size={14} /> Zainstaluj na urządzeniu</button>
          </div>
          <div className="relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[var(--accent)]/20" />
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16303d] text-[#b8e9ff]"><Icon name="grid" size={22} /></span>
              <div><h3 className="font-display text-lg font-extrabold">Windows 10 / 11</h3><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-2)]">Desktop · tablet · PWA</p></div>
            </div>
            <ul className="mt-4 space-y-2">
              {["Szerszy widok z panelem bocznym", "Skróty klawiszowe i pełne Studio twórcy", "Instalacja jako osobna aplikacja okienkowa", "Pełny edytor treści i wyglądu dla admina"].map((item) => <li key={item} className="flex items-start gap-2 text-[11px] text-[var(--muted)]"><Icon name="check" size={13} className="mt-0.5 shrink-0 text-[var(--brand-2)]" /> {item}</li>)}
            </ul>
            <button type="button" onClick={install} className="btn-outline mt-4 w-full !py-2.5 text-[11px]"><Icon name="eye" size={14} /> Jak zainstalować na Windows</button>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--accent)_12%,var(--surface))] p-3 text-[10px] leading-relaxed text-[var(--muted)]">
          <Icon name="info" size={14} className="mt-0.5 shrink-0 text-[var(--brand-2)]" />
          <p><strong className="text-[var(--ink)]">Ważne:</strong> to PWA / aplikacja webowa. Instalacja działa przez przeglądarkę. Gotowe pliki APK, EXE lub publikacja w Google Play wymagają etapu pakowania i podpisu po stronie wydawcy — panel i interfejs są przygotowane pod taki proces.</p>
        </div>
      </section>

      <section>
        <SectionHeader eyebrow="Ludzie" title="Ekipa, która stoi za głosami" action={<button type="button" onClick={() => navigate("actors")} className="btn-outline !py-2 text-[10px]">Wszyscy aktorzy <Icon name="arrowRight" size={12} /></button>} />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {content.actors.slice(0, 4).map((actor) => (
            <div key={actor.id} className="card overflow-hidden">
              <div className="aspect-square overflow-hidden bg-[var(--brand)]"><img src={actor.image} alt={actor.name} className="h-full w-full object-cover object-top" loading="lazy" /></div>
              <div className="p-3"><p className="truncate text-[11px] font-extrabold">{actor.name}</p><p className="mt-0.5 truncate text-[9px] text-[var(--muted)]">{actor.role}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <SectionHeader eyebrow="FAQ" title="Najczęstsze pytania" description="Krótko i bez ściemy." />
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="card overflow-hidden">
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} className="flex w-full items-center gap-3 p-3.5 text-left" aria-expanded={openFaq === i}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_32%,var(--surface))] text-[10px] font-extrabold text-[var(--brand)]">{i + 1}</span>
                  <span className="flex-1 text-xs font-extrabold">{faq.q}</span>
                  <Icon name="chevronDown" size={15} className={cn("shrink-0 text-[var(--muted)] transition", openFaq === i && "rotate-180")} />
                </button>
                {openFaq === i && <div className="px-3.5 pb-4 pl-12"><p className="text-[11px] leading-relaxed text-[var(--muted)]">{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[var(--radius)] bg-[var(--brand)] p-5 text-white">
            <div className="graffiti-dots absolute inset-0 opacity-20" />
            <span className="font-marker text-lg text-[var(--accent)]">napisz do nas</span>
            <h3 className="relative mt-1 font-display text-xl font-extrabold">Masz pomysł, poprawkę albo zgłoszenie?</h3>
            <p className="relative mt-1.5 text-[11px] leading-relaxed text-white/60">Redakcja czyta wszystko. Zgłoszenia bezpieczeństwa traktujemy priorytetowo.</p>
            <div className="relative mt-3 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold">{content.email}</div>
            <div className="relative mt-2 flex gap-2">
              <a href={`mailto:${content.email}`} className="btn-primary flex-1 !py-2.5 text-[10px]"><Icon name="mail" size={13} /> Napisz e-mail</a>
              <button type="button" onClick={copyEmail} className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-2.5 text-[10px] font-bold text-white hover:bg-white/10"><Icon name={copied ? "check" : "link"} size={13} /> {copied ? "OK" : "Kopiuj"}</button>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--accent)_25%,var(--surface))] text-[var(--brand)]"><Icon name="shield" size={16} /></span><div><p className="text-xs font-extrabold">Twoje bezpieczeństwo</p><p className="text-[9px] text-[var(--muted)]">Sesje, dane i prywatność</p></div></div>
            <button type="button" onClick={() => navigate("security")} className="mt-3 flex w-full items-center justify-between rounded-xl bg-[color-mix(in_srgb,var(--brand)_5%,var(--surface))] px-3 py-2.5 text-[10px] font-bold">Otwórz centrum bezpieczeństwa <Icon name="chevronRight" size={13} /></button>
          </div>
          {!currentUser && (
            <div className="card p-4">
              <p className="text-xs font-extrabold">Dołącz do {data.users.length + 12000}+ fanów</p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">Konto demo, zero formalności. Twoje dane zostają na urządzeniu.</p>
              <button type="button" onClick={() => setAuthOpen(true)} className="btn-dark mt-3 w-full !py-2.5 text-[10px]"><Icon name="google" size={13} filled /> Kontynuuj z Google</button>
            </div>
          )}
          <div className="flex items-start gap-2 rounded-2xl border border-dashed border-[var(--line)] p-3 text-[9px] leading-relaxed text-[var(--muted)]">
            <Icon name="info" size={13} className="mt-0.5 shrink-0" />
            <p>MiraVoice jest niezależnym projektem fanowskim i nie jest powiązany z oficjalnymi właścicielami marki Miraculous. Nazwy postaci służą opisowi fanowskiego archiwum.</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--surface)] p-6 text-center sm:p-8">
        {data.users[0] && <Avatar src={data.users[0].avatar} name={data.users[0].name} size={52} ring />}
        <div><h2 className="font-display text-xl font-extrabold">Gotowy, żeby coś po sobie zostawić?</h2><p className="mx-auto mt-1 max-w-md text-xs text-[var(--muted)]">Pierwszy materiał, pierwszy subskrybent, pierwsza własna teoria. Zaczynamy od jednego kliknięcia.</p></div>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => navigate("studio")} className="btn-primary !py-2.5 text-[11px]"><Icon name="play" size={13} filled /> Otwórz Studio twórcy</button>
          <button type="button" onClick={() => navigate("lore")} className="btn-outline !py-2.5 text-[11px]"><Icon name="butterfly" size={13} /> Eksploruj lore</button>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--muted)]"><Icon name="shield" size={12} /> Fan-made · zbudowane z myślą o społeczności</div>
      </section>
    </div>
  );
}
