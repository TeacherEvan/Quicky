import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'package:go_router/go_router.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/core/router/app_router.dart';
import 'package:quicky/core/theme/app_theme.dart';
import 'package:quicky/features/settings/settings_controller.dart';

void main() {
  // Path-based URLs so /weather, /cost … are real, shareable deep links
  // (vercel.json already rewrites unknown paths to index.html).
  usePathUrlStrategy();
  // context.push must update the address bar, or per-page links break.
  GoRouter.optionURLReflectsImperativeAPIs = true;
  runApp(const ProviderScope(child: QuickyApp()));
}

class QuickyApp extends ConsumerWidget {
  const QuickyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsControllerProvider);
    return MaterialApp.router(
      title: 'Quicky',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeModeFromName(settings.themeMode),
      locale: Locale(settings.language),
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      routerConfig: appRouter,
    );
  }
}
