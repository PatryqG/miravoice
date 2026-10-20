import 'dart:ui' show Color;

String newId() => DateTime.now().microsecondsSinceEpoch.toString();

/// Zmiana kolejności dla ReorderableListView (onReorder).
void reorderList<T>(List<T> list, int oldIndex, int newIndex) {
  if (newIndex > oldIndex) newIndex -= 1;
  final item = list.removeAt(oldIndex);
  list.insert(newIndex, item);
}

/// Przeniesienie elementu na konkretną pozycję (strzałki góra/dół).
void moveItem<T>(List<T> list, int from, int to) {
  if (to < 0 || to >= list.length) return;
  final item = list.removeAt(from);
  list.insert(to, item);
}

String _str(Map<String, dynamic> j, String key, [String fallback = '']) {
  final v = j[key];
  return v is String ? v : fallback;
}

double _num(Map<String, dynamic> j, String key, double fallback) {
  final v = j[key];
  return v is num ? v.toDouble() : fallback;
}

bool _bool(Map<String, dynamic> j, String key, bool fallback) {
  final v = j[key];
  return v is bool ? v : fallback;
}

Color _color(Map<String, dynamic> j, String key, Color fallback) {
  final v = j[key];
  return v is int ? Color(v) : fallback;
}

List<T> _list<T>(
  Map<String, dynamic> j,
  String key,
  T Function(Map<String, dynamic>) parse,
) {
  final v = j[key];
  if (v is! List) return <T>[];
  return <T>[
    for (final e in v)
      if (e is Map) parse(Map<String, dynamic>.from(e)),
  ];
}

/// Czcionki do wyboru w panelu admina (Google Fonts).
const appFonts = <String>[
  'Permanent Marker',
  'Bangers',
  'Rubik Spray Paint',
  'Rock Salt',
  'Poppins',
  'Lato',
  'Montserrat',
  'Nunito',
  'Roboto',
  'Oswald',
];

const miraCategories = <String, String>{
  'hero': 'Bohater',
  'power': 'Moc',
  'lore': 'Lore',
};

// ---------------------------------------------------------------------------
// Wygląd aplikacji
// ---------------------------------------------------------------------------

class ThemeSettings {
  ThemeSettings({
    required this.primary,
    required this.accent,
    required this.background,
    required this.surface,
    required this.text,
    required this.graffitiColor,
    required this.headingFont,
    required this.bodyFont,
    required this.radius,
    required this.graffitiEnabled,
    required this.graffitiDensity,
    required this.graffitiWords,
    required this.graffitiSeed,
    this.heroImage = '',
    this.logoImage = '',
  });

  Color primary;
  Color accent;
  Color background;
  Color surface;
  Color text;
  Color graffitiColor;
  String headingFont;
  String bodyFont;
  double radius;
  bool graffitiEnabled;
  double graffitiDensity;
  String graffitiWords;
  int graffitiSeed;
  String heroImage;
  String logoImage;

  /// Domyślny motyw: zielono-biały z graffiti.
  factory ThemeSettings.green() => ThemeSettings(
        primary: const Color(0xFF16A34A),
        accent: const Color(0xFF0B5D2A),
        background: const Color(0xFFF7FCF8),
        surface: const Color(0xFFFFFFFF),
        text: const Color(0xFF10261A),
        graffitiColor: const Color(0xFF22C55E),
        headingFont: 'Permanent Marker',
        bodyFont: 'Poppins',
        radius: 18,
        graffitiEnabled: true,
        graffitiDensity: 0.6,
        graffitiWords: 'MIRA, VOICE',
        graffitiSeed: 7,
      );

  factory ThemeSettings.darkForest() => ThemeSettings(
        primary: const Color(0xFF22C55E),
        accent: const Color(0xFF86EFAC),
        background: const Color(0xFF0A1F14),
        surface: const Color(0xFF12301F),
        text: const Color(0xFFEAFBEF),
        graffitiColor: const Color(0xFF4ADE80),
        headingFont: 'Permanent Marker',
        bodyFont: 'Poppins',
        radius: 18,
        graffitiEnabled: true,
        graffitiDensity: 0.7,
        graffitiWords: 'MIRA, VOICE',
        graffitiSeed: 21,
      );

