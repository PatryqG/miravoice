import 'package:flutter/material.dart';
import 'package:miravoice/store.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

/// Karta w stylu "naklejki": gruba ramka i twardy kolorowy cień.
class AppCard extends StatelessWidget {
  const AppCard({super.key, required this.child, this.onTap});

  final Widget child;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final radius = context.watch<AppStore>().data.theme.radius;
    final outer = BorderRadius.circular(radius);
    final inner = BorderRadius.circular(radius > 2 ? radius - 2 : 0);
    return Container(
      decoration: BoxDecoration(
        color: cs.surface,
        borderRadius: outer,
        border: Border.all(color: cs.onSurface, width: 2),
        boxShadow: [BoxShadow(color: cs.primary, offset: const Offset(4, 4))],
      ),
      child: ClipRRect(
        borderRadius: inner,
        child: Material(
          color: Colors.transparent,
          child: InkWell(onTap: onTap, child: child),
        ),
      ),
    );
  }
}

/// Układa kafelki w 1-3 kolumnach zależnie od szerokości ekranu (telefon / PC).
class ResponsiveWrap extends StatelessWidget {
  const ResponsiveWrap({
    super.key,
    required this.children,
    this.maxColumns = 3,
  });

  final List<Widget> children;
  final int maxColumns;

  @override
  Widget build(BuildContext context) {
    if (children.isEmpty) return const EmptyState();
    const padding = EdgeInsets.all(16);
    const spacing = 20.0;
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth - padding.horizontal;
        final int columns = (width ~/ 360).clamp(1, maxColumns).toInt();
        final itemWidth = (width - spacing * (columns - 1)) / columns;
        return SingleChildScrollView(
          padding: padding,
          child: Wrap(
            spacing: spacing,
            runSpacing: spacing,
            children: [
              for (final child in children)
                SizedBox(width: itemWidth, child: child),
            ],
          ),
        );
      },
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    this.message = 'Brak treści. Dodaj ją w panelu administratora.',
  });

  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Text(
          message,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.titleMedium,
        ),
      ),
    );
  }
}

/// Otwiera link (np. do wideo) w przeglądarce / aplikacji YouTube.
Future<void> openLink(BuildContext context, String url) async {
  var target = url.trim();
  if (!target.contains('://')) target = 'https://$target';
  var ok = false;
  try {
    final uri = Uri.tryParse(target);
    if (uri != null) {
      ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  } catch (_) {
    ok = false;
  }
  if (!ok && context.mounted) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Nie udało się otworzyć linku.')),
    );
  }
}
