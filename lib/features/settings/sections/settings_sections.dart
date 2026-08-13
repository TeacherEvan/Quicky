import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/settings/settings_controller.dart';

/// Settings sections. One widget per section; all read/write the shared
/// SettingsController so prefs persist app-wide.
class SettingsSections {
  SettingsSections._();

  static List<Widget> build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(settingsControllerProvider);
    final ctrl = ref.read(settingsControllerProvider.notifier);
    final l10n = AppLocalizations.of(context);

    return [
      // 1. Appearance
      SectionHeader(title: l10n.sectionAppearance),
      DropdownButtonFormField<String>(
        value: s.themeMode,
        items: [
          DropdownMenuItem(value: 'system', child: Text(l10n.themeSystem)),
          DropdownMenuItem(value: 'light', child: Text(l10n.themeLight)),
          DropdownMenuItem(value: 'dark', child: Text(l10n.themeDark)),
        ],
        onChanged: (v) => ctrl.setTheme(v!),
        decoration: InputDecoration(labelText: l10n.settingTheme),
      ),
      DropdownButtonFormField<String>(
        value: s.language,
        items: [
          DropdownMenuItem(value: 'en', child: Text(l10n.langEnglish)),
          DropdownMenuItem(value: 'th', child: Text(l10n.langThai)),
        ],
        onChanged: (v) => ctrl.setLanguage(v!),
        decoration: InputDecoration(labelText: l10n.settingLanguage),
      ),
      // 2. Location
      SectionHeader(title: l10n.sectionLocation),
      DropdownButtonFormField<double>(
        initialValue: s.radiusKm,
        items: const [
          DropdownMenuItem(value: 10, child: Text('10 km')),
          DropdownMenuItem(value: 40, child: Text('40 km')),
          DropdownMenuItem(value: 100, child: Text('100 km')),
        ],
        onChanged: (v) => ctrl.setRadius(v!),
        decoration: InputDecoration(labelText: l10n.settingRadius),
      ),
      // 3. Weather
      SectionHeader(title: l10n.sectionWeather),
      DropdownButtonFormField<String>(
        initialValue: s.weatherUnits,
        items: const [
          DropdownMenuItem(value: 'C', child: Text('Celsius')),
          DropdownMenuItem(value: 'F', child: Text('Fahrenheit')),
        ],
        onChanged: (v) => ctrl.setUnits(v!),
        decoration: InputDecoration(labelText: l10n.settingUnits),
      ),
      // 4. App Launchers (info)
      SectionHeader(title: l10n.sectionAppLaunchers),
      ListTile(
        title: const Text('BOLT / Banking'),
        subtitle: Text(l10n.launchersNote),
      ),
      // 5-8. Placeholders for privacy/about/clear
      SectionHeader(title: l10n.sectionPrivacy),
      ListTile(title: Text(l10n.privacyComing)),
      SectionHeader(title: l10n.sectionAbout),
      ListTile(title: Text(l10n.aboutVersion)),
    ];
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({required this.title, super.key});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 4),
      child: Text(title, style: Theme.of(context).textTheme.titleSmall),
    );
  }
}
