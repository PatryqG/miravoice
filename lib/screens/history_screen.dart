import 'package:flutter/material.dart';
import 'package:miravoice/images.dart';
import 'package:miravoice/models.dart';
import 'package:miravoice/screens/detail_screen.dart';
import 'package:miravoice/store.dart';
import 'package:miravoice/widgets.dart';
import 'package:provider/provider.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final history = context.watch<AppStore>().data.history;
    if (history.isEmpty) return const EmptyState();
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 900),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [for (final h in history) _HistoryItem(h)],
        ),
      ),
    );
  }
}

class _HistoryItem extends StatelessWidget {
  const _HistoryItem(this.entry);

  final HistoryEntry entry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (entry.when.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: cs.primary,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: cs.onSurface, width: 2),
              ),
              child: Text(
                entry.when,
                style: theme.textTheme.titleMedium
                    ?.copyWith(color: cs.onPrimary),
              ),
            ),
          const SizedBox(height: 10),
          AppCard(
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => DetailScreen(
                  title: entry.title,
                  subtitle: entry.when,
                  text: entry.text,
                  image: entry.image,
                ),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (entry.image.isNotEmpty)
                  AspectRatio(
                    aspectRatio: 16 / 9,
                    child: AppImage(entry.image),
                  ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: SizedBox(
                    width: double.infinity,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(entry.title, style: theme.textTheme.titleLarge),
                        if (entry.text.isNotEmpty) ...[
                          const SizedBox(height: 6),
                          Text(
                            entry.text,
                            maxLines: 4,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
