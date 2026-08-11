import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Central settings state, persisted across all feature tiles.
class SettingsState {
  const SettingsState({
    this.themeMode = 'system',
    this.language = 'en',
    this.radiusKm = 10.0,
    this.weatherUnits = 'C',
  });

  final String themeMode;
  final String language;
  final double radiusKm;
  final String weatherUnits;

  SettingsState copyWith({
    String? themeMode,
    String? language,
    double? radiusKm,
    String? weatherUnits,
  }) {
    return SettingsState(
      themeMode: themeMode ?? this.themeMode,
      language: language ?? this.language,
      radiusKm: radiusKm ?? this.radiusKm,
      weatherUnits: weatherUnits ?? this.weatherUnits,
    );
  }
}

final settingsControllerProvider =
    StateNotifierProvider<SettingsController, SettingsState>((ref) {
  return SettingsController();
});

class SettingsController extends StateNotifier<SettingsState> {
  SettingsController() : super(const SettingsState()) {
    _load();
  }

  static const _kTheme = 'settings_theme';
  static const _kLang = 'settings_lang';
  static const _kRadius = 'settings_radius';
  static const _kUnits = 'settings_units';
  static const _secure = FlutterSecureStorage();

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    state = state.copyWith(
      themeMode: prefs.getString(_kTheme) ?? 'system',
      language: prefs.getString(_kLang) ?? 'en',
      radiusKm: prefs.getDouble(_kRadius) ?? 10.0,
      weatherUnits: prefs.getString(_kUnits) ?? 'C',
    );
  }

  Future<void> setTheme(String v) async {
    state = state.copyWith(themeMode: v);
    (await SharedPreferences.getInstance()).setString(_kTheme, v);
  }

  Future<void> setLanguage(String v) async {
    state = state.copyWith(language: v);
    (await SharedPreferences.getInstance()).setString(_kLang, v);
  }

  Future<void> setRadius(double v) async {
    state = state.copyWith(radiusKm: v);
    (await SharedPreferences.getInstance()).setDouble(_kRadius, v);
  }

  Future<void> setUnits(String v) async {
    state = state.copyWith(weatherUnits: v);
    (await SharedPreferences.getInstance()).setString(_kUnits, v);
  }

  /// Securely stores an API key (e.g. weather/places provider).
  Future<void> setApiKey(String key, String value) async {
    await _secure.write(key: key, value: value);
  }
}
