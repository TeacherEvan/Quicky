import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:quicky/shared/camera_state.dart';

/// Controller for the Cost Translator tile: manages camera lifecycle and the
/// captured image + the displayed Thai phrase. (OCR/translation is a future
/// integration; for now the phrase is a static helper so the UI is complete.)
final costControllerProvider =
    StateNotifierProvider<CostController, CameraCaptureState>(
      (ref) => CostController(),
    );

class CostController extends StateNotifier<CameraCaptureState> {
  CostController() : super(const CameraCaptureState());

  void setImage(String path) {
    state = state.copyWith(imagePath: path);
  }

  void setPhrase(String phrase) {
    state = state.copyWith(thaiPhrase: phrase);
  }

  void clear() => state = const CameraCaptureState();
}
