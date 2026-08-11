import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/core/router/app_router.dart';
import 'package:quicky/core/theme/app_theme.dart';

void main() {
  runApp(const ProviderScope(child: QuickyApp()));
}

class QuickyApp extends StatelessWidget {
  const QuickyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Quicky',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      routerConfig: appRouter,
    );
  }
}