  factory ThemeSettings.neon() => ThemeSettings(
        primary: const Color(0xFF39FF14),
        accent: const Color(0xFFFFFFFF),
        background: const Color(0xFF0B0F0C),
        surface: const Color(0xFF151B16),
        text: const Color(0xFFFFFFFF),
        graffitiColor: const Color(0xFF39FF14),
        headingFont: 'Bangers',
        bodyFont: 'Nunito',
        radius: 8,
        graffitiEnabled: true,
        graffitiDensity: 0.9,
        graffitiWords: 'MIRA, VOICE, !',
        graffitiSeed: 99,
      );

  factory ThemeSettings.clean() => ThemeSettings(
        primary: const Color(0xFF15803D),
        accent: const Color(0xFF14532D),
        background: const Color(0xFFFFFFFF),
        surface: const Color(0xFFFFFFFF),
        text: const Color(0xFF111827),
        graffitiColor: const Color(0xFF86EFAC),
        headingFont: 'Montserrat',
        bodyFont: 'Lato',
        radius: 12,
        graffitiEnabled: false,
        graffitiDensity: 0.3,
        graffitiWords: 'MIRA, VOICE',
        graffitiSeed: 3,
      );

  static final Map<String, ThemeSettings Function()> presets = {
    'Zielony graffiti': ThemeSettings.green,
    'Ciemny las': ThemeSettings.darkForest,
    'Neon': ThemeSettings.neon,
    'Czysta biel': ThemeSettings.clean,
  };

  Map<String, dynamic> toJson() => {
        'primary': primary.toARGB32(),
        'accent': accent.toARGB32(),
        'background': background.toARGB32(),
        'surface': surface.toARGB32(),
        'text': text.toARGB32(),
        'graffitiColor': graffitiColor.toARGB32(),
        'headingFont': headingFont,
        'bodyFont': bodyFont,
        'radius': radius,
        'graffitiEnabled': graffitiEnabled,
        'graffitiDensity': graffitiDensity,
        'graffitiWords': graffitiWords,
        'graffitiSeed': graffitiSeed,
        'heroImage': heroImage,
        'logoImage': logoImage,
      };

  factory ThemeSettings.fromJson(Map<String, dynamic> j) {
    final d = ThemeSettings.green();
    return ThemeSettings(
      primary: _color(j, 'primary', d.primary),
      accent: _color(j, 'accent', d.accent),
      background: _color(j, 'background', d.background),
      surface: _color(j, 'surface', d.surface),
      text: _color(j, 'text', d.text),
      graffitiColor: _color(j, 'graffitiColor', d.graffitiColor),
      headingFont: _str(j, 'headingFont', d.headingFont),
      bodyFont: _str(j, 'bodyFont', d.bodyFont),
      radius: _num(j, 'radius', d.radius),
      graffitiEnabled: _bool(j, 'graffitiEnabled', d.graffitiEnabled),
      graffitiDensity: _num(j, 'graffitiDensity', d.graffitiDensity),
      graffitiWords: _str(j, 'graffitiWords', d.graffitiWords),
      graffitiSeed: (j['graffitiSeed'] is int)
          ? j['graffitiSeed'] as int
          : d.graffitiSeed,
      heroImage: _str(j, 'heroImage'),
      logoImage: _str(j, 'logoImage'),
    );
  }
}

// ---------------------------------------------------------------------------
// Menu aplikacji
// ---------------------------------------------------------------------------

class NavSection {
  NavSection({required this.key, required this.label, this.visible = true});

  final String key;
  String label;
  bool visible;

  Map<String, dynamic> toJson() =>
      {'key': key, 'label': label, 'visible': visible};

  factory NavSection.fromJson(Map<String, dynamic> j) => NavSection(
        key: _str(j, 'key'),
        label: _str(j, 'label'),
        visible: _bool(j, 'visible', true),
      );
}

List<NavSection> defaultSections() => [
      NavSection(key: 'about', label: 'O nas'),
      NavSection(key: 'videos', label: 'Wideo'),
      NavSection(key: 'actors', label: 'Aktorzy'),
      NavSection(key: 'history', label: 'Historia'),
      NavSection(key: 'miraculous', label: 'Miraculous'),
    ];

// ---------------------------------------------------------------------------
// Treści
// ---------------------------------------------------------------------------

