import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:quicky/features/counter/counter_controller.dart';
import 'package:quicky/features/settings/settings_controller.dart';
import 'package:quicky/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('themeModeFromName', () {
    test('maps known names', () {
      expect(themeModeFromName('light'), ThemeMode.light);
      expect(themeModeFromName('dark'), ThemeMode.dark);
      expect(themeModeFromName('system'), ThemeMode.system);
    });

    test('unknown values fall back to system', () {
      expect(themeModeFromName('bogus'), ThemeMode.system);
    });
  });

  group('Settings → MaterialApp wiring', () {
    testWidgets('persisted theme reaches MaterialApp.themeMode', (
      tester) async {
      SharedPreferences.setMockInitialValues({'settings_theme': 'light'});
      await tester.pumpWidget(const ProviderScope(child: QuickyApp()));
      // Expire the splash safety timer, then settle the route transition.
      await tester.pump(const Duration(seconds: 7));
      await tester.pumpAndSettle();
      final app = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(app.themeMode, ThemeMode.light);
    });

    testWidgets('persisted language reaches MaterialApp.locale', (
      tester) async {
      SharedPreferences.setMockInitialValues({'settings_lang': 'th'});
      await tester.pumpWidget(const ProviderScope(child: QuickyApp()));
      await tester.pump(const Duration(seconds: 7));
      await tester.pumpAndSettle();
      final app = tester.widget<MaterialApp>(find.byType(MaterialApp));
      expect(app.locale, const Locale('th'));
    });
  });

  group('CounterController validation', () {
    test('rejects zero and negative days', () async {
      SharedPreferences.setMockInitialValues({});
      final controller = CounterController();
      await controller.setDays(-5);
      expect(controller.state.target, isNull);
      await controller.setDays(0);
      expect(controller.state.target, isNull);
      await controller.setDays(10);
      expect(controller.state.target, isNotNull);
    });
  });
}
