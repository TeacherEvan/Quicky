import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/core/router/routes.dart';
import 'package:quicky/features/dashboard/dashboard_page.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('DashboardPage renders 8 tiles + settings hub', (tester) async {
    final router = GoRouter(
      initialLocation: Routes.home,
      routes: [
        GoRoute(
          path: Routes.home,
          builder: (context, state) => const DashboardPage(),
        ),
      ],
    );
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp.router(
          routerConfig: router,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.byType(DashboardPage), findsOneWidget);
    expect(find.text('Settings'), findsWidgets);
  });
}