class Episode {
  Episode({
    required this.id,
    required this.title,
    this.description = '',
    this.videoUrl = '',
    this.thumbnail = '',
  });

  final String id;
  String title;
  String description;
  String videoUrl;
  String thumbnail;

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'videoUrl': videoUrl,
        'thumbnail': thumbnail,
      };

  factory Episode.fromJson(Map<String, dynamic> j) => Episode(
        id: _str(j, 'id', newId()),
        title: _str(j, 'title'),
        description: _str(j, 'description'),
        videoUrl: _str(j, 'videoUrl'),
        thumbnail: _str(j, 'thumbnail'),
      );
}

class Actor {
  Actor({
    required this.id,
    required this.name,
    this.role = '',
    this.bio = '',
    this.photo = '',
  });

  final String id;
  String name;
  String role;
  String bio;
  String photo;

  Map<String, dynamic> toJson() =>
      {'id': id, 'name': name, 'role': role, 'bio': bio, 'photo': photo};

  factory Actor.fromJson(Map<String, dynamic> j) => Actor(
        id: _str(j, 'id', newId()),
        name: _str(j, 'name'),
        role: _str(j, 'role'),
        bio: _str(j, 'bio'),
        photo: _str(j, 'photo'),
      );
}

class HistoryEntry {
  HistoryEntry({
    required this.id,
    required this.when,
    required this.title,
    this.text = '',
    this.image = '',
  });

  final String id;
  String when;
  String title;
  String text;
  String image;

  Map<String, dynamic> toJson() =>
      {'id': id, 'when': when, 'title': title, 'text': text, 'image': image};

  factory HistoryEntry.fromJson(Map<String, dynamic> j) => HistoryEntry(
        id: _str(j, 'id', newId()),
        when: _str(j, 'when'),
        title: _str(j, 'title'),
        text: _str(j, 'text'),
        image: _str(j, 'image'),
      );
}

/// Wpis w sekcji Miraculous: bohater ('hero'), moc ('power') lub lore ('lore').
class MiraEntry {
  MiraEntry({
    required this.id,
    required this.category,
    required this.title,
    this.subtitle = '',
    this.text = '',
    this.image = '',
  });

  final String id;
  String category;
  String title;
  String subtitle;
  String text;
  String image;

  Map<String, dynamic> toJson() => {
        'id': id,
        'category': category,
        'title': title,
        'subtitle': subtitle,
        'text': text,
        'image': image,
      };

  factory MiraEntry.fromJson(Map<String, dynamic> j) => MiraEntry(
        id: _str(j, 'id', newId()),
        category: _str(j, 'category', 'lore'),
        title: _str(j, 'title'),
        subtitle: _str(j, 'subtitle'),
        text: _str(j, 'text'),
        image: _str(j, 'image'),
      );
}

// ---------------------------------------------------------------------------
// Całość danych aplikacji
// ---------------------------------------------------------------------------

class AppData {
  AppData({
    required this.appName,
    required this.tagline,
    required this.aboutTitle,
    required this.aboutText,
    required this.aboutImage,
    required this.theme,
    required this.sections,
    required this.episodes,
    required this.actors,
    required this.history,
    required this.mira,
  });

  String appName;
  String tagline;
  String aboutTitle;
  String aboutText;
  String aboutImage;
  ThemeSettings theme;
  List<NavSection> sections;
  List<Episode> episodes;
  List<Actor> actors;
  List<HistoryEntry> history;
  List<MiraEntry> mira;

