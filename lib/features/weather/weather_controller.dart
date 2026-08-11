import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'services/weather_service.dart';

/// Controller for Weather: holds the latest snapshot + loading flag.
final weatherControllerProvider =
    StateNotifierProvider<WeatherController, WeatherState>((ref) {
      return WeatherController();
    });

class WeatherState {
  const WeatherState({this.snapshot, this.loading = false});

  final WeatherSnapshot? snapshot;
  final bool loading;

  WeatherState copyWith({WeatherSnapshot? snapshot, bool? loading}) {
    return WeatherState(
      snapshot: snapshot ?? this.snapshot,
      loading: loading ?? this.loading,
    );
  }
}

class WeatherController extends StateNotifier<WeatherState> {
  WeatherController() : super(const WeatherState());

  Future<void> load() async {
    state = state.copyWith(loading: true);
    final snap = await WeatherService().fetch(13.7563, 100.5018);
    state = state.copyWith(snapshot: snap, loading: false);
  }
}
