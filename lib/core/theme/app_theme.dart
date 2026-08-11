import 'package:flutter/material.dart';

/// App-wide Material 3 themes with an octagon-friendly palette.
/// Deep indigo/violet accent over a warm surface.
class AppTheme {
  AppTheme._();

  static const Color _seed = Color(0xFF5B3DF5);
  static const Color _warmSurface = Color(0xFFF7F5FF);
  static const Color _darkSurface = Color(0xFF14111F);

  static final ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: _seed,
      brightness: Brightness.light,
      surface: _warmSurface,
    ),
    scaffoldBackgroundColor: _warmSurface,
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
  );

  static final ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: _seed,
      brightness: Brightness.dark,
      surface: _darkSurface,
    ),
    scaffoldBackgroundColor: _darkSurface,
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
    ),
  );
}