  /// Przykładowa treść - admin podmienia ją na własną w panelu.
  factory AppData.defaults() => AppData(
        appName: 'MiraVoice',
        tagline: 'Witaj w świecie MiraVoice',
        aboutTitle: 'O nas',
        aboutText:
            'To jest przykładowy opis projektu. Zaloguj się do panelu '
            'administratora (ikona kłódki u góry) i zastąp go własną treścią.',
        aboutImage: '',
        theme: ThemeSettings.green(),
        sections: defaultSections(),
        episodes: [
          Episode(
            id: 'e1',
            title: 'Przykładowy odcinek 1',
            description:
                'Opis odcinka. Tytuł, opis, miniaturę i link do wideo '
                'zmienisz w panelu administratora.',
          ),
        ],
        actors: [
          Actor(
            id: 'a1',
            name: 'Imię i nazwisko',
            role: 'Postać',
            bio: 'Krótka notka o aktorze.',
          ),
          Actor(
            id: 'a2',
            name: 'Imię i nazwisko',
            role: 'Postać',
            bio: 'Krótka notka o aktorze.',
          ),
        ],
        history: [
          HistoryEntry(
            id: 'h1',
            when: 'Etap 1',
            title: 'Początek projektu',
            text: 'Tu opisz, jak wszystko się zaczęło.',
          ),
          HistoryEntry(
            id: 'h2',
            when: 'Etap 2',
            title: 'Kolejny krok',
            text: 'Tu opisz kolejne ważne wydarzenie.',
          ),
        ],
        mira: [
          MiraEntry(
            id: 'm1',
            category: 'hero',
            title: 'Biedronka',
            subtitle: 'Kwami: Tikki · Kolczyki Biedronki',
            text: 'Bohaterka Paryża. Jej Miraculum daje moc stworzenia, '
                'a w walce liczy się przede wszystkim pomysłowość.',
          ),
          MiraEntry(
            id: 'm2',
            category: 'hero',
            title: 'Czarny Kot',
            subtitle: 'Kwami: Plagg · Pierścień Czarnego Kota',
            text: 'Partner Biedronki. Jego Miraculum daje moc zniszczenia.',
          ),
          MiraEntry(
            id: 'm3',
            category: 'hero',
            title: 'Władca Ciem',
            subtitle: 'Główny przeciwnik',
            text: 'Zamienia negatywne emocje ludzi w akumy i wysyła je, '
                'by stworzyć złoczyńców.',
          ),
          MiraEntry(
            id: 'm4',
            category: 'power',
            title: 'Szczęśliwy Traf',
            subtitle: 'Moc Biedronki',
            text: 'Przywołuje przedmiot, który trzeba sprytnie wykorzystać, '
                'żeby rozwiązać problem.',
          ),
          MiraEntry(
            id: 'm5',
            category: 'power',
            title: 'Kataklizm',
            subtitle: 'Moc Czarnego Kota',
            text: 'Dotknięcie niszczy to, czego dotknie. Można go użyć '
                'tylko raz, zanim bohater straci transformację.',
          ),
          MiraEntry(
            id: 'm6',
            category: 'lore',
            title: 'Czym są Miraculum?',
            text: 'Miraculum to magiczne klejnoty. Po połączeniu z kwami '
                'dają właścicielowi niezwykłe moce.',
          ),
        ],
      );

  Map<String, dynamic> toJson() => {
        'appName': appName,
        'tagline': tagline,
        'aboutTitle': aboutTitle,
        'aboutText': aboutText,
        'aboutImage': aboutImage,
        'theme': theme.toJson(),
        'sections': sections.map((e) => e.toJson()).toList(),
        'episodes': episodes.map((e) => e.toJson()).toList(),
        'actors': actors.map((e) => e.toJson()).toList(),
        'history': history.map((e) => e.toJson()).toList(),
        'mira': mira.map((e) => e.toJson()).toList(),
      };

  factory AppData.fromJson(Map<String, dynamic> j) {
    final d = AppData.defaults();
    final themeJson = j['theme'];
    final sections = _list(j, 'sections', NavSection.fromJson);
    for (final def in defaultSections()) {
      if (!sections.any((s) => s.key == def.key)) sections.add(def);
    }
    return AppData(
      appName: _str(j, 'appName', d.appName),
      tagline: _str(j, 'tagline', d.tagline),
      aboutTitle: _str(j, 'aboutTitle', d.aboutTitle),
      aboutText: _str(j, 'aboutText', d.aboutText),
      aboutImage: _str(j, 'aboutImage'),
      theme: themeJson is Map
          ? ThemeSettings.fromJson(Map<String, dynamic>.from(themeJson))
          : d.theme,
      sections: sections,
      episodes: _list(j, 'episodes', Episode.fromJson),
      actors: _list(j, 'actors', Actor.fromJson),
      history: _list(j, 'history', HistoryEntry.fromJson),
      mira: _list(j, 'mira', MiraEntry.fromJson),
    );
  }
}
