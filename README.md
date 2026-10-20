# MiraVoice

Fanowski wszechświat Miraculous: wideo, aktorzy, historia, pełne lore, społeczność z kanałami i subskrypcjami oraz panel administratora zmieniający treść i cały wygląd aplikacji. Interfejs jest mobile-first i instalowalny jako PWA na Androidzie oraz Windowsie.

## Uruchomienie

```bash
npm install
npm run dev      # tryb developerski
npm run build    # produkcja do katalogu dist/
npm run preview  # podgląd builda
```

Build jest jednoplikowy (`dist/index.html`) i gotowy do hostingu statycznego (Netlify, Vercel, GitHub Pages, Cloudflare Pages). Katalog `public/` zawiera ikony PWA, manifest i service worker.

## Co jest w aplikacji

- **Odkrywaj / Wideo** — hero, biblioteka materiałów, filtrowanie, sortowanie, odtwarzacz, komentarze, polubienia i zapisane wideo.
- **Miraculous / Lore** — bohaterowie, Kwami, moce i artefakty z kartami, filtrami i szczegółami.
- **Aktorzy** — profile ekipy głosowej z wyszukiwaniem i modalem szczegółów.
- **Historia** — interaktywna oś czasu z podziałem na epoki.
- **Społeczność** — kanały twórców, subskrypcje, dzwonki powiadomień i materiały subskrybowanych kanałów.
- **Studio twórcy** — zakładanie kanału, publikacja filmów, statystyki, edycja profilu kanału.
- **Profil** — subskrypcje, zapisane, powiadomienia, eksport własnych danych.
- **Panel administratora** — pełna edycja wyglądu (kolory, fonty, hero, teksty, zaokrąglenia, presety), CRUD filmów, lore, aktorów i osi czasu, treści „O nas”, kopie JSON i audyt zmian.
- **Centrum bezpieczeństwa** — stan zabezpieczeń, model zagrożeń, role i checklista wdrożenia.

## Konto demo Google

Na stronie logowania wybierz konto testowe (np. Zosia lub Kuba) albo wpisz własne imię i e-mail. Konto i kanał zapisują się wyłącznie w `localStorage` przeglądarki. To **nie jest** prawdziwy OAuth — został przygotowany jako realistyczna demonstracja przepływu, gotowa do podmiany na dostawcę logowania.

## Dostęp do panelu administratora

Login i hasło administratora **nie są wyświetlane w aplikacji ani w repozytorium**. W kodzie (`src/lib/security.ts`) znajdują się wyłącznie ich skróty SHA-256 z solą. Dane dostępowe przekazuje właściciel projektu poza GitHubem.

Panel ma limit 5 prób logowania i 2 minuty blokady, a sesja wygasa po 20 minutach i jest przechowywana w `sessionStorage`.

### Zmiana loginu lub hasła

Skróty wyliczasz lokalnie, bez wpisywania sekretów do plików projektu:

```bash
ADMIN_LOGIN='twoj-login' ADMIN_PASS='twoje-haslo' node scripts/hash-admin.mjs
```

Otrzymane wartości `ADMIN_LOGIN_HASH` i `ADMIN_PASSWORD_HASH` podmień w `src/lib/security.ts`, zrób commit i wypchnij. Nigdy nie commituj samych danych dostępowych ani pliku `.env`.

> **Ważne:** to bramka po stronie przeglądarki (odstrasza i ogranicza przypadkowy dostęp), a nie pełne uwierzytelnianie. Osoba z dostępem do publicznego repozytorium może próbować złamać skróty offline. Przed prawdziwym uruchomieniem dla użytkowników przenieś logowanie, role i zapis treści na backend (np. Supabase) zgodnie z sekcją poniżej. Repozytorium trzymaj prywatne do czasu wdrożenia backendu.

## Android + Windows — jak to działa

Aplikacja jest PWA, więc działa w przeglądarce i można ją „zainstalować”:

- **Android (Chrome):** menu ⋮ → *Dodaj do ekranu głównego* / *Zainstaluj aplikację*.
- **Windows (Chrome / Edge):** ikona instalacji w pasku adresu lub menu → *Aplikacje* → *Zainstaluj tę witrynę*.

Instalacja jako PWA wymaga serwowania po HTTPS (lub `localhost`). Po instalacji aplikacja otwiera się w osobnym oknie, ma ikonę i podstawowy tryb offline (app shell).

### Natywny Android (APK/AAB) — Capacitor

Gotowe opakowanie PWA w aplikację Android wymaga Androida Studio/SDK po Twojej stronie:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init MiraVoice pl.miravoice.app --web-dir=dist
npm run build
npx cap add android
npx cap sync android
npx cap open android   # Android Studio → Build APK / Bundle
```

Pamiętaj o zmianie `server.hostname` w `capacitor.config.ts` na domenę produkcyjną i o polityce prywatności przed publikacją w Google Play.

### Natywny Windows (EXE/MSIX) — Tauri lub Electron

Najlżejsze opakowanie: **Tauri**. Build Windows wykonuje się na maszynie z Windowsem i Visual Studio Build Tools:

```bash
npm install -D @tauri-apps/cli
npx tauri init
# frontendDist: "../dist", devUrl: "http://localhost:5173", beforeBuildCommand: "npm run build"
npx tauri build
```

Alternatywa: Electron (`electron-builder`) z plikiem `main.js` ładującym `dist/index.html`. Dla Microsoft Store potrzebny będzie podpis MSIX i konto Partner Center.

> Sklep Google Play i Microsoft Store wymagają Twojego konta wydawcy, podpisów i procesu weryfikacji. Aplikacja jest gotowa do opakowania, ale publikacja nie może być wykonana bez Twoich danych.

## Publikacja przez GitHub

Repozytorium zawiera gotowy workflow `.github/workflows/deploy.yml`, który po każdym pushu na `main` uruchamia kontrolę typów, buduje aplikację i publikuje ją na GitHub Pages. Routing aplikacji jest oparty na hashu (`#/wideo`), a ścieżki PWA są względne — dlatego działa również pod adresem `https://UZYTKOWNIK.github.io/NAZWA-REPO/`.

