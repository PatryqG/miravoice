# MiraVoice

Aplikacja we Flutterze (Android + Windows z jednego kodu).

Sekcje: **O nas, Wideo, Aktorzy, Historia, Miraculous** (bohaterowie, moce, lore)
oraz **panel administratora** z edycją treści, zdjęć, odcinków i całego wyglądu.
Motyw domyślny: zielono-biały z graffiti rysowanym kodem.

## Co jest potrzebne

1. [Flutter SDK](https://docs.flutter.dev/get-started/install) (stable).
2. Na Windows (wersja PC): **Visual Studio 2022** z pakietem
   **„Programowanie aplikacji klasycznych w języku C++”**.
3. Na Windows: włączony **Tryb dewelopera**
   (Ustawienia → System → Dla deweloperów) - bez tego `flutter pub get`
   zgłosi błąd symlinków.
4. Na Androida: Android Studio (SDK) albo telefon z włączonym debugowaniem USB.

Sprawdź środowisko komendą `flutter doctor`.

## Uruchomienie

W folderze projektu, w PowerShell:

```powershell
.\setup.ps1                # jednorazowo: tworzy android/ i windows/, dodaje INTERNET, pobiera biblioteki
flutter run -d windows     # wersja PC
flutter run                # Android (telefon podłączony lub emulator)
```

Jeśli wolisz bez skryptu:

```powershell
flutter create --platforms=android,windows --org pl.miravoice --project-name miravoice .
flutter pub get
```

i dopisz w `android/app/src/main/AndroidManifest.xml`, zaraz pod linią `<manifest ...>`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

Bez tego wersja **release** na Androidzie nie pokaże obrazków z linków ani
czcionek Google (w trybie debug działa zawsze).

## Budowanie gotowych plików

```powershell
flutter build windows --release   # wynik: build\windows\x64\runner\Release\ (cały folder, z miravoice.exe)
flutter build apk --release       # wynik: build\app\outputs\flutter-apk\app-release.apk
flutter build appbundle           # plik .aab do Google Play
```

Plik `.exe` wymaga całego folderu `Release` obok siebie (są tam biblioteki DLL).
Publikacja w Google Play wymaga konta deweloperskiego i podpisania aplikacji:
<https://docs.flutter.dev/deployment/android>.

## Panel administratora

- Ikona **kłódki** w prawym górnym rogu → logowanie.
- Hasło startowe: **`miravoice`** - zmień je od razu w zakładce **Konto**.
- Zakładki panelu:
  - **Treść** - nazwa aplikacji, hasło/podtytuł, sekcja „O nas” (tekst + zdjęcie),
  - **Odcinki** - dodawanie/edycja/usuwanie, miniatura, link do wideo, kolejność (przeciąganie),
  - **Aktorzy**, **Historia**, **Miraculous** (bohaterowie / moce / lore) - to samo,
  - **Wygląd** - gotowe motywy, wszystkie kolory, czcionki, zaokrąglenie rogów,
    graffiti (włącz/wyłącz, ilość, napisy, losowanie układu), obraz nagłówka, logo,
    nazwy / kolejność / widoczność zakładek menu, przywracanie domyślnego wyglądu,
  - **Konto** - zmiana hasła, informacje o zapisie danych.
- Zmiany wyglądu widać na żywo.

## Ważne ograniczenia

- **Dane są zapisywane lokalnie na urządzeniu.** Admin edytuje aplikację na
  swoim telefonie/PC, a inni użytkownicy zobaczą te zmiany dopiero po
  podłączeniu serwera (np. Firebase / Supabase / własne API). Miejsce do
  podpięcia to metoda `AppStore.change` w `lib/store.dart`.
- Hasło admina chroni panel tylko w obrębie aplikacji (przechowywane jako skrót
  z solą). Przy serwerze logowanie trzeba przenieść na serwer.
- **Wideo** otwiera się w przeglądarce / aplikacji YouTube po kliknięciu
  „Oglądaj” (oficjalny odtwarzacz wideo Fluttera nie obsługuje Windowsa).
- Czcionki (Permanent Marker, Poppins itd.) są pobierane z Google Fonts przy
  pierwszym uruchomieniu - potrzebny internet. Offline aplikacja użyje czcionki
  systemowej.
- Wersja webowa i iOS nie są przygotowane (zdjęcia z dysku wymagają `dart:io`).
- Zdjęcia, logo i grafiki związane z Miraculous należą do ich właścicieli praw -
  używaj własnych lub licencjonowanych materiałów, szczególnie przed publikacją
  w sklepie.

## Struktura

```
lib/
  main.dart            start aplikacji
  models.dart          modele danych + domyślna treść i motywy
  store.dart           stan, zapis lokalny, logowanie admina
  theme_builder.dart   motyw budowany z ustawień admina
  graffiti.dart        rysowane graffiti i tytuły
  images.dart          zdjęcia (plik / link), wybór pliku
  widgets.dart         karty, układ responsywny, otwieranie linków
  screens/             ekrany użytkownika
  admin/               logowanie i panel administratora
test/models_test.dart  testy modelu danych (uruchom: flutter test)
```
