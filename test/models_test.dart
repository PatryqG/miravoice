import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:miravoice/models.dart';

void main() {
  test('dane aplikacji przechodzą pełny obieg JSON', () {
    final data = AppData.defaults();
    data.appName = 'Test';
    data.theme.graffitiWords = 'A, B';
    data.episodes.add(Episode(id: 'x', title: 'Odcinek X', videoUrl: 'https://example.com'));

    final copy = AppData.fromJson(
      jsonDecode(jsonEncode(data.toJson())) as Map<String, dynamic>,
    );

    expect(copy.appName, 'Test');
    expect(copy.theme.primary, data.theme.primary);
    expect(copy.theme.graffitiWords, 'A, B');
    expect(copy.episodes.length, data.episodes.length);
    expect(copy.episodes.last.videoUrl, 'https://example.com');
  });

  test('brakujące pola dostają wartości domyślne', () {
    final data = AppData.fromJson(<String, dynamic>{});
    expect(data.appName, 'MiraVoice');
    expect(data.sections.map((s) => s.key),
        ['about', 'videos', 'actors', 'history', 'miraculous']);
  });

  test('zmiana kolejności działa jak w ReorderableListView', () {
    final list = [1, 2, 3, 4];
    reorderList(list, 0, 3);
    expect(list, [2, 3, 1, 4]);
    moveItem(list, 3, 2);
    expect(list, [2, 3, 4, 1]);
  });
}
