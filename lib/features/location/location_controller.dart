import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/shared/camera_state.dart';

/// Controller for the Location Finder tile: image source + captured image +
/// resolved place name (via geocode service).
final locationControllerProvider =
    StateNotifierProvider<LocationController, CameraCaptureState>(
  (ref) => LocationController(),
);

class LocationController extends StateNotifier<CameraCaptureState> {
  LocationController() : super(const CameraCaptureState());

  void setImage(String path) {
    state = state.copyWith(imagePath: path);
  }

  void setPlace(String name) {
    state = state.copyWith(placeName: name);
  }

  void clear() => state = const CameraCaptureState();
}
