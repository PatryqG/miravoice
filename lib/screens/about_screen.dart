import 'package:flutter/material.dart';
import 'package:miravoice/graffiti.dart';
import 'package:miravoice/images.dart';
import 'package:miravoice/store.dart';
import 'package:miravoice/widgets.dart';
import 'package:provider/provider.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final data = context.watch<AppStore>().data;
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final tt = theme.textTheme;
    final radius = BorderRadius.circular(data.theme.radius);

    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 900),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Container(
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                color: cs.primary,
                borderRadius: radius,
                border: Border.all(color: cs.onSurface, width: 2),
                boxShadow: [
                  BoxShadow(color: cs.secondary, offset: const Offset(5, 5)),
                ],
              ),
              child: data.theme.heroImage.isNotEmpty
                  ? AspectRatio(
                      aspectRatio: 16 / 7,
                      child: AppImage(data.theme.heroImage),
                    )
                  : Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 36,
                      ),
                      child: SizedBox(
                        width: double.infinity,
                        child: Column(
                          children: [
                            Text(
                              data.appName,
                              textAlign: TextAlign.center,
                              style: tt.headlineLarge?.copyWith(
                                color: cs.onPrimary,
                                fontSize: 48,
                              ),
                            ),
                            if (data.tagline.isNotEmpty) ...[
                              const SizedBox(height: 8),
                              Text(
                                data.tagline,
                                textAlign: TextAlign.center,
                                style: tt.titleMedium
                                    ?.copyWith(color: cs.onPrimary),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
            ),
            const SizedBox(height: 28),
            GraffitiTitle(data.aboutTitle),
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (data.aboutImage.isNotEmpty)
                    AspectRatio(
                      aspectRatio: 16 / 9,
                      child: AppImage(data.aboutImage),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: SizedBox(
                      width: double.infinity,
                      child: Text(data.aboutText, style: tt.bodyLarge),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
