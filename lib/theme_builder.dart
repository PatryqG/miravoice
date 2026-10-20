import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:miravoice/models.dart';

/// Styl z wybraną czcionką Google; gdy czcionki nie ma, zwraca styl bazowy.
TextStyle safeGoogleStyle(String font, [TextStyle? base]) {
  try {
    return GoogleFonts.getFont(font, textStyle: base);
  } catch (_) {
    return base ?? const TextStyle();
  }
}

/// Buduje cały motyw aplikacji z ustawień edytowanych w panelu admina.
ThemeData buildTheme(ThemeSettings s) {
  final dark = s.background.computeLuminance() < 0.4;
  final brightness = dark ? Brightness.dark : Brightness.light;
  Color on(Color c) => c.computeLuminance() > 0.5 ? Colors.black : Colors.white;

  final scheme = ColorScheme(
    brightness: brightness,
    primary: s.primary,
    onPrimary: on(s.primary),
    secondary: s.accent,
    onSecondary: on(s.accent),
    error: const Color(0xFFB3261E),
    onError: Colors.white,
    surface: s.surface,
    onSurface: s.text,
  );

  final base = ThemeData(brightness: brightness, useMaterial3: true)
      .textTheme
      .apply(bodyColor: s.text, displayColor: s.text);

  TextTheme text;
  try {
    text = GoogleFonts.getTextTheme(s.bodyFont, base);
  } catch (_) {
    text = base;
  }
  TextStyle heading(TextStyle? b) => safeGoogleStyle(s.headingFont, b);
  text = text.copyWith(
    displayLarge: heading(text.displayLarge),
    displayMedium: heading(text.displayMedium),
    displaySmall: heading(text.displaySmall),
    headlineLarge: heading(text.headlineLarge),
    headlineMedium: heading(text.headlineMedium),
    headlineSmall: heading(text.headlineSmall),
    titleLarge: heading(text.titleLarge),
  );

  final shape = RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(s.radius.clamp(0, 28).toDouble()),
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: s.background,
    textTheme: text,
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(shape: shape),
    ),
  );
}
