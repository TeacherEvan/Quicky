import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Bathroom toggle: remembers the last selected facility (male/female).
final bathroomControllerProvider =
    StateNotifierProvider<BathroomController, bool>((ref) {
  return BathroomController();
});

class BathroomController extends StateNotifier<bool> {
  BathroomController() : super(true) {
    _load();
  }

  static const _key = 'bathroom_isMale';

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    state = prefs.getBool(_key) ?? true;
  }

  Future<void> toggle() async {
    state = !state;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_key, state);
  }
}
