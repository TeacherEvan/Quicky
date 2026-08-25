import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'services/places_service.dart';

/// Controller for Attractions: selected radius + loaded places list.
final attractionsControllerProvider =
    StateNotifierProvider<AttractionsController, AttractionsState>(
      (ref) => AttractionsController(),
    );

class AttractionsState {
  const AttractionsState({
    this.radiusKm = 10,
    this.places = const [],
    this.loading = false,
    this.error = false,
  });

  final double radiusKm;
  final List<Attraction> places;
  final bool loading;

  /// True when the last fetch failed outright (no fallback data at all).
  final bool error;

  /// True when any row in [places] came from the mock fallback; the UI must
  /// disclose sample data so it is never mistaken for live results.
  bool get showingMock => !loading && places.any((p) => p.isMock);

  AttractionsState copyWith({
    double? radiusKm,
    List<Attraction>? places,
    bool? loading,
    bool? error,
  }) {
    return AttractionsState(
      radiusKm: radiusKm ?? this.radiusKm,
      places: places ?? this.places,
      loading: loading ?? this.loading,
      error: error ?? this.error,
    );
  }
}

class AttractionsController extends StateNotifier<AttractionsState> {
  AttractionsController() : super(const AttractionsState());

  static const radii = [0.0, 10.0, 40.0, 100.0];

  /// Monotonic token so a slow stale response can never overwrite a newer
  /// selection's results.
  int _requestId = 0;

  void setRadius(double km) {
    state = state.copyWith(radiusKm: km);
    load();
  }

  Future<void> load() async {
    final request = ++_requestId;
    state = state.copyWith(loading: true, error: false);
    try {
      final places = await PlacesService().fetchNearby(state.radiusKm);
      if (request != _requestId) return; // a newer request superseded this one
      state = state.copyWith(places: places, loading: false);
    } on Exception {
      if (request != _requestId) return;
      state = state.copyWith(loading: false, error: true);
    }
  }
}
