import 'package:flutter/material.dart';
import 'package:miravoice/images.dart';
import 'package:miravoice/models.dart';
import 'package:miravoice/screens/detail_screen.dart';
import 'package:miravoice/store.dart';
import 'package:miravoice/widgets.dart';
import 'package:provider/provider.dart';

class ActorsScreen extends StatelessWidget {
  const ActorsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final actors = context.watch<AppStore>().data.actors;
    return ResponsiveWrap(
      children: [for (final a in actors) _ActorCard(a)],
    );
  }
}

class _ActorCard extends StatelessWidget {
  const _ActorCard(this.actor);

  final Actor actor;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return AppCard(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => DetailScreen(
            title: actor.name,
            subtitle: actor.role,
            text: actor.bio,
            image: actor.photo,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(aspectRatio: 1, child: AppImage(actor.photo)),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(actor.name, style: theme.textTheme.titleLarge),
                if (actor.role.isNotEmpty)
                  Text(
                    actor.role,
                    style: theme.textTheme.labelLarge
                        ?.copyWith(color: theme.colorScheme.primary),
                  ),
                if (actor.bio.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    actor.bio,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
