import 'package:flutter/material.dart';
import 'package:miravoice/graffiti.dart';
import 'package:miravoice/images.dart';
import 'package:miravoice/store.dart';
import 'package:miravoice/widgets.dart';
import 'package:provider/provider.dart';

/// Pełny widok jednego elementu (odcinek, aktor, wpis historii, bohater...).
class DetailScreen extends StatelessWidget {
  const DetailScreen({
    super.key,
    required this.title,
    required this.text,
    this.subtitle = '',
    this.image = '',
    this.actionLabel = 'Otwórz',
    this.actionUrl = '',
  });

  final String title;
  final String subtitle;
  final String text;
  final String image;
  final String actionLabel;
  final String actionUrl;

  @override
  Widget build(BuildContext context) {
    final data = context.watch<AppStore>().data;
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        backgroundColor: theme.colorScheme.surface,
        surfaceTintColor: Colors.transparent,
        title: Text(title, overflow: TextOverflow.ellipsis),
      ),
      body: GraffitiBackground(
        settings: data.theme,
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 800),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (image.isNotEmpty) ...[
                  AspectRatio(
                    aspectRatio: 16 / 10,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(data.theme.radius),
                      child: AppImage(image),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                GraffitiTitle(title, size: 30),
                if (subtitle.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: theme.textTheme.titleMedium
                        ?.copyWith(color: theme.colorScheme.primary),
                  ),
                ],
                const SizedBox(height: 16),
                AppCard(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: SizedBox(
                      width: double.infinity,
                      child: Text(text, style: theme.textTheme.bodyLarge),
                    ),
                  ),
                ),
                if (actionUrl.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () => openLink(context, actionUrl),
                    icon: const Icon(Icons.play_arrow),
                    label: Text(actionLabel),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
