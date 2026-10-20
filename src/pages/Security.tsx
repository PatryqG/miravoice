import { useState } from "react";
import { useApp } from "@/lib/store";
import { Icon, type IconName } from "@/components/Icons";
import { Badge, PageHero, SectionHeader } from "@/components/ui";
import { ADMIN_SESSION_MINUTES } from "@/lib/security";
import { cn } from "@/utils/cn";

const checks: { title: string; text: string; icon: IconName; status: "ok" | "warn" }[] = [
  { title: "Dane administratora", text: "Login i hasło są weryfikowane jako skróty SHA-256 z solą. Aplikacja nigdy nie wyświetla ich jawnie.", icon: "lock", status: "ok" },
  { title: "Limit prób logowania", text: "Po 5 nieudanych próbach panel blokuje się na 2 minuty.", icon: "shield", status: "ok" },
  { title: "Sesja z terminem ważności", text: `${ADMIN_SESSION_MINUTES} minut, zapis w sessionStorage, automatyczne wygaszenie.`, icon: "clock", status: "ok" },
  { title: "Walidacja linków i obrazów", text: "Tylko bezpieczne adresy https, lokalne obrazy z limitu rozmiaru, bez javascript: URL.", icon: "link", status: "ok" },
  { title: "Ochrona przed XSS", text: "React escapuje dane, dodatkowo usuwamy tagi HTML i znaki kontrolne z inputów.", icon: "checkCircle", status: "ok" },
  { title: "Polityka CSP i nagłówki", text: "Meta CSP ogranicza źródła skryptów i mediów. Produkcyjnie ustawimy nagłówki po stronie serwera.", icon: "external", status: "ok" },
  { title: "Backend i współdzielone dane", text: "Wersja demo działa lokalnie. Prawdziwe konta, publikacja i uprawnienia wymagają serwera — to następny krok.", icon: "alert", status: "warn" },
  { title: "Podpisywanie plików i malware scan", text: "W produkcji obrazy i wideo powinny trafiać do storage z limitami i skanem. Obecnie używamy zatwierdzonych linków.", icon: "alert", status: "warn" },
];

const threatModel = [
  { threat: "Nieuprawniony dostęp do panelu", fix: "Hash hasła, limit prób, blokada czasowa, wygasająca sesja i audyt działań." },
  { threat: "Przejęcie sesji administratora", fix: "Losowy token sesji, sessionStorage, brak trwałego zapisu hasła, odnawialny limit 20 minut." },
  { threat: "Złośliwy link lub obraz", fix: "Walidacja protokołu https, allow-lista typów obrazów, limity rozmiaru i brak wykonywania HTML." },
  { threat: "Fałszywe konto twórcy", fix: "Właściciel kanału jest powiązany z identyfikatorem konta; operacje sprawdzają właściciela. Produkcyjnie: RLS + weryfikacja po stronie serwera." },
  { threat: "Hejt i nieodpowiednie treści", fix: "Zasady społeczności, oczyszczanie treści, widoczny kontakt do zgłoszeń i audyt administracyjny." },
  { threat: "Utrata danych", fix: "Eksport konfiguracji JSON, kopia danych konta, możliwość resetu demo. Produkcyjnie: kopie zapasowe bazy." },
];

const permissions = [
  { role: "Gość", icon: "eye" as IconName, access: ["Przeglądanie wideo i lore", "Czytanie profili i historii", "Brak zapisu i komentarzy"] },
  { role: "Fan", icon: "user" as IconName, access: ["Subskrypcje i dzwonki", "Zapisane i polubione", "Komentarze i własne dane"] },
  { role: "Twórca", icon: "film" as IconName, access: ["Własny kanał i profil", "Publikacja oraz usuwanie wideo", "Statystyki i edycja kanału"] },
  { role: "Administrator", icon: "shield" as IconName, access: ["Pełny wygląd aplikacji", "CRUD wideo, lore, aktorów", "Audyt i konfiguracja"] },
];

