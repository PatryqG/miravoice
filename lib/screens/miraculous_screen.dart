import 'package:flutter/material.dart';
import 'package:miravoice/images.dart';
import 'package:miravoice/models.dart';
import 'package:miravoice/screens/detail_screen.dart';
import 'package:miravoice/store.dart';
import 'package:miravoice/widgets.dart';
import 'package:provider/provider.dart';

/// Sekcja Miraculous: bohaterowie, moce i lore w trzech zakładkach.
class MiraculousScreen extends StatelessWidget {
  const MiraculousScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final entries = context.watch<AppStore>().data.mira;
    final cs = Theme.of(context).colorScheme;

    Widget tab(String category) => ResponsiveWrap(
          children: [
            for (final e in entries.where((e) => e.category == category))
              _MiraCard(e),
          ],
        );

    return DefaultTabController(
      length: 3,
      child: Column(
        children: [
          Material(
            color: cs.surface,
            child: TabBar(
              labelColor: cs.primary,
              unselectedLabelColor: cs.onSurface.withValues(alpha: 0.6),
              indicatorColor: cs.primary,
              tabs: const [
                Tab(text: 'Bohaterowie'),
                Tab(text: 'Moce'),
                Tab(text: 'Lore'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              children: [tab('hero'), tab('power'), tab('lore')],
            ),
          ),
        ],
      ),
    );
  }
}

class _MiraCard extends StatelessWidget {
  const _MiraCard(this.entry);

  final MiraEntry entry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    return AppCard(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => DetailScreen(
            title: entry.title,
            subtitle: entry.subtitle,
            text: entry.text,
            image: entry.image,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (entry.category == 'hero' || entry.image.isNotEmpty)
            AspectRatio(aspectRatio: 4 / 3, child: AppImage(entry.image)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (entry.category == 'power')
                    Icon(Icons.bolt, color: cs.primary),
                  Text(entry.title, style: theme.textTheme.titleLarge),
                  if (entry.subtitle.isNotEmpty)
                    Text(
                      entry.subtitle,
                      style: theme.textTheme.labelLarge
                          ?.copyWith(color: cs.primary),
                    ),
                  const SizedBox(height: 8),
                  Text(
                    entry.text,
                    maxLines: 5,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
