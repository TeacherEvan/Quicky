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
      'enterDays': 'Enter days',
      'set': 'Set',
      'noCountdown': 'No countdown set',
      'capture': 'Capture',
      'gallery': 'Gallery',
      'noCamera': 'No camera available',
      'notInstalled': 'Not installed',
      'sectionAppearance': 'Appearance',
      'themeSystem': 'System',
      'themeLight': 'Light',
      'themeDark': 'Dark',
      'langEnglish': 'English',
      'langThai': 'Thai',
      'settingTheme': 'Theme',
      'settingLanguage': 'Language',
      'settingRadius': 'Default radius',
      'settingUnits': 'Units',
      'sectionLocation': 'Location',
      'sectionWeather': 'Weather',
      'sectionAppLaunchers': 'App Launchers',
      'launchersNote': 'Only installed apps are offered. No store links.',
      'sectionPrivacy': 'Privacy',
      'privacyComing': 'Analytics opt-out (coming)',
      'sectionAbout': 'About',
      'aboutVersion': 'Quicky · v1.0.0',
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
      'enterDays': 'ป้อนจำนวนวัน',
      'set': 'ตั้งค่า',
      'noCountdown': 'ยังไม่ได้ตั้งการนับถอยหลัง',
      'capture': 'ถ่ายภาพ',
      'gallery': 'แกลเลอรี',
      'noCamera': 'ไม่พบกล้อง',
      'notInstalled': 'ไม่ได้ติดตั้ง',
      'sectionAppearance': 'รูปแบบ',
      'themeSystem': 'ระบบ',
      'themeLight': 'สว่าง',
      'themeDark': 'มืด',
      'langEnglish': 'อังกฤษ',
      'langThai': 'ไทย',
      'settingTheme': 'ธีม',
      'settingLanguage': 'ภาษา',
      'settingRadius': 'รัศมีเริ่มต้น',
      'settingUnits': 'หน่วย',
      'sectionLocation': 'ตำแหน่ง',
      'sectionWeather': 'สภาพอากาศ',
      'sectionAppLaunchers': 'แอปที่เปิดได้',
      'launchersNote': 'เสนอเฉพาะแอปที่ติดตั้งแล้ว ไม่มีลิงก์ร้านค้า',
      'sectionPrivacy': 'ความเป็นส่วนตัว',
      'privacyComing': 'ปิดการวิเคราะห์ (เร็วๆ นี้)',
      'sectionAbout': 'เกี่ยวกับ',
      'aboutVersion': 'Quicky · v1.0.0',
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
  String get costQuestion => translate('costQuestion');

  // Counter
  String get enterDays => translate('enterDays');
  // `set` is a built-in identifier in Dart, so the getter is named setLabel.
  String get setLabel => translate('set');
  String get noCountdown => translate('noCountdown');

  // Camera / media
  String get capture => translate('capture');
  String get gallery => translate('gallery');
  String get noCamera => translate('noCamera');

  // Launchers
  String get notInstalled => translate('notInstalled');

  // Settings
  String get sectionAppearance => translate('sectionAppearance');
  String get themeSystem => translate('themeSystem');
  String get themeLight => translate('themeLight');
  String get themeDark => translate('themeDark');
  String get langEnglish => translate('langEnglish');
  String get langThai => translate('langThai');
  String get settingTheme => translate('settingTheme');
  String get settingLanguage => translate('settingLanguage');
  String get settingRadius => translate('settingRadius');
  String get settingUnits => translate('settingUnits');
  String get sectionLocation => translate('sectionLocation');
  String get sectionWeather => translate('sectionWeather');
  String get sectionAppLaunchers => translate('sectionAppLaunchers');
  String get launchersNote => translate('launchersNote');
  String get sectionPrivacy => translate('sectionPrivacy');
  String get privacyComing => translate('privacyComing');
  String get sectionAbout => translate('sectionAbout');
  String get aboutVersion => translate('aboutVersion');
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
