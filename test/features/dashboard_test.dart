import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:quicky/core/l10n/app_localizations.dart';
import 'package:quicky/core/router/routes.dart';
import 'package:quicky/features/dashboard/dashboard_page.dart';
import 'package:quicky/shared/widgets/octagon_tile.dart';

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

  testWidgets('OctagonTile accepts an accent and stays tappable', (
    tester,
  ) async {
    var tapped = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OctagonTile(
            icon: Icons.attach_money,
            label: 'Cost',
            semanticsLabel: 'Cost',
            accent: const Color(0xFF2E9E5B),
            onTap: () => tapped = true,
          ),
        ),
      ),
    );
    final node = tester.getSemantics(find.bySemanticsLabel('Cost'));
    expect(node.label, 'Cost');
    expect(node.hasFlag(SemanticsFlag.isButton), isTrue);
    await tester.tap(find.bySemanticsLabel('Cost'));
    expect(tapped, isTrue);
  });

  testWidgets('DashboardLayout renders 8 tiles within a small viewport '
      'without overflow', (tester) async {
    tester.view.physicalSize = const Size(320 * 3, 568 * 3); // 320x568 CSS px
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);

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
    // 8 feature tiles + 1 settings hub = 9 OctagonTile widgets.
    expect(find.byType(OctagonTile), findsNWidgets(9));
    expect(tester.takeException(), isNull);
  });
}
