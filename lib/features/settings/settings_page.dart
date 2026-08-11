import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/features/settings/sections/settings_sections.dart';

/// Central Settings hub: ListView of all sections.
class SettingsPage extends ConsumerWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l10n.settingsTile)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: SettingsSections.build(context, ref),
      ),
    );
  }
}
