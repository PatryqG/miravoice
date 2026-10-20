import 'dart:math';

import 'package:flutter/material.dart';
import 'package:miravoice/admin/admin_forms.dart';
import 'package:miravoice/images.dart';
import 'package:miravoice/models.dart';
import 'package:miravoice/store.dart';
import 'package:provider/provider.dart';

// ---------------------------------------------------------------------------
// Treść: nazwa aplikacji i sekcja "O nas"
// ---------------------------------------------------------------------------

class ContentTab extends StatelessWidget {
  const ContentTab({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<AppStore>();
    final data = store.data;
    return Narrow(
      child: FieldsForm(
        submitLabel: 'Zapisz zmiany',
        specs: const [
          FieldSpec('appName', 'Nazwa aplikacji', required: true),
          FieldSpec('tagline', 'Hasło / podtytuł na stronie głównej'),
          FieldSpec('aboutTitle', 'Tytuł sekcji „O nas”'),
          FieldSpec('aboutText', 'Treść sekcji „O nas”',
              kind: FieldKind.multiline),
          FieldSpec('aboutImage', 'Zdjęcie w sekcji „O nas”',
              kind: FieldKind.image),
        ],
        initial: {
          'appName': data.appName,
          'tagline': data.tagline,
          'aboutTitle': data.aboutTitle,
          'aboutText': data.aboutText,
          'aboutImage': data.aboutImage,
        },
        onSubmit: (v) {
          store.change((d) {
            d.appName = v['appName'] ?? d.appName;
            d.tagline = v['tagline'] ?? '';
            d.aboutTitle = v['aboutTitle'] ?? '';
            d.aboutText = v['aboutText'] ?? '';
            d.aboutImage = v['aboutImage'] ?? '';
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Zapisano.')),
          );
        },
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Odcinki
// ---------------------------------------------------------------------------

class EpisodesTab extends StatelessWidget {
  const EpisodesTab({super.key});

  Future<void> _edit(BuildContext context, Episode? e) async {
    final store = context.read<AppStore>();
    final res = await openEditor(
      context,
      title: e == null ? 'Nowy odcinek' : 'Edytuj odcinek',
      specs: const [
        FieldSpec('title', 'Tytuł odcinka', required: true),
        FieldSpec('description', 'Opis', kind: FieldKind.multiline),
        FieldSpec('videoUrl', 'Link do wideo (np. YouTube)',
            kind: FieldKind.url),
        FieldSpec('thumbnail', 'Miniatura', kind: FieldKind.image),
      ],
      initial: e == null
          ? const {}
          : {
              'title': e.title,
              'description': e.description,
              'videoUrl': e.videoUrl,
              'thumbnail': e.thumbnail,
            },
    );
    if (res == null) return;
    store.change((d) {
      if (e == null) {
        d.episodes.add(Episode(
          id: newId(),
          title: res['title'] ?? '',
          description: res['description'] ?? '',
          videoUrl: res['videoUrl'] ?? '',
          thumbnail: res['thumbnail'] ?? '',
        ));
      } else {
        e.title = res['title'] ?? '';
        e.description = res['description'] ?? '';
        e.videoUrl = res['videoUrl'] ?? '';
        e.thumbnail = res['thumbnail'] ?? '';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<AppStore>();
    return CrudTab<Episode>(
      items: store.data.episodes,
      idOf: (e) => e.id,
      title: (e) => e.title,
      subtitle: (e) => e.videoUrl.isEmpty ? 'brak linku do wideo' : e.videoUrl,
      image: (e) => e.thumbnail,
      addLabel: 'Dodaj odcinek',
      onAdd: () => _edit(context, null),
      onEdit: (e) => _edit(context, e),
      onDelete: (e) =>
          store.change((d) => d.episodes.removeWhere((x) => x.id == e.id)),
      onReorder: (o, n) => store.change((d) => reorderList(d.episodes, o, n)),
    );
  }
}

// ---------------------------------------------------------------------------
// Aktorzy
// ---------------------------------------------------------------------------

class ActorsTab extends StatelessWidget {
  const ActorsTab({super.key});

  Future<void> _edit(BuildContext context, Actor? a) async {
    final store = context.read<AppStore>();
    final res = await openEditor(
      context,
      title: a == null ? 'Nowy aktor' : 'Edytuj aktora',
      specs: const [
        FieldSpec('name', 'Imię i nazwisko', required: true),
        FieldSpec('role', 'Postać / rola'),
        FieldSpec('bio', 'Opis', kind: FieldKind.multiline),
        FieldSpec('photo', 'Zdjęcie', kind: FieldKind.image),
      ],
      initial: a == null
          ? const {}
          : {
              'name': a.name,
              'role': a.role,
              'bio': a.bio,
              'photo': a.photo,
            },
    );
    if (res == null) return;
    store.change((d) {
      if (a == null) {
        d.actors.add(Actor(
          id: newId(),
          name: res['name'] ?? '',
          role: res['role'] ?? '',
          bio: res['bio'] ?? '',
          photo: res['photo'] ?? '',
        ));
      } else {
        a.name = res['name'] ?? '';
        a.role = res['role'] ?? '';
        a.bio = res['bio'] ?? '';
        a.photo = res['photo'] ?? '';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<AppStore>();
    return CrudTab<Actor>(
      items: store.data.actors,
      idOf: (a) => a.id,
      title: (a) => a.name,
      subtitle: (a) => a.role,
      image: (a) => a.photo,
      addLabel: 'Dodaj aktora',
      onAdd: () => _edit(context, null),
      onEdit: (a) => _edit(context, a),
      onDelete: (a) =>
          store.change((d) => d.actors.removeWhere((x) => x.id == a.id)),
      onReorder: (o, n) => store.change((d) => reorderList(d.actors, o, n)),
    );
  }
}

// ---------------------------------------------------------------------------
// Historia
// ---------------------------------------------------------------------------

class HistoryTab extends StatelessWidget {
  const HistoryTab({super.key});

  Future<void> _edit(BuildContext context, HistoryEntry? h) async {
    final store = context.read<AppStore>();
    final res = await openEditor(
      context,
      title: h == null ? 'Nowy wpis' : 'Edytuj wpis',
      specs: const [
        FieldSpec('when', 'Data / etap (np. 2024)'),
        FieldSpec('title', 'Tytuł', required: true),
        FieldSpec('text', 'Treść', kind: FieldKind.multiline),
        FieldSpec('image', 'Zdjęcie', kind: FieldKind.image),
      ],
      initial: h == null
          ? const {}
          : {
              'when': h.when,
              'title': h.title,
              'text': h.text,
              'image': h.image,
            },
    );
    if (res == null) return;
    store.change((d) {
      if (h == null) {
        d.history.add(HistoryEntry(
          id: newId(),
          when: res['when'] ?? '',
          title: res['title'] ?? '',
          text: res['text'] ?? '',
          image: res['image'] ?? '',
        ));
      } else {
        h.when = res['when'] ?? '';
        h.title = res['title'] ?? '';
        h.text = res['text'] ?? '';
        h.image = res['image'] ?? '';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<AppStore>();
    return CrudTab<HistoryEntry>(
      items: store.data.history,
      idOf: (h) => h.id,
      title: (h) => h.title,
      subtitle: (h) => h.when,
      image: (h) => h.image,
      addLabel: 'Dodaj wpis',
      onAdd: () => _edit(context, null),
      onEdit: (h) => _edit(context, h),
      onDelete: (h) =>
          store.change((d) => d.history.removeWhere((x) => x.id == h.id)),
      onReorder: (o, n) => store.change((d) => reorderList(d.history, o, n)),
    );
  }
}

// ---------------------------------------------------------------------------
// Miraculous: bohaterowie, moce, lore
// ---------------------------------------------------------------------------

class MiraTab extends StatelessWidget {
  const MiraTab({super.key});

  Future<void> _edit(BuildContext context, MiraEntry? m) async {
    final store = context.read<AppStore>();
    final res = await openEditor(
      context,
      title: m == null ? 'Nowy wpis Miraculous' : 'Edytuj wpis Miraculous',
      specs: const [
        FieldSpec('category', 'Rodzaj wpisu',
            kind: FieldKind.choice, options: miraCategories),
        FieldSpec('title', 'Nazwa / tytuł', required: true),
        FieldSpec('subtitle', 'Podtytuł (np. kwami i Miraculum)'),
        FieldSpec('text', 'Opis', kind: FieldKind.multiline),
        FieldSpec('image', 'Zdjęcie', kind: FieldKind.image),
      ],
      initial: m == null
          ? const {'category': 'hero'}
          : {
              'category': m.category,
              'title': m.title,
              'subtitle': m.subtitle,
              'text': m.text,
              'image': m.image,
            },
    );
    if (res == null) return;
    store.change((d) {
      if (m == null) {
        d.mira.add(MiraEntry(
          id: newId(),
          category: res['category'] ?? 'hero',
          title: res['title'] ?? '',
          subtitle: res['subtitle'] ?? '',
          text: res['text'] ?? '',
          image: res['image'] ?? '',
        ));
      } else {
        m.category = res['category'] ?? m.category;
        m.title = res['title'] ?? '';
        m.subtitle = res['subtitle'] ?? '';
        m.text = res['text'] ?? '';
        m.image = res['image'] ?? '';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<AppStore>();
    return CrudTab<MiraEntry>(
      items: store.data.mira,
      idOf: (m) => m.id,
      title: (m) => m.title,
      subtitle: (m) {
        final kind = miraCategories[m.category] ?? m.category;
        return m.subtitle.isEmpty ? kind : '$kind · ${m.subtitle}';
      },
      image: (m) => m.image,
      addLabel: 'Dodaj bohatera / moc / lore',
      onAdd: () => _edit(context, null),
      onEdit: (m) => _edit(context, m),
      onDelete: (m) =>
          store.change((d) => d.mira.removeWhere((x) => x.id == m.id)),
      onReorder: (o, n) => store.change((d) => reorderList(d.mira, o, n)),
    );
  }
}

// ---------------------------------------------------------------------------
// Wygląd: kolory, czcionki, graffiti, obrazy, menu
// ---------------------------------------------------------------------------

class _Heading extends StatelessWidget {
  const _Heading(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 28, bottom: 10),
      child: Text(
        text,
        style: Theme.of(context)
            .textTheme
            .titleMedium
            ?.copyWith(fontWeight: FontWeight.bold),
      ),
    );
  }
}

class AppearanceTab extends StatelessWidget {
  const AppearanceTab({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<AppStore>();
    final data = store.data;
    final t = data.theme;

    final colorRows =
        <(String, Color Function(ThemeSettings), void Function(ThemeSettings, Color))>[
      ('Kolor główny', (s) => s.primary, (s, c) => s.primary = c),
      ('Kolor dodatkowy (ciemny akcent)', (s) => s.accent, (s, c) => s.accent = c),
      ('Tło aplikacji', (s) => s.background, (s, c) => s.background = c),
      ('Tło kart i pasków', (s) => s.surface, (s, c) => s.surface = c),
      ('Kolor tekstu', (s) => s.text, (s, c) => s.text = c),
      ('Kolor graffiti', (s) => s.graffitiColor, (s, c) => s.graffitiColor = c),
    ];

    final fontOptions = {for (final f in appFonts) f: f};

    return Narrow(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const _Heading('Gotowe motywy'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final entry in ThemeSettings.presets.entries)
                ActionChip(
                  label: Text(entry.key),
                  onPressed: () => store.change((d) {
                    final hero = d.theme.heroImage;
                    final logo = d.theme.logoImage;
                    d.theme = entry.value();
                    d.theme.heroImage = hero;
                    d.theme.logoImage = logo;
                  }),
                ),
            ],
          ),
          const _Heading('Kolory'),
          for (final row in colorRows)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: row.$2(t),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.black26),
                ),
              ),
              title: Text(row.$1),
              trailing: Text(colorHex(row.$2(t))),
              onTap: () async {
                final picked = await pickColor(context, row.$2(t));
                if (picked != null) {
                  store.change((d) => row.$3(d.theme, picked));
                }
              },
            ),
          const _Heading('Czcionki'),
          ChoiceBox(
            label: 'Czcionka nagłówków',
            value: t.headingFont,
            options: fontOptions,
            onChanged: (v) => store.change((d) => d.theme.headingFont = v),
          ),
          const SizedBox(height: 12),
          ChoiceBox(
            label: 'Czcionka tekstu',
            value: t.bodyFont,
            options: fontOptions,
            onChanged: (v) => store.change((d) => d.theme.bodyFont = v),
          ),
          const _Heading('Zaokrąglenie rogów'),
          Slider(
            value: t.radius.clamp(0, 32).toDouble(),
            min: 0,
            max: 32,
            divisions: 16,
            label: t.radius.round().toString(),
            onChanged: (v) => store.change((d) => d.theme.radius = v),
          ),
          const _Heading('Graffiti'),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Pokaż graffiti w tle'),
            value: t.graffitiEnabled,
            onChanged: (v) => store.change((d) => d.theme.graffitiEnabled = v),
          ),
          const Text('Ilość graffiti'),
          Slider(
            value: t.graffitiDensity.clamp(0.1, 1.0).toDouble(),
            min: 0.1,
            max: 1.0,
            onChanged: (v) => store.change((d) => d.theme.graffitiDensity = v),
          ),
          TextFormField(
            initialValue: t.graffitiWords,
            decoration: const InputDecoration(
              labelText: 'Napisy graffiti (oddziel przecinkami)',
              border: OutlineInputBorder(),
            ),
            onChanged: (v) => store.change((d) => d.theme.graffitiWords = v),
          ),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerLeft,
            child: OutlinedButton.icon(
              onPressed: () => store.change(
                (d) => d.theme.graffitiSeed = Random().nextInt(1000000),
              ),
              icon: const Icon(Icons.shuffle),
              label: const Text('Losuj nowy układ graffiti'),
            ),
          ),
          const _Heading('Obrazy'),
          ImageField(
            label: 'Obraz nagłówka strony głównej',
            value: t.heroImage,
            onChanged: (v) => store.change((d) => d.theme.heroImage = v),
          ),
          const SizedBox(height: 16),
          ImageField(
            label: 'Logo w pasku aplikacji',
            value: t.logoImage,
            onChanged: (v) => store.change((d) => d.theme.logoImage = v),
          ),
          const _Heading('Menu aplikacji (zakładki)'),
          for (var i = 0; i < data.sections.length; i++)
            Card(
              key: ValueKey(data.sections[i].key),
              child: Padding(
                padding: const EdgeInsets.all(8),
                child: Row(
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          tooltip: 'W górę',
                          icon: const Icon(Icons.arrow_upward),
                          onPressed: i == 0
                              ? null
                              : () => store
                                  .change((d) => moveItem(d.sections, i, i - 1)),
                        ),
                        IconButton(
                          visualDensity: VisualDensity.compact,
                          tooltip: 'W dół',
                          icon: const Icon(Icons.arrow_downward),
                          onPressed: i == data.sections.length - 1
                              ? null
                              : () => store
                                  .change((d) => moveItem(d.sections, i, i + 1)),
                        ),
                      ],
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextFormField(
                        initialValue: data.sections[i].label,
                        decoration: const InputDecoration(
                          labelText: 'Nazwa zakładki',
                          border: OutlineInputBorder(),
                          isDense: true,
                        ),
                        onChanged: (v) => store.change(
                          (d) => d.sections[i].label = v,
                        ),
                      ),
                    ),
                    Switch(
                      value: data.sections[i].visible,
                      onChanged: (v) => store.change(
                        (d) => d.sections[i].visible = v,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 28),
          Align(
            alignment: Alignment.centerLeft,
            child: OutlinedButton.icon(
              onPressed: () async {
                final ok = await confirmDialog(
                  context,
                  'Przywrócić domyślny wygląd i menu? Treści (odcinki, aktorzy itd.) zostaną bez zmian.',
                );
                if (ok) {
                  store.change((d) {
                    d.theme = ThemeSettings.green();
                    d.sections = defaultSections();
                  });
                }
              },
              icon: const Icon(Icons.restore),
              label: const Text('Przywróć domyślny wygląd'),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Konto: zmiana hasła, wylogowanie
// ---------------------------------------------------------------------------

class AccountTab extends StatefulWidget {
  const AccountTab({super.key});

  @override
  State<AccountTab> createState() => _AccountTabState();
}

class _AccountTabState extends State<AccountTab> {
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _repeat = TextEditingController();
  String? _message;
  bool _isError = false;

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _repeat.dispose();
    super.dispose();
  }

  Future<void> _change() async {
    final store = context.read<AppStore>();
    if (_next.text != _repeat.text) {
      setState(() {
        _message = 'Nowe hasła nie są takie same.';
        _isError = true;
      });
      return;
    }
    final error = await store.changePassword(_current.text, _next.text);
    if (!mounted) return;
    setState(() {
      _message = error ?? 'Hasło zostało zmienione.';
      _isError = error != null;
    });
    if (error == null) {
      _current.clear();
      _next.clear();
      _repeat.clear();
    }
  }

  Widget _passwordField(TextEditingController c, String label) => TextField(
        controller: c,
        obscureText: true,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
        ),
      );

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Narrow(
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const _Heading('Zmiana hasła administratora'),
          _passwordField(_current, 'Obecne hasło'),
          const SizedBox(height: 12),
          _passwordField(_next, 'Nowe hasło (min. 6 znaków)'),
          const SizedBox(height: 12),
          _passwordField(_repeat, 'Powtórz nowe hasło'),
          const SizedBox(height: 16),
          Align(
            alignment: Alignment.centerLeft,
            child: FilledButton(
              onPressed: _change,
              child: const Text('Zmień hasło'),
            ),
          ),
          if (_message != null) ...[
            const SizedBox(height: 12),
            Text(
              _message!,
              style: TextStyle(color: _isError ? cs.error : cs.primary),
            ),
          ],
          const _Heading('Gdzie zapisują się dane?'),
          const Text(
            'Treści, zdjęcia i ustawienia wyglądu są zapisywane lokalnie na '
            'tym urządzeniu. Zmiany widać więc tylko w tej instalacji '
            'aplikacji. Żeby zmiany admina trafiały do wszystkich '
            'użytkowników, trzeba podłączyć serwer.',
          ),
        ],
      ),
    );
  }
}
