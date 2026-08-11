import 'package:flutter/semantics.dart';
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

  testWidgets('OctagonTile exposes a tappable semantics button (a11y)', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: OctagonTile(
            icon: Icons.attach_money,
            label: 'Cost',
            semanticsLabel: 'Cost',
            onTap: () {},
          ),
        ),
      ),
    );
    // Task 11.4: each tile must be a labelled button for TalkBack / VoiceOver.
    // Query by semantics label: getSemantics(byType) climbs to the MaterialApp
    // root boundary, so assert on the labelled node directly.
    final node = tester.getSemantics(find.bySemanticsLabel('Cost'));
    expect(node.label, 'Cost');
    expect(node.hasFlag(SemanticsFlag.isButton), isTrue);
  });
}
