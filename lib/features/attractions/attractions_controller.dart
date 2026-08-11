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
  });

  final double radiusKm;
  final List<Attraction> places;
  final bool loading;

  AttractionsState copyWith({
    double? radiusKm,
    List<Attraction>? places,
    bool? loading,
  }) {
    return AttractionsState(
      radiusKm: radiusKm ?? this.radiusKm,
      places: places ?? this.places,
      loading: loading ?? this.loading,
    );
  }
}

class AttractionsController extends StateNotifier<AttractionsState> {
  AttractionsController() : super(const AttractionsState());

  static const radii = [0.0, 10.0, 40.0, 100.0];

  void setRadius(double km) {
    state = state.copyWith(radiusKm: km);
    load();
  }

  Future<void> load() async {
    state = state.copyWith(loading: true);
    final places = await PlacesService().fetchNearby(state.radiusKm);
    state = state.copyWith(places: places, loading: false);
  }
}
