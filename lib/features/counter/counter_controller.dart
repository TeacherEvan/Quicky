import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Day Counter controller: target date persisted; ticks every second.
final counterControllerProvider =
    StateNotifierProvider<CounterController, CounterState>((ref) {
      return CounterController();
    });

class CounterState {
  const CounterState({this.target, this.remainingSeconds = 0});

  final DateTime? target;
  final int remainingSeconds;

  CounterState copyWith({DateTime? target, int? remainingSeconds}) {
    return CounterState(
      target: target ?? this.target,
      remainingSeconds: remainingSeconds ?? this.remainingSeconds,
    );
  }
}

class CounterController extends StateNotifier<CounterState> {
  CounterController() : super(const CounterState()) {
    _load();
  }

  static const _key = 'counter_target_ms';

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final ms = prefs.getInt(_key);
    if (ms != null) {
      state = state.copyWith(target: DateTime.fromMillisecondsSinceEpoch(ms));
      _tick();
    }
  }

  void setDays(int days) async {
    final target = DateTime.now().add(Duration(days: days));
    state = state.copyWith(target: target);
    _tick();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_key, target.millisecondsSinceEpoch);
  }

  void _tick() {
    if (state.target == null) return;
    state = state.copyWith(
      remainingSeconds: state.target!.difference(DateTime.now()).inSeconds,
    );
  }

  void startTicking() {
    // Driven by a Timer in the page; this recomputes remaining.
    _tick();
  }
}
