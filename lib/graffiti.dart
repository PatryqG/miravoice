import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:miravoice/models.dart';
import 'package:miravoice/theme_builder.dart';

/// Maluje tło w stylu graffiti: plamy farby, zacieki, iskry, bazgroły i napisy.
/// Wszystko jest rysowane kodem, więc kolory i gęstość zmienia admin.
class GraffitiPainter extends CustomPainter {
  GraffitiPainter({
    required this.color,
    required this.density,
    required this.seed,
    required this.words,
    required this.tagStyle,
  });

  final Color color;
  final double density;
  final int seed;
  final List<String> words;
  final TextStyle tagStyle;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.isEmpty || density <= 0) return;
    final rnd = Random(seed);
    final scale = (size.width * size.height / 120000).clamp(2.0, 16.0).toDouble();
    final count = (scale * density * 4).round();

    for (var i = 0; i < count; i++) {
      final at = Offset(
        rnd.nextDouble() * size.width,
        rnd.nextDouble() * size.height,
      );
      final tint = color.withValues(alpha: 0.10 + rnd.nextDouble() * 0.16);
      final paint = Paint()..color = tint;
      switch (rnd.nextInt(5)) {
        case 0:
          _splat(canvas, at, 14 + rnd.nextDouble() * 26, paint, rnd);
        case 1:
          _drip(canvas, at, 30 + rnd.nextDouble() * 70, paint, rnd);
        case 2:
          _star(canvas, at, 10 + rnd.nextDouble() * 16, paint);
        case 3:
          _scribble(canvas, at, 50 + rnd.nextDouble() * 70, tint, rnd);
        default:
          _tag(canvas, at, tint, rnd);
      }
    }
  }

  void _splat(Canvas canvas, Offset c, double r, Paint paint, Random rnd) {
    canvas.drawCircle(c, r, paint);
    for (var k = 0; k < 9; k++) {
      final a = rnd.nextDouble() * 2 * pi;
      final dist = r * (1.3 + rnd.nextDouble() * 1.4);
      canvas.drawCircle(
        c + Offset(cos(a) * dist, sin(a) * dist),
        r * (0.07 + rnd.nextDouble() * 0.16),
        paint,
      );
    }
  }

  void _drip(Canvas canvas, Offset c, double len, Paint paint, Random rnd) {
    canvas.drawCircle(c, 10, paint);
    final stroke = Paint()
      ..color = paint.color
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 6;
    final n = 1 + rnd.nextInt(3);
    for (var k = 0; k < n; k++) {
      final x = (k - 1) * 9.0;
      canvas.drawLine(
        c + Offset(x, 4),
        c + Offset(x, len * (0.4 + rnd.nextDouble() * 0.6)),
        stroke,
      );
    }
  }

  void _star(Canvas canvas, Offset c, double r, Paint paint) {
    final path = Path();
    for (var i = 0; i < 8; i++) {
      final angle = i * pi / 4;
      final radius = i.isEven ? r : r * 0.3;
      final p = c + Offset(cos(angle) * radius, sin(angle) * radius);
      if (i == 0) {
        path.moveTo(p.dx, p.dy);
      } else {
        path.lineTo(p.dx, p.dy);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  void _scribble(Canvas canvas, Offset c, double len, Color tint, Random rnd) {
    final angle = rnd.nextDouble() * pi;
    final dir = Offset(cos(angle), sin(angle));
    final perp = Offset(-dir.dy, dir.dx);
    final stroke = Paint()
      ..color = tint
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..strokeWidth = 4;
    final path = Path()..moveTo(c.dx, c.dy);
    const steps = 6;
    for (var i = 1; i <= steps; i++) {
      final along = dir * (len / steps * i);
      final side = perp * (i.isOdd ? 12.0 : -12.0);
      final p = c + along + side;
      path.lineTo(p.dx, p.dy);
    }
    canvas.drawPath(path, stroke);
  }

  void _tag(Canvas canvas, Offset at, Color tint, Random rnd) {
    if (words.isEmpty) return;
    final word = words[rnd.nextInt(words.length)];
    final painter = TextPainter(
      text: TextSpan(
        text: word,
        style: tagStyle.copyWith(
          color: tint,
          fontSize: 26 + rnd.nextDouble() * 34,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    canvas.save();
    canvas.translate(at.dx, at.dy);
    canvas.rotate(-0.45 + rnd.nextDouble() * 0.9);
    painter.paint(canvas, Offset.zero);
    canvas.restore();
  }

  @override
  bool shouldRepaint(GraffitiPainter old) =>
      old.color != color ||
      old.density != density ||
      old.seed != seed ||
      old.tagStyle != tagStyle ||
      !listEquals(old.words, words);
}

/// Tło z graffiti pod zawartością ekranu (wyłączane w panelu admina).
class GraffitiBackground extends StatelessWidget {
  const GraffitiBackground({
    super.key,
    required this.settings,
    required this.child,
  });

  final ThemeSettings settings;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    if (!settings.graffitiEnabled) return child;
    final words = settings.graffitiWords
        .split(',')
        .map((w) => w.trim().toUpperCase())
        .where((w) => w.isNotEmpty)
        .toList();
    return Stack(
      fit: StackFit.expand,
      children: [
        Positioned.fill(
          child: IgnorePointer(
            child: RepaintBoundary(
              child: CustomPaint(
                painter: GraffitiPainter(
                  color: settings.graffitiColor,
                  density: settings.graffitiDensity,
                  seed: settings.graffitiSeed,
                  words: words,
                  tagStyle: safeGoogleStyle(
                    settings.headingFont,
                    const TextStyle(fontWeight: FontWeight.w900),
                  ),
                ),
              ),
            ),
          ),
        ),
        child,
      ],
    );
  }
}

/// Tytuł sekcji w stylu graffiti: napis z przesuniętym kolorowym cieniem.
class GraffitiTitle extends StatelessWidget {
  const GraffitiTitle(this.text, {super.key, this.size = 34});

  final String text;
  final double size;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final style = theme.textTheme.headlineMedium?.copyWith(fontSize: size);
    return Stack(
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 3, top: 3),
          child: Text(
            text,
            style: style?.copyWith(color: theme.colorScheme.primary),
          ),
        ),
        Text(text, style: style),
      ],
    );
  }
}
