import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

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
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
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
      'installQuickyTitle': 'Install Quicky',
      'installQuickySubtitle': 'Add to home screen for offline use',
      'loading': 'Loading…',
      'skip': 'Skip',
      'launchBolt': 'Launch BOLT',
      'launched': 'Launched',
      'launchOpening': 'Opening {app}…',
      'launchFailed': 'Could not open {app}.',
      'captureFailed': 'Capture failed. Please try again.',
      'offlineEstimate': 'Offline estimate — live data unavailable',
      'mockData': 'Sample data — live results unavailable',
      'forecastToday': 'Today',
      'forecastTomorrow': 'Tomorrow',
      'forecastDay3': 'In 2 days',
      'daysUnit': 'days',
      'invalidDays': 'Enter a whole number of days (at least 1).',
      'bathroomMale': 'Male',
      'bathroomFemale': 'Female',
      'toggleBathroom': 'Switch between male and female',
      'open': 'Open',
      'closed': 'Closed',
      'areaChip': 'Area',
      'errorTitle': 'Something went wrong',
      'retry': 'Retry',
      'noPlaces': 'No places found nearby.',
      'goHome': 'Back to home',
      'notFoundTitle': 'Page not found',
      'notFoundBody': 'The page you are looking for does not exist.',
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
      'installQuickyTitle': 'ติดตั้ง Quicky',
      'installQuickySubtitle': 'เพิ่มลงหน้าจอหลักเพื่อใช้งานออฟไลน์',
      'loading': 'กำลังโหลด…',
      'skip': 'ข้าม',
      'launchBolt': 'เปิด BOLT',
      'launched': 'เปิดแล้ว',
      'launchOpening': 'กำลังเปิด {app}…',
      'launchFailed': 'ไม่สามารถเปิด {app} ได้',
      'captureFailed': 'ถ่ายภาพไม่สำเร็จ กรุณาลองอีกครั้ง',
      'offlineEstimate': 'ข้อมูลประมาณการออฟไลน์ — ไม่สามารถดึงข้อมูลสดได้',
      'mockData': 'ข้อมูลตัวอย่าง — ไม่สามารถดึงข้อมูลสดได้',
      'forecastToday': 'วันนี้',
      'forecastTomorrow': 'พรุ่งนี้',
      'forecastDay3': '2 วันข้างหน้า',
      'daysUnit': 'วัน',
      'invalidDays': 'ป้อนจำนวนวันเป็นเลขจำนวนเต็ม (อย่างน้อย 1)',
      'bathroomMale': 'ชาย',
      'bathroomFemale': 'หญิง',
      'toggleBathroom': 'สลับระหว่างห้องน้ำชายและหญิง',
      'open': 'เปิด',
      'closed': 'ปิด',
      'areaChip': 'พื้นที่ใกล้ฉัน',
      'errorTitle': 'เกิดข้อผิดพลาด',
      'retry': 'ลองอีกครั้ง',
      'noPlaces': 'ไม่พบสถานที่ใกล้เคียง',
      'goHome': 'กลับหน้าหลัก',
      'notFoundTitle': 'ไม่พบหน้านี้',
      'notFoundBody': 'หน้าที่คุณค้นหาไม่มีอยู่',
    },
  };

  String translate(String key) => _strings[key] ?? key;

  /// Translates [key] and substitutes `{name}` placeholders from [params].
  String format(String key, Map<String, String> params) {
    var s = translate(key);
    params.forEach((k, v) => s = s.replaceAll('{$k}', v));
    return s;
  }

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
  String get installQuickyTitle => translate('installQuickyTitle');
  String get installQuickySubtitle => translate('installQuickySubtitle');

  // Shared states / actions
  String get loading => translate('loading');
  String get skip => translate('skip');
  String get errorTitle => translate('errorTitle');
  String get retry => translate('retry');
  String get goHome => translate('goHome');

  // Launchers
  String get launchBolt => translate('launchBolt');
  String get launched => translate('launched');
  String launchOpening(String app) => format('launchOpening', {'app': app});
  String launchFailed(String app) => format('launchFailed', {'app': app});

  // Camera
  String get captureFailed => translate('captureFailed');

  // Data provenance
  String get offlineEstimate => translate('offlineEstimate');
  String get mockData => translate('mockData');

  // Weather forecast
  String get forecastToday => translate('forecastToday');
  String get forecastTomorrow => translate('forecastTomorrow');
  String get forecastDay3 => translate('forecastDay3');

  // Day counter
  String get daysUnit => translate('daysUnit');
  String get invalidDays => translate('invalidDays');

  // Bathroom
  String get bathroomMale => translate('bathroomMale');
  String get bathroomFemale => translate('bathroomFemale');
  String get toggleBathroom => translate('toggleBathroom');

  // Attractions
  String get open => translate('open');
  String get closed => translate('closed');
  String get areaChip => translate('areaChip');
  String get noPlaces => translate('noPlaces');

  // 404
  String get notFoundTitle => translate('notFoundTitle');
  String get notFoundBody => translate('notFoundBody');
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
