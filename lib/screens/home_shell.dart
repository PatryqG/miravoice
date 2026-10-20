import 'package:flutter/material.dart';
import 'package:miravoice/admin/admin_panel.dart';
import 'package:miravoice/graffiti.dart';
import 'package:miravoice/images.dart';
import 'package:miravoice/screens/about_screen.dart';
import 'package:miravoice/screens/actors_screen.dart';
import 'package:miravoice/screens/history_screen.dart';
import 'package:miravoice/screens/miraculous_screen.dart';
import 'package:miravoice/screens/videos_screen.dart';
import 'package:miravoice/store.dart';
import 'package:miravoice/widgets.dart';
import 'package:provider/provider.dart';

const _sectionIcons = <String, IconData>{
  'about': Icons.info_outline,
  'videos': Icons.play_circle_outline,
  'actors': Icons.mic_none,
  'history': Icons.history_edu,
  'miraculous': Icons.auto_awesome,
};

IconData _iconFor(String key) => _sectionIcons[key] ?? Icons.circle_outlined;

/// Główny układ: na telefonie dolny pasek, na PC boczne menu.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  Widget _screenFor(String key) {
    switch (key) {
      case 'about':
        return const AboutScreen();
      case 'videos':
        return const VideosScreen();
      case 'actors':
        return const ActorsScreen();
      case 'history':
        return const HistoryScreen();
      case 'miraculous':
        return const MiraculousScreen();
      default:
        return const SizedBox.shrink();
    }
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<AppStore>();
    final data = store.data;
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    final visible = data.sections.where((s) => s.visible).toList();
    final index =
        visible.isEmpty ? 0 : _index.clamp(0, visible.length - 1).toInt();
    final showNav = visible.length >= 2;
    final wide = MediaQuery.sizeOf(context).width >= 800;

    final content = GraffitiBackground(
      settings: data.theme,
      child: visible.isEmpty
          ? const EmptyState(
              message: 'Wszystkie zakładki są ukryte. Włącz je w panelu '
                  'administratora (Wygląd → Menu aplikacji).',
            )
          : _screenFor(visible[index].key),
    );

    return Scaffold(
      appBar: AppBar(
        backgroundColor: cs.surface,
        surfaceTintColor: Colors.transparent,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (data.theme.logoImage.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(right: 10),
                child: SizedBox(
                  width: 36,
                  height: 36,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: AppImage(data.theme.logoImage),
                  ),
                ),
              ),
            Flexible(
              child: Text(
                data.appName,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.headlineSmall,
              ),
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(4),
          child: Container(height: 4, color: cs.primary),
        ),
        actions: [
          IconButton(
            tooltip: store.isAdmin
                ? 'Panel administratora'
                : 'Zaloguj jako administrator',
            icon: Icon(
              store.isAdmin ? Icons.admin_panel_settings : Icons.lock_outline,
            ),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) =>
                    store.isAdmin ? const AdminPanel() : const AdminLogin(),
              ),
            ),
          ),
        ],
      ),
      body: showNav && wide
          ? Row(
              children: [
                NavigationRail(
                  selectedIndex: index,
                  backgroundColor: cs.surface,
                  labelType: NavigationRailLabelType.all,
                  onDestinationSelected: (i) => setState(() => _index = i),
                  destinations: [
                    for (final s in visible)
                      NavigationRailDestination(
                        icon: Icon(_iconFor(s.key)),
                        label: Text(s.label),
                      ),
                  ],
                ),
                VerticalDivider(width: 2, thickness: 2, color: cs.onSurface),
                Expanded(child: content),
              ],
            )
          : content,
      bottomNavigationBar: showNav && !wide
          ? DecoratedBox(
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: cs.onSurface, width: 2)),
              ),
              child: NavigationBar(
                selectedIndex: index,
                backgroundColor: cs.surface,
                onDestinationSelected: (i) => setState(() => _index = i),
                destinations: [
                  for (final s in visible)
                    NavigationDestination(
                      icon: Icon(_iconFor(s.key)),
                      label: s.label,
                    ),
                ],
              ),
            )
          : null,
    );
  }
}
