import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/features/settings/settings_controller.dart';

import 'services/weather_service.dart';

/// Controller for Weather: holds the latest snapshot + loading flag.
final weatherControllerProvider =
    StateNotifierProvider<WeatherController, WeatherState>((ref) {
      return WeatherController(ref);
    });

class WeatherState {
  const WeatherState({this.snapshot, this.loading = false, this.units = 'C'});

  final WeatherSnapshot? snapshot;
  final bool loading;

  /// Unit scale of the current snapshot's display strings ('C' or 'F').
  final String units;

  WeatherState copyWith({
    WeatherSnapshot? snapshot,
    bool? loading,
    String? units,
  }) {
    return WeatherState(
      snapshot: snapshot ?? this.snapshot,
      loading: loading ?? this.loading,
      units: units ?? this.units,
    );
  }
}

class WeatherController extends StateNotifier<WeatherState> {
  WeatherController(this._ref) : super(const WeatherState());

  final Ref _ref;

  Future<void> load() async {
    state = state.copyWith(loading: true);
    final units = _ref.read(settingsControllerProvider).weatherUnits;
    final snap = await WeatherService().fetch(13.7563, 100.5018, units: units);
    state = state.copyWith(
      snapshot: snap,
      loading: false,
      units: units.toUpperCase(),
    );
  }
}
