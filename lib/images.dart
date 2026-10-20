import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';

/// Katalog na zdjęcia dodane przez admina. W danych zapisujemy tylko nazwę
/// pliku ("local:nazwa.jpg"), więc ścieżka nie psuje się po aktualizacji.
class AppPaths {
  static String imagesDir = '';

  static Future<void> init() async {
    final docs = await getApplicationDocumentsDirectory();
    final dir = Directory('${docs.path}/miravoice_images');
    if (!await dir.exists()) await dir.create(recursive: true);
    imagesDir = dir.path;
  }
}

/// Wybór zdjęcia z dysku/galerii i skopiowanie go do katalogu aplikacji.
/// Zwraca wartość do zapisania w danych albo null, gdy anulowano.
Future<String?> pickAndStoreImage() async {
  final result = await FilePicker.platform.pickFiles(type: FileType.image);
  final picked = result?.files.single.path;
  if (picked == null) return null;
  final base = picked.split(RegExp(r'[\\/]')).last;
  final name = '${DateTime.now().microsecondsSinceEpoch}_$base';
  await File(picked).copy('${AppPaths.imagesDir}/$name');
  return 'local:$name';
}

/// Obraz z linku (http...), z pliku dodanego przez admina (local:...)
/// albo ikona zastępcza, gdy nic nie ustawiono lub plik nie istnieje.
class AppImage extends StatelessWidget {
  const AppImage(this.source, {super.key, this.fit = BoxFit.cover});

  final String source;
  final BoxFit fit;

  Widget _placeholder(BuildContext context) {
    final c = Theme.of(context).colorScheme;
    return Container(
      color: c.primary.withValues(alpha: 0.15),
      alignment: Alignment.center,
      child: Icon(
        Icons.image_outlined,
        color: c.primary.withValues(alpha: 0.6),
        size: 36,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (source.isEmpty) return _placeholder(context);
    Widget onError(BuildContext c, Object e, StackTrace? s) => _placeholder(c);
    if (source.startsWith('http')) {
      return Image.network(
        source,
        fit: fit,
        width: double.infinity,
        height: double.infinity,
        errorBuilder: onError,
      );
    }
    final file = source.startsWith('local:')
        ? File('${AppPaths.imagesDir}/${source.substring(6)}')
        : File(source);
    return Image.file(
      file,
      fit: fit,
      width: double.infinity,
      height: double.infinity,
      errorBuilder: onError,
    );
  }
}

/// Pole wyboru zdjęcia w panelu admina: podgląd + plik z dysku lub link.
class ImageField extends StatelessWidget {
  const ImageField({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final String value;
  final ValueChanged<String> onChanged;

  Future<void> _askForUrl(BuildContext context) async {
    final controller = TextEditingController(
      text: value.startsWith('http') ? value : '',
    );
    final url = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Link do zdjęcia'),
        content: TextField(
          controller: controller,
          autofocus: true,
          keyboardType: TextInputType.url,
          decoration: const InputDecoration(
            hintText: 'https://...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Anuluj'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, controller.text.trim()),
            child: const Text('Zapisz'),
          ),
        ],
      ),
    );
    controller.dispose();
    if (url != null && url.isNotEmpty) onChanged(url);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: Theme.of(context).textTheme.labelLarge),
        const SizedBox(height: 8),
        SizedBox(
          width: 240,
          height: 150,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: AppImage(value),
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            OutlinedButton.icon(
              onPressed: () async {
                final stored = await pickAndStoreImage();
                if (stored != null) onChanged(stored);
              },
              icon: const Icon(Icons.upload_file),
              label: const Text('Wybierz plik'),
            ),
            OutlinedButton.icon(
              onPressed: () => _askForUrl(context),
              icon: const Icon(Icons.link),
              label: const Text('Wklej link'),
            ),
            if (value.isNotEmpty)
              TextButton.icon(
                onPressed: () => onChanged(''),
                icon: const Icon(Icons.delete_outline),
                label: const Text('Usuń'),
              ),
          ],
        ),
      ],
    );
  }
}
