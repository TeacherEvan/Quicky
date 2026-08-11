import 'package:flutter/material.dart';

/// Manual localization (no code-gen). Translations are embedded as maps so no
/// asset bundling or async loading is required.
class AppLocalizations {
  AppLocalizations._(this.locale, this._strings);

  final Locale locale;
  final Map<String, String> _strings;

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates = [
    delegate,
  ];

  static const List<Locale> supportedLocales = [Locale('en'), Locale('th')];

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static final Map<String, Map<String, String>> _bundles = {
    'en': {
      'appTitle': 'Quicky',
      'costTile': 'Cost',
      'locationTile': 'Location',
      'bathroomTile': 'Bathroom',
      'attractionsTile': 'Attractions',
      'counterTile': 'Day Counter',
      'boltTile': 'Bolt',
      'bankingTile': 'Banking',
      'weatherTile': 'Weather',
      'settingsTile': 'Settings',
      'costQuestion': 'How much does this cost?',
    },
    'th': {
      'appTitle': 'Quicky',
      'costTile': 'ราคา',
      'locationTile': 'ตำแหน่ง',
      'bathroomTile': 'ห้องน้ำ',
      'attractionsTile': 'สถานที่น่าสนใจ',
      'counterTile': 'นับวัน',
      'boltTile': 'Bolt',
      'bankingTile': 'ธนาคาร',
      'weatherTile': 'สภาพอากาศ',
      'settingsTile': 'ตั้งค่า',
      'costQuestion': 'สิ่งนี้ราคาเท่าไหร่?',
    },
  };

  String translate(String key) => _strings[key] ?? key;

  String get appTitle => translate('appTitle');
  String get costTile => translate('costTile');
  String get locationTile => translate('locationTile');
  String get bathroomTile => translate('bathroomTile');
  String get attractionsTile => translate('attractionsTile');
  String get counterTile => translate('counterTile');
  String get boltTile => translate('boltTile');
  String get bankingTile => translate('bankingTile');
  String get weatherTile => translate('weatherTile');
  String get settingsTile => translate('settingsTile');
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => AppLocalizations.supportedLocales.any(
    (l) => l.languageCode == locale.languageCode,
  );

  @override
  Future<AppLocalizations> load(Locale locale) async {
    final code = locale.languageCode == 'th' ? 'th' : 'en';
    return AppLocalizations._(locale, AppLocalizations._bundles[code]!);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