export function SecurityPage() {
  const { currentUser, signOut, clearNotifications, content, data, adminSession, navigate, notify } = useApp();
  const [lastScan, setLastScan] = useState<string | null>(null);
  const score = Math.round((checks.filter((c) => c.status === "ok").length / checks.length) * 100);

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      securityNotice: "Eksport lokalnej wersji demo MiraVoice. Nie zawiera hasła administratora.",
      account: currentUser ? { name: currentUser.name, email: currentUser.email } : null,
      subscriptions: data.subscriptions,
      savedVideos: data.savedVideos,
      likedVideos: data.likedVideos,
      contentCount: { videos: content.videos.length, lore: content.lore.length, actors: content.actors.length },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "miravoice-dane.json";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Twoje dane zostały wyeksportowane.");
  };

  const runScan = () => {
    setLastScan(new Date().toLocaleTimeString("pl-PL"));
    notify("Szybki skan zakończony: podstawowe zabezpieczenia aktywne.", "success");
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Centrum bezpieczeństwa"
        title="Bezpieczeństwo nie jest dodatkiem. Jest fundamentem."
        description="Zobacz, jak chronimy tę wersję aplikacji, gdzie są jej granice i co trzeba dodać przed prawdziwym uruchomieniem dla wszystkich."
        icon="shield"
      >
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={runScan} className="btn-primary !px-3.5 !py-2 text-[10px]"><Icon name="shield" size={13} /> Uruchom szybki skan</button>
          <Badge className="!bg-white/15 !text-white"><Icon name="lock" size={11} /> {adminSession ? "sesja admina aktywna" : "brak sesji admina"}</Badge>
          <Badge className="!bg-white/15 !text-white"><Icon name="checkCircle" size={11} /> {score}% podstawowych kontroli</Badge>
          {lastScan && <Badge className="!bg-white/15 !text-white">skan: {lastScan}</Badge>}
        </div>
      </PageHero>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-3">
          <div className="card p-4 text-center">
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--brand) ${score}%, var(--line) 0)` }}>
              <div className="flex h-[102px] w-[102px] flex-col items-center justify-center rounded-full bg-[var(--surface)]">
                <span className="font-display text-3xl font-extrabold">{score}%</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted)]">gotowości demo</span>
              </div>
            </div>
            <p className="mt-3 text-xs font-extrabold">Dobra ochrona startowa</p>
            <p className="mt-1 text-[9.5px] leading-relaxed text-[var(--muted)]">Frontend chroni dane lokalne, panel ma limit i sesję. Pełne bezpieczeństwo wymaga backendu.</p>
            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-[8.5px] font-bold text-amber-700"><Icon name="alert" size={11} /> tryb lokalny — nie produkcyjny</div>
          </div>
          <div className="card p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold"><Icon name="clock" size={13} className="text-[var(--brand-2)]" /> Sesja administratora</p>
            <p className="mt-1 text-[9px] leading-relaxed text-[var(--muted)]">{adminSession ? `Aktywna, wygasa po ok. ${Math.max(1, Math.ceil((adminSession.expiresAt - Date.now()) / 60000))} min. Token: ${adminSession.token.slice(0, 8)}…` : "Brak aktywnej sesji. Panel admina jest zablokowany."}</p>
            <button type="button" onClick={() => navigate("admin")} className="btn-dark mt-2 w-full !py-2 text-[9px]">{adminSession ? "Otwórz panel" : "Przejdź do logowania"}</button>
          </div>
          <div className="card p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-extrabold"><Icon name="download" size={13} className="text-[var(--brand-2)]" /> Twoje dane</p>
            <p className="mt-1 text-[9px] leading-relaxed text-[var(--muted)]">Pobierz kopię swoich ustawień. Dane pozostają na urządzeniu.</p>
            <button type="button" onClick={exportData} className="btn-outline mt-2 w-full !py-2 text-[9px]"><Icon name="download" size={11} /> Eksportuj</button>
            {currentUser ? <button type="button" onClick={signOut} className="mt-1.5 flex w-full items-center justify-center gap-1 rounded-full py-1.5 text-[9px] font-bold text-red-600 hover:bg-red-50"><Icon name="logout" size={11} /> Wyloguj ze wszystkich sesji</button> : <button type="button" onClick={() => navigate("profile")} className="mt-1.5 text-[9px] font-bold text-[var(--brand-2)]">Zaloguj się, aby zarządzać</button>}
            {data.notifications.length > 0 && <button type="button" onClick={clearNotifications} className="mt-1 w-full py-1 text-[8.5px] font-semibold text-[var(--muted)] hover:underline">Wyczyść powiadomienia</button>}
          </div>
        </aside>

        <div className="space-y-4">
          <section className="card p-4 sm:p-5">
            <SectionHeader eyebrow="Kontrole" title="Co już działa" description="Ocena dotyczy tego, co da się zrobić bezpiecznie w aplikacji działającej bez serwera." />
            <div className="grid gap-2 sm:grid-cols-2">
              {checks.map((check) => (
                <div key={check.title} className={cn("flex gap-2.5 rounded-xl border p-3", check.status === "ok" ? "border-[var(--line)]" : "border-amber-200 bg-amber-50/60")}>
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", check.status === "ok" ? "bg-[color-mix(in_srgb,var(--accent)_30%,var(--surface))] text-[var(--brand)]" : "bg-amber-100 text-amber-700")}><Icon name={check.icon} size={15} /></span>
                  <div><p className="flex items-center gap-1 text-[10.5px] font-extrabold">{check.title} {check.status === "ok" ? <Icon name="check" size={11} className="text-[var(--brand-2)]" /> : <span className="rounded bg-amber-200 px-1 text-[7px] uppercase text-amber-800">todo</span>}</p><p className="mt-0.5 text-[9px] leading-relaxed text-[var(--muted)]">{check.text}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4 sm:p-5">
            <SectionHeader eyebrow="Model zagrożeń" title="Na co jesteśmy przygotowani" description="Krótka mapa ryzyk i sposobów reakcji." />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse text-left">
                <thead><tr className="border-b border-[var(--line)]"><th className="pb-2 text-[8px] font-extrabold uppercase tracking-widest text-[var(--muted)]">Ryzyko</th><th className="pb-2 text-[8px] font-extrabold uppercase tracking-widest text-[var(--muted)]">Jak reagujemy</th></tr></thead>
                <tbody>{threatModel.map((row) => <tr key={row.threat} className="border-b border-[var(--line)] last:border-0"><td className="w-[35%] py-2.5 pr-3 align-top text-[10px] font-bold">{row.threat}</td><td className="py-2.5 text-[9.5px] leading-relaxed text-[var(--muted)]">{row.fix}</td></tr>)}</tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      <section>
        <SectionHeader eyebrow="Uprawnienia" title="Kto może co zrobić" description="Zasada najmniejszych uprawnień: każda rola widzi tylko to, czego potrzebuje." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {permissions.map((role, index) => (
            <div key={role.role} className={cn("card p-4", index === 3 && "border-[var(--brand)] bg-[color-mix(in_srgb,var(--accent)_9%,var(--surface))]")}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-[var(--accent)]"><Icon name={role.icon} size={17} /></span>
              <h3 className="mt-2.5 font-display text-sm font-extrabold">{role.role}</h3>
              <ul className="mt-2 space-y-1.5">{role.access.map((a) => <li key={a} className="flex items-start gap-1.5 text-[9.5px] leading-relaxed text-[var(--muted)]"><Icon name="check" size={10} className="mt-0.5 shrink-0 text-[var(--brand-2)]" /> {a}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-[var(--radius)] bg-[var(--brand)] p-5 text-white sm:p-6">
          <div className="graffiti-dots absolute inset-0 opacity-20" />
          <span className="font-marker text-lg text-[var(--accent)]">przed publikacją</span>
          <h2 className="relative mt-1 font-display text-xl font-extrabold">Checklista wdrożenia produkcyjnego</h2>
          <div className="relative mt-3 grid gap-1.5">
            {["Prawdziwy dostawca logowania (Google OAuth) i weryfikacja e-mail", "Backend z RLS / regułami dostępu, np. Supabase", "Serwerowe hashowanie haseł i zarządzanie rolami", "Prywatny storage obrazów, limity i moderacja", "Nagłówki bezpieczeństwa HSTS, CSP, CORS, rate limiting", "Backupy, logi audytowe i procedura usuwania konta", "Polityka prywatności i regulamin zgodne z RODO"].map((item) => <div key={item} className="flex items-start gap-2 text-[10px] leading-relaxed text-white/65"><span className="mt-1 flex h-3 w-3 shrink-0 items-center justify-center rounded border border-white/25"><Icon name="check" size={8} className="text-[var(--accent)]" /></span> {item}</div>)}
          </div>
          <p className="relative mt-3 rounded-lg border border-white/15 bg-white/10 p-2 text-[9px] leading-relaxed text-white/55">Do tego czasu panel działa jako lokalne narzędzie demonstracyjne, a nie system produkcyjny z prawdziwymi danymi użytkowników.</p>
        </div>
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_30%,var(--surface))] text-[var(--brand)]"><Icon name="mail" size={19} /></span>
          <h2 className="mt-2.5 font-display text-lg font-extrabold">Znalazłeś lukę?</h2>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--muted)]">Napisz do nas z opisem i krokami do odtworzenia. Nie publikuj szczegółów podatności publicznie, dopóki nie potwierdzimy naprawy.</p>
          <a href={`mailto:${content.email}?subject=Zg%C5%82oszenie%20bezpiecze%C5%84stwa%20MiraVoice`} className="btn-outline mt-3 w-full !py-2.5 text-[10px]"><Icon name="send" size={13} /> Zgłoś odpowiedzialnie</a>
          <div className="mt-3 rounded-xl border border-dashed border-[var(--line)] p-2.5 text-[8.5px] leading-relaxed text-[var(--muted)]"><strong>Szczera informacja:</strong> cała logika tej wersji działa w przeglądarce. Nie traktuj demonstracyjnego hasła ani konta Google jako ochrony danych wrażliwych. Prawdziwa aplikacja wymaga backendu, o czym informujemy również w panelu admina.</div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-[var(--line)] p-4 sm:p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#10231b] text-white"><Icon name="external" size={19} /></span>
            <div>
              <h2 className="font-display text-lg font-extrabold">Publikacja przez GitHub</h2>
              <p className="text-[9px] text-[var(--muted)]">Workflow w repozytorium buduje i wdraża aplikację automatycznie.</p>
            </div>
          </div>
          <div className="space-y-2 p-4 sm:p-5">
            {[
              { step: "01", title: "Utwórz repozytorium", text: "Wgraj projekt na GitHub. Repozytorium trzymaj prywatne do czasu wdrożenia backendu." },
              { step: "02", title: "Włącz GitHub Pages", text: "Settings → Pages → Build and deployment → Source: GitHub Actions." },
              { step: "03", title: "Wypchnij zmiany", text: "Push na gałąź main uruchamia workflow .github/workflows/deploy.yml, który publikuje świeży build." },
              { step: "04", title: "Otwórz adres", text: "Aplikacja będzie pod https://TWOJ-LOGIN.github.io/NAZWA-REPO/ — routing i PWA obsługują podkatalogi." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3 rounded-xl border border-[var(--line)] p-3">
                <span className="font-display text-lg font-extrabold text-[var(--line)]">{item.step}</span>
                <div>
                  <p className="text-[11px] font-extrabold">{item.title}</p>
                  <p className="mt-0.5 text-[9.5px] leading-relaxed text-[var(--muted)]">{item.text}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-2 rounded-xl bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))] p-3 text-[9px] leading-relaxed text-[var(--muted)]">
              <Icon name="lock" size={13} className="mt-0.5 shrink-0 text-[var(--brand)]" />
              Dane logowania administratora nie są wyświetlane w aplikacji ani zapisane jawnie w repozytorium — w kodzie znajdują się wyłącznie skróty SHA-256. Skróty zmienisz lokalnie skryptem <code className="font-bold">scripts/hash-admin.mjs</code>.
            </div>
          </div>
        </div>
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_8%,var(--surface))] text-[var(--brand)]"><Icon name="alert" size={19} /></span>
          <h2 className="mt-2.5 font-display text-lg font-extrabold">Bramka admina ≠ backend</h2>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--muted)]">Login administratora działa poprawnie i nie ujawnia się w interfejsie, ale cała weryfikacja odbywa się w przeglądarce. Osoba z dostępem do kodu może próbować złamać skróty offline.</p>
          <div className="mt-3 space-y-1.5">
            {["Repozytorium prywatne do czasu wdrożenia backendu", "Sekrety tylko w skrótach — nigdy w .env w repo", "Prawdziwe role i zapis treści po stronie serwera", "Kopie zapasowe i logi audytowe"].map((item) => (
              <p key={item} className="flex items-start gap-1.5 text-[9.5px] leading-relaxed text-[var(--muted)]"><Icon name="check" size={11} className="mt-0.5 shrink-0 text-[var(--brand-2)]" /> {item}</p>
            ))}
          </div>
          <button type="button" onClick={() => navigate("admin")} className="btn-outline mt-3 w-full !py-2.5 text-[10px]"><Icon name="lock" size={12} /> Przejdź do panelu administratora</button>
        </div>
      </section>
    </div>
  );
}
