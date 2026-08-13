// Mounts the REAL production router so the two shipped CRITICALs can never
// regress: a duplicate "/" registration (dashboard unreachable) and a missing
// splash asset (runtime crash). The unit tests build their own GoRouter copies
// and therefore never exercised appRouter.
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/core/router/app_router.dart';
import 'package:quicky/core/router/routes.dart';
import 'package:quicky/features/dashboard/dashboard_page.dart';
import 'package:quicky/features/splash/splash_page.dart';

void main() {
  testWidgets('appRouter boots at the splash and reaches the dashboard at /', (
    tester,
  ) async {
    // Mirror main.dart: ProviderScope + localizations wrap the router.
    await tester.pumpWidget(
      ProviderScope(
        child: MaterialApp.router(
          routerConfig: appRouter,
          localizationsDelegates: AppLocalizations.localizationsDelegates,
          supportedLocales: AppLocalizations.supportedLocales,
        ),
      ),
    );

    // Let the router resolve + build the initial (splash) route.
    await tester.pump();

    // The app must boot on the splash, not a perpetual spinner route.
    expect(find.byType(SplashPage), findsOneWidget);

    // SplashPage replaces the stack with / once LoadingSplash fires onComplete.
    // In the harness the video never "ends", so the 14s safety-net Timer drives
    // completion. Advance the clock past it (pumpAndSettle would block forever
    // on the live timer), then settle the resulting route transition.
    await tester.pump(const Duration(seconds: 15));
    await tester.pumpAndSettle();

    // Dashboard must render at "/" — the duplicate "/" registration used to
    // park the user on CorePlaceholderPage (an infinite spinner) instead.
    expect(
      find.byType(DashboardPage),
      findsOneWidget,
      reason: 'Dashboard must be reachable at Routes.home after the splash.',
    );
  });

  testWidgets('exactly one route owns the home path (no duplicate "/")', (
    _,
  ) async {
    final homeRoutes = appRouter.configuration.routes.where(
      (r) => r is GoRoute && r.path == Routes.home,
    );
    expect(
      homeRoutes.length,
      1,
      reason: 'A second "/" route would shadow the dashboard.',
    );
  });
}
