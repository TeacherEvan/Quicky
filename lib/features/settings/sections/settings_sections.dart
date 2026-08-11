import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/features/settings/settings_controller.dart';

/// Settings sections. One widget per section; all read/write the shared
/// SettingsController so prefs persist app-wide.
class SettingsSections {
  SettingsSections._();

  static List<Widget> build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(settingsControllerProvider);
    final ctrl = ref.read(settingsControllerProvider.notifier);

    return [
      // 1. Appearance
      const SectionHeader(title: 'Appearance'),
      DropdownButtonFormField<String>(
        value: s.themeMode,
        items: const [
          DropdownMenuItem(value: 'system', child: Text('System')),
          DropdownMenuItem(value: 'light', child: Text('Light')),
          DropdownMenuItem(value: 'dark', child: Text('Dark')),
        ],
        onChanged: (v) => ctrl.setTheme(v!),
        decoration: const InputDecoration(labelText: 'Theme'),
      ),
      DropdownButtonFormField<String>(
        value: s.language,
        items: const [
          DropdownMenuItem(value: 'en', child: Text('English')),
          DropdownMenuItem(value: 'th', child: Text('Thai')),
        ],
        onChanged: (v) => ctrl.setLanguage(v!),
        decoration: const InputDecoration(labelText: 'Language'),
      ),
      // 2. Location
      const SectionHeader(title: 'Location'),
      DropdownButtonFormField<double>(
        value: s.radiusKm,
        items: const [
          DropdownMenuItem(value: 10.0, child: Text('10 km')),
          DropdownMenuItem(value: 40.0, child: Text('40 km')),
          DropdownMenuItem(value: 100.0, child: Text('100 km')),
        ],
        onChanged: (v) => ctrl.setRadius(v!),
        decoration: const InputDecoration(labelText: 'Default radius'),
      ),
      // 3. Weather
      const SectionHeader(title: 'Weather'),
      DropdownButtonFormField<String>(
        value: s.weatherUnits,
        items: const [
          DropdownMenuItem(value: 'C', child: Text('Celsius')),
          DropdownMenuItem(value: 'F', child: Text('Fahrenheit')),
        ],
        onChanged: (v) => ctrl.setUnits(v!),
        decoration: const InputDecoration(labelText: 'Units'),
      ),
      // 4. App Launchers (info)
      const SectionHeader(title: 'App Launchers'),
      const ListTile(
        title: Text('BOLT / Banking'),
        subtitle: Text('Only installed apps are offered. No store links.'),
      ),
      // 5-8. Placeholders for privacy/about/clear
      const SectionHeader(title: 'Privacy'),
      const ListTile(title: Text('Analytics opt-out (coming)')),
      const SectionHeader(title: 'About'),
      const ListTile(title: Text('Quicky 🏃 · v1.0.0')),
    ];
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16, bottom: 4),
      child: Text(title, style: Theme.of(context).textTheme.titleSmall),
    );
  }
}
