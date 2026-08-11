import 'package:flutter_test/flutter_test.dart';
import 'package:quicky/features/attractions/attractions_controller.dart';
import 'package:quicky/features/bathroom/bathroom_controller.dart';
import 'package:quicky/features/counter/counter_controller.dart';
import 'package:quicky/features/settings/settings_controller.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  SharedPreferences.setMockInitialValues({});

  test('BathroomController toggles and persists default true', () async {
    final c = BathroomController();
    await Future<void>.delayed(Duration.zero);
    expect(c.state, isTrue);
    await c.toggle();
    expect(c.state, isFalse);
  });

  test('CounterController.setDays sets a future target', () async {
    final c = CounterController();
    await Future<void>.delayed(Duration.zero);
    c.setDays(5);
    expect(c.state.target, isNotNull);
    expect(c.state.remainingSeconds, greaterThan(0));
  });

  test('AttractionsController radii constant', () {
    expect(AttractionsController.radii, containsAll([0.0, 10.0, 40.0, 100.0]));
  });

  test('SettingsState copyWith isolates fields', () {
    const s = SettingsState();
    final next = s.copyWith(language: 'th');
    expect(next.language, 'th');
    expect(next.themeMode, 'system');
  });
}
