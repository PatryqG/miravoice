import 'package:flutter/material.dart';
import 'package:miravoice/images.dart';
import 'package:miravoice/models.dart';
import 'package:miravoice/screens/detail_screen.dart';
import 'package:miravoice/store.dart';
import 'package:miravoice/widgets.dart';
import 'package:provider/provider.dart';

class VideosScreen extends StatelessWidget {
  const VideosScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final episodes = context.watch<AppStore>().data.episodes;
    return ResponsiveWrap(
      children: [for (final e in episodes) _EpisodeCard(e)],
    );
  }
}

class _EpisodeCard extends StatelessWidget {
  const _EpisodeCard(this.episode);

  final Episode episode;

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    return AppCard(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => DetailScreen(
            title: episode.title,
            text: episode.description,
            image: episode.thumbnail,
            actionLabel: 'Oglądaj',
            actionUrl: episode.videoUrl,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 16 / 9,
            child: AppImage(episode.thumbnail),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(episode.title, style: tt.titleLarge),
                if (episode.description.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    episode.description,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: episode.videoUrl.isEmpty
                      ? null
                      : () => openLink(context, episode.videoUrl),
                  icon: const Icon(Icons.play_arrow),
                  label: const Text('Oglądaj'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