### Pierwsze wdrożenie

```bash
git init
git add .
git commit -m "MiraVoice: aplikacja fanowska"
git branch -M main
git remote add origin https://github.com/TWOJ-LOGIN/miravoice.git
git push -u origin main
```

Następnie w repozytorium:

1. **Settings → Pages** → *Build and deployment* → **Source: GitHub Actions**.
2. Otwórz zakładkę **Actions** i sprawdź workflow „Wdróż MiraVoice na GitHubie”.
3. Po zakończeniu aplikacja będzie pod adresem `https://TWOJ-LOGIN.github.io/miravoice/` (link pojawi się też w Settings → Pages).
4. Kolejne zmiany wystarczy wypchnąć: `git add . && git commit -m "opis" && git push`. Deploy uruchomi się automatycznie.

Workflow `.github/workflows/security-check.yml` dodatkowo sprawdza typy, build i obecność jawnych sekretów przy każdym PR oraz pushu.

### Ważne ustawienia

- **Prywatne repozytorium:** GitHub Pages dla repozytoriów prywatnych wymaga konta GitHub Pro/Team/Enterprise. Jeśli nie masz planu Pro, użyj publicznego repo, ale pamiętaj, że cały kod (łącznie ze skrótami haseł) będzie widoczny.
- **Bezpieczeństwo:** nie dodawaj do repo plików `.env`, kluczy API, certyfikatów ani prywatnych danych logowania. `.gitignore` już je wyklucza.
- **Domena:** w Settings → Pages → Custom domain możesz podłączyć własną domenę (np. `miravoice.pl`) i włączyć HTTPS.
- **Service worker:** po pierwszym wdrożeniu odśwież stronę dwukrotnie, aby nowa wersja cache została aktywowana.

## Prawdziwe konta i publikacja dla wszystkich

Obecna wersja jest frontendowym demo (local-first). Aby admin publikował zmiany wszystkim, potrzebny jest backend, np. Supabase:

1. Tabele: `profiles`, `channels`, `videos`, `lore`, `actors`, `history`, `appearance`, `subscriptions`, `notifications`, `comments`.
2. Storage na miniaturki i filmy z limitem rozmiaru i moderacją.
3. Prawdziwe uwierzytelnianie (Google OAuth) i rola `admin` w JWT/RLS.
4. Reguły RLS: odczyt publiczny dla treści, zapis tylko dla właściciela/admina, subskrypcje tylko dla zalogowanego.
5. Podmiana lokalnego zapisu w `src/lib/store.tsx` na żądania API; panel jest już rozdzielony na operacje CRUD.

Bez backendu zmiany wyglądu i treści są widoczne wyłącznie na urządzeniu, na którym zostały wykonane — komunikaty w aplikacji jasno to oznaczają.

## Bezpieczeństwo w tej wersji

- login i hasło administratora wyłącznie jako skróty SHA-256 (sól + pepper), bez wartości jawnych w UI i w repo,
- limit 5 prób i czasowa blokada, losowy token sesji, wygasanie sesji,
- walidacja i sanityzacja tekstów, adresów URL, obrazów i identyfikatorów,
- brak `dangerouslySetInnerHTML`, React escapuje dane, dodatkowe czyszczenie HTML,
- CSP w `index.html`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'`,
- eksport danych i konfiguracji, cache lokalny bez wysyłania na serwer.

**Ważne:** frontendowy panel nie zastępuje backendu produkcyjnego. Prawdziwe logowanie, uprawnienia i dane użytkowników muszą być weryfikowane po stronie serwera. Szczegóły i checklista znajdują się w zakładce „Bezpieczeństwo” w aplikacji.

## Stos

React 19, Vite 7, TypeScript, Tailwind CSS 4, własne zmienne CSS, dane lokalne w `localStorage`, PWA (manifest + service worker). Motywy: zielono-biały z teksturami i akcentami graffiti.

Projekt niezależny, fanowski. Nie jest powiązany z oficjalnymi właścicielami marki Miraculous.


## APK z GitHuba

W repozytorium jest workflow `.github/workflows/build-apk.yml`. Po wypchnięciu plików na GitHub wejdź w **Actions → Build MiraVoice APK → Run workflow** (albo poczekaj na automatyczny build po pushu). Po zakończeniu wybierz wykonanie workflow i pobierz artefakt **MiraVoice-APK**. W ZIP-ie będzie `app-debug.apk`. To testowy APK do ręcznej instalacji, nie podpisana wersja do Google Play.
