import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { Avatar, ErrorNote, Modal } from "@/components/ui";
import { Icon, Logo } from "@/components/Icons";
import { safeImageUrl } from "@/lib/security";

export function AuthModal() {
  const { authOpen, setAuthOpen, data, signInWithGoogle, navigate } = useApp();
  const [step, setStep] = useState<"intro" | "accounts">("intro");
  const [custom, setCustom] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authOpen) {
      setStep("intro");
      setCustom(false);
      setError("");
    }
  }, [authOpen]);

  const close = () => setAuthOpen(false);

  const submit = (accountName: string, accountEmail: string) => {
    const result = signInWithGoogle({ name: accountName, email: accountEmail });
    if (!result.ok) {
      setError(result.error ?? "Nie udało się zalogować.");
      return;
    }
    setError("");
    close();
  };

  const demoAccounts = data.users.filter((u) => u.provider === "google").slice(0, 3);

  return (
    <Modal open={authOpen} onClose={close} hideHeader>
      <div className="relative overflow-hidden">
        <div className="relative bg-[var(--brand)] px-6 pb-8 pt-5 text-white">
          <div className="graffiti-dots absolute inset-0 opacity-20" />
          <div className="absolute -right-10 -top-8 h-40 w-40 rounded-full border-[20px] border-[var(--accent)] opacity-20" />
          <div className="relative flex items-start justify-between">
            <Logo size={42} />
            <button type="button" onClick={close} aria-label="Zamknij logowanie" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20">
              <Icon name="x" size={17} />
            </button>
          </div>
          <span className="relative mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.16em] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> Twoje konto fandomu
          </span>
          <h2 className="relative mt-3 text-balance font-display text-2xl font-extrabold leading-tight">
            {step === "intro" ? "Wejdź do środka. Twórz, oglądaj, subskrybuj." : "Wybierz konto Google"}
          </h2>
          <p className="relative mt-2 max-w-sm text-xs leading-relaxed text-white/65">
            {step === "intro"
              ? "Jedno konto wystarczy, by założyć kanał, komentować i dostawać powiadomienia o nowych cudach."
              : "To ekran demonstracyjnego logowania. Wybierz konto testowe lub wpisz własne dane."}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          {step === "intro" ? (
            <>
              <button
                type="button"
                onClick={() => setStep("accounts")}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--line)] bg-white px-4 py-3.5 text-sm font-bold text-[#202124] shadow-sm transition hover:border-[var(--brand)] hover:shadow-md"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"/>
                  <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2a7 7 0 0 1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z"/>
                  <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z"/>
                  <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1A7 7 0 0 1 12 4.8Z"/>
                </svg>
                Kontynuuj z Google
              </button>
              <div className="my-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                <span className="h-px flex-1 bg-[var(--line)]" /> albo bez konta <span className="h-px flex-1 bg-[var(--line)]" />
              </div>
              <button type="button" onClick={() => navigate("videos")} className="w-full rounded-full px-4 py-2.5 text-xs font-bold text-[var(--brand-2)] transition hover:bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))]">
                Przeglądaj jako gość
              </button>
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-[color-mix(in_srgb,var(--accent)_18%,var(--surface))] p-3">
                <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-[var(--brand)]" />
                <p className="text-[10.5px] leading-relaxed text-[var(--muted)]">
                  To wersja demonstracyjna bez prawdziwego OAuth. Konto, kanał i subskrypcje zapisują się tylko na tym urządzeniu. Prawdziwe logowanie Google dodamy po konfiguracji dostawcy i backendu.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                {demoAccounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => submit(account.name, account.email)}
                    className="flex w-full items-center gap-3 rounded-2xl px-2.5 py-2.5 text-left transition hover:bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))]"
                  >
                    <Avatar src={safeImageUrl(account.avatar) ?? ""} name={account.name} size={38} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{account.name}</span>
                      <span className="block truncate text-[11px] text-[var(--muted)]">{account.email}</span>
                    </span>
                    {account.channelId && <span className="rounded-full bg-[color-mix(in_srgb,var(--brand)_7%,var(--surface))] px-2 py-1 text-[9px] font-bold text-[var(--brand)]">twórca</span>}
                  </button>
                ))}
              </div>

              {!custom ? (
                <button type="button" onClick={() => setCustom(true)} className="mt-2 flex w-full items-center gap-3 rounded-2xl px-2.5 py-3 text-left transition hover:bg-[color-mix(in_srgb,var(--brand)_6%,var(--surface))]">
                  <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-dashed border-[var(--line)] text-[var(--muted)]"><Icon name="user" size={18} /></span>
                  <span className="text-sm font-semibold">Użyj innego konta</span>
                </button>
              ) : (
                <form
                  className="mt-3 space-y-3 rounded-2xl border border-[var(--line)] p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit(name, email);
                  }}
                >
                  <div>
                    <label className="label" htmlFor="google-name">Imię i nazwisko</label>
                    <input id="google-name" className="field" value={name} onChange={(e) => setName(e.target.value.slice(0, 48))} placeholder="np. Ola Wiśniewska" autoComplete="name" />
                  </div>
                  <div>
                    <label className="label" htmlFor="google-email">Adres e-mail</label>
                    <input id="google-email" className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 160))} placeholder="ty@example.com" autoComplete="email" />
                  </div>
                  <button type="submit" className="btn-primary w-full !py-2.5 text-xs">Utwórz konto demo</button>
                </form>
              )}

              {error && <div className="mt-3"><ErrorNote>{error}</ErrorNote></div>}

              <button type="button" onClick={() => { setStep("intro"); setCustom(false); setError(""); }} className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)]">
                <Icon name="chevronLeft" size={14} /> Wróć
              </button>
              <p className="mt-4 text-[9.5px] leading-relaxed text-[var(--muted)]">
                Kontynuując akceptujesz zasady społeczności MiraVoice. Nie używamy Twojego hasła Google w tej wersji demo. Zero sprzedaży danych, zero spamu.
              </p>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
